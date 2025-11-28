/**
 * Update to Public URL
 * Detects if page is public and updates website link
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const PORTFOLIO_HTML = path.resolve(__dirname, '../../index.html');

async function updateToPublicUrl() {
    console.log('🔍 Checking for Public URL...\n');

    try {
        // Find Wiki Index
        const searchResults = await notion.search({
            query: 'Wiki Index',
            filter: { property: 'object', value: 'page' }
        });

        let wikiIndexPage = null;
        for (const page of searchResults.results) {
            const title = page.properties?.title?.title?.[0]?.plain_text || '';
            if (title === 'Wiki Index') {
                wikiIndexPage = page;
                break;
            }
        }

        if (!wikiIndexPage) {
            console.log('❌ Wiki Index not found!');
            console.log('💡 Run: npm run sync:super first\n');
            return;
        }

        console.log('✅ Found Wiki Index!');
        console.log(`   Page ID: ${wikiIndexPage.id}\n`);

        // Get page URL
        const pageUrl = wikiIndexPage.url;
        console.log('📋 Current URL:');
        console.log(`   ${pageUrl}\n`);

        // Check if public (notion.site domain)
        const isPublic = pageUrl.includes('.notion.site');

        if (isPublic) {
            console.log('✅ Page is PUBLIC! (notion.site domain)\n');
        } else {
            console.log('⚠️  Page appears to be PRIVATE (notion.so domain)\n');
            console.log('📝 To make it public:');
            console.log('   1. Open: ' + pageUrl);
            console.log('   2. Click "Share" → "Share to web" → ON');
            console.log('   3. Copy the new public URL');
            console.log('   4. Run this script again\n');

            console.log('💡 Or manually update index.html with the public URL\n');
            return;
        }

        // Update index.html
        console.log('📋 Updating website link...\n');

        let html = await fs.readFile(PORTFOLIO_HTML, 'utf-8');

        // Pattern to find the Visit Wiki button
        const patterns = [
            // Pattern 1: Current Notion link
            /href="https:\/\/[^"]*notion\.(so|site)\/[^"]*"\s+target="_blank"\s+class="btn custom-btn custom-btn-bg custom-btn-link">Visit Wiki/g,
            // Pattern 2: Any old link
            /href="[^"]*"\s+target="_blank"\s+class="btn custom-btn custom-btn-bg custom-btn-link">Visit Wiki/g
        ];

        let updated = false;
        for (const pattern of patterns) {
            if (pattern.test(html)) {
                html = html.replace(
                    pattern,
                    `href="${pageUrl}" target="_blank" class="btn custom-btn custom-btn-bg custom-btn-link">Visit Wiki`
                );
                updated = true;
                break;
            }
        }

        if (updated) {
            await fs.writeFile(PORTFOLIO_HTML, html, 'utf-8');
            console.log('✅ Website updated successfully!\n');
            console.log('🔗 New link:');
            console.log(`   ${pageUrl}\n`);
            console.log('✨ Next steps:');
            console.log('   1. Open index.html in browser');
            console.log('   2. Click "Visit Wiki" button');
            console.log('   3. Should open Notion WITHOUT login! ✅\n');
            console.log('💡 Test in incognito browser to verify!\n');
        } else {
            console.log('⚠️  Could not find link pattern to update');
            console.log('💡 Manually update this in index.html:\n');
            console.log(`   href="${pageUrl}"\n`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updateToPublicUrl();
