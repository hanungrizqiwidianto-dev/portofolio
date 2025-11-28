/**
 * View Sync Results
 * Lists all pages created by the sync
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

async function viewSyncResults() {
    console.log('📊 Viewing Sync Results\n');

    try {
        // Search for all pages
        const searchResults = await notion.search({
            filter: {
                property: 'object',
                value: 'page'
            },
            page_size: 100
        });

        console.log(`✅ Found ${searchResults.results.length} page(s) in Notion:\n`);

        // Group by parent
        const categories = {};
        let indexPage = null;

        for (const page of searchResults.results) {
            const title = page.properties?.title?.title?.[0]?.plain_text ||
                page.properties?.Name?.title?.[0]?.plain_text ||
                'Untitled';

            if (title === 'Wiki Index') {
                indexPage = page;
                continue;
            }

            // Check if it's a category page (has children)
            const parent = page.parent?.page_id;

            if (!parent || !categories[parent]) {
                // This is a category page
                categories[title] = {
                    id: page.id,
                    url: page.url,
                    children: []
                };
            }
        }

        // Second pass to find children
        for (const page of searchResults.results) {
            const title = page.properties?.title?.title?.[0]?.plain_text ||
                page.properties?.Name?.title?.[0]?.plain_text ||
                'Untitled';

            if (title === 'Wiki Index') continue;

            const parentId = page.parent?.page_id;

            // Find which category this belongs to
            for (const [catName, catData] of Object.entries(categories)) {
                if (catData.id === parentId) {
                    catData.children.push({
                        title,
                        url: page.url
                    });
                    break;
                }
            }
        }

        // Display results
        if (indexPage) {
            console.log('📖 Wiki Index');
            console.log(`   🔗 ${indexPage.url}\n`);
        }

        console.log('📁 Categories and Pages:\n');

        for (const [categoryName, categoryData] of Object.entries(categories)) {
            console.log(`📂 ${categoryName} (${categoryData.children.length} pages)`);
            console.log(`   🔗 ${categoryData.url}`);

            if (categoryData.children.length > 0) {
                categoryData.children.forEach(child => {
                    console.log(`      📄 ${child.title}`);
                });
            }
            console.log('');
        }

        console.log(`\n📊 Total: ${Object.keys(categories).length} categories, ${searchResults.results.length} total pages`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

viewSyncResults();
