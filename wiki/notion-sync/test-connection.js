/**
 * Test Notion API Connection
 * This script verifies the Notion API key and lists available pages
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

async function testConnection() {
    console.log('🔍 Testing Notion API Connection...\n');

    try {
        // Test 1: List users (to verify API key works)
        console.log('📋 Step 1: Verifying API Key...');
        const users = await notion.users.list({});
        console.log('✅ API Key is valid!');
        console.log(`   Found ${users.results.length} user(s) in workspace\n`);

        // Test 2: Search for pages
        console.log('📋 Step 2: Searching for existing pages...');
        const searchResults = await notion.search({
            filter: {
                property: 'object',
                value: 'page'
            },
            page_size: 10
        });

        console.log(`✅ Found ${searchResults.results.length} page(s):\n`);

        if (searchResults.results.length > 0) {
            searchResults.results.forEach((page, index) => {
                const title = page.properties?.title?.title?.[0]?.plain_text ||
                    page.properties?.Name?.title?.[0]?.plain_text ||
                    'Untitled';
                console.log(`   ${index + 1}. ${title}`);
                console.log(`      ID: ${page.id}`);
                console.log(`      URL: ${page.url}\n`);
            });
        } else {
            console.log('   No pages found yet. This is normal for a new workspace.\n');
        }

        // Test 3: Get workspace info
        console.log('📋 Step 3: Workspace Information...');
        const botUser = await notion.users.me();
        console.log(`✅ Bot User: ${botUser.name || 'Wiki Sync Bot'}`);
        console.log(`   Type: ${botUser.type}`);

        console.log('\n✨ Connection test completed successfully!');
        console.log('🚀 Ready to sync wiki to Notion!\n');

        return true;
    } catch (error) {
        console.error('❌ Error testing connection:');
        console.error(`   ${error.message}\n`);

        if (error.code === 'unauthorized') {
            console.log('💡 Tip: Make sure your API key is correct in .env file');
            console.log('💡 Tip: Ensure the integration has access to the pages');
        }

        return false;
    }
}

// Run the test
testConnection();
