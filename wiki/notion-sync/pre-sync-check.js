/**
 * Pre-Sync Check
 * Verifies setup before running full sync
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function preSyncCheck() {
    console.log('🔍 Pre-Sync Verification\n');

    try {
        // Check 1: API Key
        console.log('✅ Step 1: Verifying API Key...');
        await notion.users.list({});
        console.log('   API key is valid\n');

        // Check 2: Integration access
        console.log('⚠️  Step 2: Integration Access Check\n');
        console.log('   Before syncing, you MUST connect the integration to your Notion page:\n');
        console.log('   📌 Steps:');
        console.log('      1. Open your Notion workspace');
        console.log('      2. Create or open a page where you want the wiki');
        console.log('      3. Click ⋯ (three dots) → Connections');
        console.log('      4. Search for "Wiki Portofolio"');
        console.log('      5. Click "Connect"\n');

        const answer = await askQuestion('   Have you connected the integration? (y/n): ');

        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            console.log('\n❌ Please connect the integration first!');
            console.log('   See QUICKSTART.md for detailed instructions.\n');
            rl.close();
            process.exit(0);
        }

        // Check 3: Try to search pages
        console.log('\n✅ Step 3: Testing integration access...');
        const searchResults = await notion.search({
            filter: { property: 'object', value: 'page' },
            page_size: 5
        });

        if (searchResults.results.length === 0) {
            console.log('   ⚠️  No pages found. This might mean:');
            console.log('      - This is your first sync (normal)');
            console.log('      - Integration not connected yet\n');

            const proceed = await askQuestion('   Continue anyway? (y/n): ');
            if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
                console.log('\n❌ Sync cancelled. Connect integration and try again.\n');
                rl.close();
                process.exit(0);
            }
        } else {
            console.log(`   ✅ Integration can access ${searchResults.results.length} page(s)\n`);
        }

        console.log('✨ Pre-check complete! Starting sync...\n');
        rl.close();
        return true;

    } catch (error) {
        console.error('\n❌ Error:', error.message);

        if (error.code === 'unauthorized') {
            console.log('\n💡 Possible issues:');
            console.log('   - API key is incorrect');
            console.log('   - Integration not properly set up\n');
        }

        rl.close();
        process.exit(1);
    }
}

preSyncCheck();
