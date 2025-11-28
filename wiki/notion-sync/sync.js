/**
 * Main Sync Script
 * Syncs all wiki pages to Notion automatically
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

async function syncWikiToNotion() {
    console.log('🚀 Starting Wiki to Notion Sync...\n');
    console.log(`📂 Wiki path: ${WIKI_PATH}\n`);

    try {
        // Step 0: Get root page that integration has access to
        console.log('📋 Step 0: Finding accessible page for root...');
        const rootPageId = await getAccessiblePage();
        console.log(`✅ Using page ${rootPageId} as root\n`);

        // Step 1: Scan for all HTML files
        console.log('📋 Step 1: Scanning wiki directory...');
        const files = await scanWikiDirectory(WIKI_PATH);
        console.log(`✅ Found ${files.length} wiki page(s)\n`);

        if (files.length === 0) {
            console.log('⚠️  No HTML files found. Please check the wiki path.');
            return;
        }

        // Step 2: Group files by category (parent folder)
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

        // Step 3: Create parent pages for each category
        console.log('📋 Step 3: Creating category pages...');
        const categoryPages = {};

        for (const categoryName of Object.keys(categorized)) {
            const formattedName = categoryName
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            categoryPages[categoryName] = await findOrCreateParentPage(formattedName, rootPageId);

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        console.log('');

        // Step 4: Process each wiki page
        console.log('📋 Step 4: Syncing wiki pages...');
        let successCount = 0;
        let errorCount = 0;

        for (const [category, files] of Object.entries(categorized)) {
            console.log(`\n📁 Processing category: ${category}`);
            const parentId = categoryPages[category];

            for (const file of files) {
                try {
                    console.log(`   📄 Processing: ${file.fileName}`);

                    // Parse HTML
                    const parsed = await parseHtmlFile(file.fullPath);

                    if (!parsed || !parsed.title) {
                        console.log(`   ⚠️  Skipped: Could not extract title from ${file.fileName}`);
                        continue;
                    }

                    // Convert to Notion blocks
                    const blocks = convertToNotionBlocks(parsed);

                    if (blocks.length === 0) {
                        console.log(`   ⚠️  Skipped: No content extracted from ${file.fileName}`);
                        continue;
                    }

                    // Create/update page in Notion
                    await createOrUpdatePage(
                        parsed.title,
                        blocks,
                        parentId,
                        { category: parsed.category }
                    );

                    successCount++;

                    // Rate limiting - wait 333ms between requests (max 3 req/sec for free tier)
                    await new Promise(resolve => setTimeout(resolve, 333));

                } catch (error) {
                    console.error(`   ❌ Error processing ${file.fileName}:`, error.message);
                    errorCount++;
                }
            }
        }

        console.log('');

        // Step 5: Create index/navigation page
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
        console.log('✨ Sync Complete!\n');
        console.log('📊 Summary:');
        console.log(`   ✅ Successfully synced: ${successCount} page(s)`);
        console.log(`   ❌ Errors: ${errorCount} page(s)`);
        console.log(`   📁 Categories: ${Object.keys(categoryPages).length}`);
        console.log('');
        console.log('🔗 Check your Notion workspace to see the synced wiki!');
        console.log('');

    } catch (error) {
        console.error('❌ Fatal error during sync:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run sync
syncWikiToNotion();
