/**
 * Fast Sync Script
 * Optimized version with parallel processing and resume capability
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseHtmlFile, convertToNotionBlocks, scanWikiDirectory } from './parser.js';
import { getAccessiblePage, findOrCreateParentPage, createOrUpdatePage, createIndexPage } from './notion-manager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WIKI_PATH = path.resolve(__dirname, process.env.WIKI_PATH || '../pages');

// Configuration
const BATCH_SIZE = 3; // Process 3 pages in parallel
const DELAY_BETWEEN_BATCHES = 1000; // 1 second between batches (3 pages/sec total)

async function syncWikiToNotionFast() {
    console.log('⚡ Starting FAST Wiki to Notion Sync...\n');
    console.log(`📂 Wiki path: ${WIKI_PATH}`);
    console.log(`⚙️  Batch size: ${BATCH_SIZE} pages in parallel`);
    console.log(`⏱️  Delay: ${DELAY_BETWEEN_BATCHES}ms between batches\n`);

    try {
        // Step 0: Get root page
        console.log('📋 Step 0: Finding accessible page for root...');
        const rootPageId = await getAccessiblePage();
        console.log(`✅ Using page ${rootPageId} as root\n`);

        // Step 1: Scan files
        console.log('📋 Step 1: Scanning wiki directory...');
        const files = await scanWikiDirectory(WIKI_PATH);
        console.log(`✅ Found ${files.length} wiki page(s)\n`);

        if (files.length === 0) {
            console.log('⚠️  No HTML files found.');
            return;
        }

        // Step 2: Group by category
        console.log('📋 Step 2: Grouping by categories...');
        const categorized = {};

        files.forEach(file => {
            const parts = file.relativePath.split(path.sep);
            const category = parts.length > 1 ? parts[0] : 'General';

            if (!categorized[category]) {
                categorized[category] = [];
            }
            categorized[category].push(file);
        });

        console.log(`✅ Found ${Object.keys(categorized).length} categorie(s):`);
        Object.keys(categorized).forEach(cat => {
            console.log(`   - ${cat} (${categorized[cat].length} page(s))`);
        });
        console.log('');

        // Step 3: Create category pages (parallel)
        console.log('📋 Step 3: Creating category pages...');
        const categoryPages = {};
        const categoryNames = Object.keys(categorized);

        // Create categories in batches
        for (let i = 0; i < categoryNames.length; i += BATCH_SIZE) {
            const batch = categoryNames.slice(i, i + BATCH_SIZE);

            await Promise.all(batch.map(async (categoryName) => {
                const formattedName = categoryName
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                categoryPages[categoryName] = await findOrCreateParentPage(formattedName, rootPageId);
            }));

            if (i + BATCH_SIZE < categoryNames.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }
        console.log('');

        // Step 4: Process wiki pages (parallel batches)
        console.log('📋 Step 4: Syncing wiki pages (FAST MODE)...\n');
        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        // Flatten all files with their parent info
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

        console.log(`📊 Processing ${allFiles.length} pages in batches of ${BATCH_SIZE}...\n`);

        // Process in batches
        for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
            const batch = allFiles.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(allFiles.length / BATCH_SIZE);

            console.log(`🔄 Batch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, allFiles.length)} of ${allFiles.length})`);

            const results = await Promise.allSettled(
                batch.map(async (file) => {
                    try {
                        // Parse HTML
                        const parsed = await parseHtmlFile(file.fullPath);

                        if (!parsed || !parsed.title) {
                            console.log(`   ⚠️  Skipped: ${file.fileName} (no title)`);
                            return { status: 'skipped', file: file.fileName };
                        }

                        // Convert to Notion blocks
                        const blocks = convertToNotionBlocks(parsed);

                        if (blocks.length === 0) {
                            console.log(`   ⚠️  Skipped: ${file.fileName} (no content)`);
                            return { status: 'skipped', file: file.fileName };
                        }

                        // Create/update page
                        await createOrUpdatePage(
                            parsed.title,
                            blocks,
                            file.parentId,
                            { category: parsed.category }
                        );

                        console.log(`   ✅ ${parsed.title}`);
                        return { status: 'success', file: file.fileName, title: parsed.title };

                    } catch (error) {
                        console.error(`   ❌ Error: ${file.fileName} - ${error.message}`);
                        return { status: 'error', file: file.fileName, error: error.message };
                    }
                })
            );

            // Count results
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    const value = result.value;
                    if (value.status === 'success') successCount++;
                    else if (value.status === 'skipped') skippedCount++;
                    else if (value.status === 'error') errorCount++;
                } else {
                    errorCount++;
                }
            });

            console.log(`   Progress: ✅ ${successCount} | ⚠️ ${skippedCount} | ❌ ${errorCount}\n`);

            // Delay between batches (except last batch)
            if (i + BATCH_SIZE < allFiles.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }

        // Step 5: Create index page
        console.log('📋 Step 5: Creating navigation index...');

        const formattedCategories = {};
        for (const [key, value] of Object.entries(categoryPages)) {
            const formattedName = key
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            formattedCategories[formattedName] = value;
        }

        await createIndexPage(formattedCategories, rootPageId);
        console.log('');

        // Summary
        const totalProcessed = successCount + errorCount + skippedCount;
        const successRate = totalProcessed > 0 ? ((successCount / totalProcessed) * 100).toFixed(1) : 0;

        console.log('✨ FAST Sync Complete!\n');
        console.log('📊 Summary:');
        console.log(`   ✅ Successfully synced: ${successCount} page(s)`);
        console.log(`   ⚠️  Skipped: ${skippedCount} page(s)`);
        console.log(`   ❌ Errors: ${errorCount} page(s)`);
        console.log(`   📁 Categories: ${Object.keys(categoryPages).length}`);
        console.log(`   📈 Success rate: ${successRate}%`);
        console.log('');
        console.log('🔗 Check your Notion workspace to see the synced wiki!');
        console.log('💡 Run "npm run get-url" to get public URLs');
        console.log('📖 Remember to make pages public in Notion (see MAKE-PUBLIC.md)');
        console.log('');

    } catch (error) {
        console.error('❌ Fatal error during sync:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run sync
syncWikiToNotionFast();
