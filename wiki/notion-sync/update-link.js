/**
 * Update Portfolio Website Link
 * Updates the "Visit Wiki" button to point to Notion Wiki Index
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

const PORTFOLIO_HTML = path.resolve(__dirname, '../../index.html');

async function updatePortfolioLink() {
    console.log('🔄 Updating Portfolio Website Link...\n');

    try {
        // Step 1: Find Wiki Index page
        console.log('📋 Step 1: Searching for Wiki Index in Notion...');
        const searchResults = await notion.search({
            query: 'Wiki Index',
            filter: { property: 'object', value: 'page' }
        });

        let wikiIndexUrl = null;
        for (const page of searchResults.results) {
            const title = page.properties?.title?.title?.[0]?.plain_text || '';
            if (title === 'Wiki Index') {
                wikiIndexUrl = page.url;
                break;
            }
        }

        if (!wikiIndexUrl) {
            console.log('❌ Wiki Index not found. Options:');
            console.log('   1. Wait for sync to complete');
            console.log('   2. Run: npm run sync');
            console.log('   3. Or manually create "Wiki Index" page in Notion\n');
            return;
        }

        console.log(`✅ Found Wiki Index: ${wikiIndexUrl}\n`);

        // Step 2: Read portfolio HTML
        console.log('📋 Step 2: Reading portfolio HTML...');
        let html = await fs.readFile(PORTFOLIO_HTML, 'utf-8');

        // Step 3: Update the link
        console.log('📋 Step 3: Updating link...');

        // Pattern 1: Current Notion link (if exists)
        const notionLinkPattern = /href="https:\/\/www\.notion\.so\/[^"]+"\s+target="_blank"\s+class="btn custom-btn custom-btn-bg custom-btn-link">Visit Wiki/g;

        // Pattern 2: Old local wiki link
        const localLinkPattern = /href="wiki\/index\.html"\s+class="btn custom-btn custom-btn-bg custom-btn-link">Visit\s+Wiki/g;

        const newLink = `href="${wikiIndexUrl}" target="_blank" class="btn custom-btn custom-btn-bg custom-btn-link">Visit Wiki`;

        let updated = false;

        if (notionLinkPattern.test(html)) {
            html = html.replace(notionLinkPattern, newLink);
            updated = true;
            console.log('   ✅ Updated existing Notion link');
        } else if (localLinkPattern.test(html)) {
            html = html.replace(localLinkPattern, newLink);
            updated = true;
            console.log('   ✅ Updated local wiki link to Notion');
        } else {
            console.log('   ⚠️  Could not find link pattern to update');
            console.log('   💡 You may need to manually update the link in index.html');
            return;
        }

        if (updated) {
            // Step 4: Write back to file
            console.log('📋 Step 4: Saving changes...');
            await fs.writeFile(PORTFOLIO_HTML, html, 'utf-8');
            console.log('✅ Successfully updated!\n');

            console.log('🎉 Portfolio website now links to:');
            console.log(`   ${wikiIndexUrl}\n`);

            console.log('💡 Next steps:');
            console.log('   1. Refresh your portfolio website');
            console.log('   2. Click "Visit Wiki" button');
            console.log('   3. Should open Notion Wiki Index! ✨\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
}

updatePortfolioLink();
