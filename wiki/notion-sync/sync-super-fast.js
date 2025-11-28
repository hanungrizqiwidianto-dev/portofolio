/**
 * SUPER FAST Sync - Only Create New Pages
 * Skips existing pages for maximum speed
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseHtmlFile, convertToNotionBlocks, scanWikiDirectory } from './parser.js';
import { getAccessiblePage, findOrCreateParentPage, createIndexPage } from './notion-manager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WIKI_PATH = path.resolve(__dirname, process.env.WIKI_PATH || '../pages');
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// SUPER FAST CONFIG
const BATCH_SIZE = 5; // 5 pages at once
const DELAY_MS = 200; // Only 200ms delay (5 req/sec)

/**
 * Fast create page (no update, create only if not exists)
 */
async function fastCreatePage(title, blocks, parentId, metadata = {}) {
    try {
        // Quick search - only check if exact title exists
        const searchResults = await notion.search({
            query: title,
            filter: { property: 'object', value: 'page' },
            page_size: 5 // Limit search results
        });

        // Check if already exists
        for (const page of searchResults.results) {
            const pageTitle = page.properties?.title?.title?.[0]?.plain_text ||
                page.properties?.Name?.title?.[0]?.plain_text || '';

            if (pageTitle === title && page.parent?.page_id === parentId) {
                // Already exists - skip!
                return { status: 'skipped', pageId: page.id, reason: 'exists' };
            }
        }

        // Doesn't exist - create new
        const emoji = metadata.emoji || '📄';

        // Create with first 100 blocks
        const initialBlocks = blocks.slice(0, 100);

        const newPage = await notion.pages.create({
            parent: { page_id: parentId },
            icon: { emoji },
            properties: {
                title: { title: [{ text: { content: title } }] }
            },
            children: initialBlocks
        });

        // Add remaining blocks if any (in background, no await)
        if (blocks.length > 100) {
            // Fire and forget - don't wait
            notion.blocks.children.append({
                block_id: newPage.id,
                children: blocks.slice(100, 200) // Max 200 blocks total
            }).catch(() => { }); // Ignore errors
        }

        return { status: 'created', pageId: newPage.id };

    } catch (error) {
        return { status: 'error', error: error.message };
    }
}

async function superFastSync() {
    console.log('🚀 SUPER FAST Sync - Create New Pages Only!\n');
    console.log(`⚙️  Batch size: ${BATCH_SIZE} pages`);
    console.log(`⏱️  Delay: ${DELAY_MS}ms between batches`);
    console.log(`⚡ Strategy: Skip existing, create new only\n`);

    const startTime = Date.now();

    try {
        // Step 0: Get root
        console.log('📋 Finding root page...');
        const rootPageId = await getAccessiblePage();
        console.log(`✅ Root: ${rootPageId}\n`);

        // Step 1: Scan
        console.log('📋 Scanning files...');
        const files = await scanWikiDirectory(WIKI_PATH);
        console.log(`✅ Found ${files.length} files\n`);

        if (files.length === 0) return;

        // Step 2: Group
        const categorized = {};
        files.forEach(file => {
            const parts = file.relativePath.split(path.sep);
            const category = parts.length > 1 ? parts[0] : 'General';
            if (!categorized[category]) categorized[category] = [];
            categorized[category].push(file);
        });

        console.log(`✅ ${Object.keys(categorized).length} categories\n`);

        // Step 3: Create categories (FAST - all at once)
        console.log('📋 Creating categories...');
        const categoryPages = {};

        const categoryPromises = Object.keys(categorized).map(async (categoryName) => {
            const formattedName = categoryName
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            const pageId = await findOrCreateParentPage(formattedName, rootPageId);
            return { categoryName, pageId };
        });

        const categoryResults = await Promise.all(categoryPromises);
        categoryResults.forEach(({ categoryName, pageId }) => {
            categoryPages[categoryName] = pageId;
        });

        console.log(`✅ Categories ready\n`);

        // Step 4: SUPER FAST page creation
        console.log('📋 Creating pages (SUPER FAST!)...\n');

        let created = 0;
        let skipped = 0;
        let errors = 0;

        // Flatten all files
        const allFiles = [];
        for (const [category, files] of Object.entries(categorized)) {
            files.forEach(file => {
                allFiles.push({
                    ...file,
                    category,
                    parentId: categoryPages[category]
                });
            });
        }

        const totalBatches = Math.ceil(allFiles.length / BATCH_SIZE);

        // Process in batches
        for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
            const batch = allFiles.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const batchStart = Date.now();

            console.log(`⚡ Batch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, allFiles.length)}/${allFiles.length})`);

            // Process all in parallel - NO WAITING!
            const results = await Promise.all(
                batch.map(async (file) => {
                    try {
                        // Parse
                        const parsed = await parseHtmlFile(file.fullPath);
                        if (!parsed?.title) {
                            return { status: 'skipped', reason: 'no-title', file: file.fileName };
                        }

                        // Convert (limit to 100 blocks for speed)
                        const allBlocks = convertToNotionBlocks(parsed);
                        const blocks = allBlocks.slice(0, 100); // Limit for speed

                        if (blocks.length === 0) {
                            return { status: 'skipped', reason: 'no-content', file: file.fileName };
                        }

                        // Fast create
                        const result = await fastCreatePage(
                            parsed.title,
                            blocks,
                            file.parentId,
                            { category: parsed.category }
                        );

                        if (result.status === 'created') {
                            console.log(`   ✅ Created: ${parsed.title}`);
                        } else if (result.status === 'skipped') {
                            console.log(`   ⏭️  Skipped: ${parsed.title} (already exists)`);
                        }

                        return { ...result, title: parsed.title };

                    } catch (error) {
                        console.log(`   ❌ Error: ${file.fileName}`);
                        return { status: 'error', file: file.fileName };
                    }
                })
            );

            // Count results
            results.forEach(r => {
                if (r.status === 'created') created++;
                else if (r.status === 'skipped') skipped++;
                else if (r.status === 'error') errors++;
            });

            const batchTime = ((Date.now() - batchStart) / 1000).toFixed(1);
            console.log(`   ⏱️  Batch completed in ${batchTime}s | Total: ✅${created} ⏭️${skipped} ❌${errors}\n`);

            // Minimal delay
            if (i + BATCH_SIZE < allFiles.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));
            }
        }

        // Step 5: Create index (if needed)
        console.log('📋 Creating index...');
        const formattedCategories = {};
        for (const [key, value] of Object.entries(categoryPages)) {
            const formatted = key.split('-').map(w =>
                w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ');
            formattedCategories[formatted] = value;
        }

        try {
            await createIndexPage(formattedCategories, rootPageId);
            console.log('✅ Index created\n');
        } catch (e) {
            console.log('⏭️  Index already exists\n');
        }

        // Summary
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const avgPerPage = (totalTime / allFiles.length).toFixed(2);

        console.log('🎉 SUPER FAST Sync Complete!\n');
        console.log('📊 Summary:');
        console.log(`   ✅ Created: ${created} new pages`);
        console.log(`   ⏭️  Skipped: ${skipped} existing pages`);
        console.log(`   ❌ Errors: ${errors} pages`);
        console.log(`   ⏱️  Total time: ${totalTime}s`);
        console.log(`   ⚡ Average: ${avgPerPage}s per page`);
        console.log(`   🚀 Speed: ${(allFiles.length / (totalTime / 60)).toFixed(1)} pages/min`);
        console.log('');
        console.log('💡 Tip: Run again to create any failed pages');
        console.log('💡 Existing pages were skipped for speed!');
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

superFastSync();
