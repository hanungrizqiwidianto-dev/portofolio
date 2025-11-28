/**
 * Get Notion Wiki URL
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

async function getWikiUrl() {
    try {
        const searchResults = await notion.search({
            filter: { property: 'object', value: 'page' },
            page_size: 20
        });

        console.log('🔍 Notion Pages Found:\n');

        let wikiIndexUrl = null;

        searchResults.results.forEach(page => {
            const title = page.properties?.title?.title?.[0]?.plain_text ||
                page.properties?.Name?.title?.[0]?.plain_text ||
                'Untitled';

            console.log(`📄 ${title}`);
            console.log(`   URL: ${page.url}\n`);

            if (title === 'Wiki Index') {
                wikiIndexUrl = page.url;
            }
        });

        if (wikiIndexUrl) {
            console.log('\n✅ Wiki Index Found!');
            console.log(`🔗 Main Wiki URL: ${wikiIndexUrl}\n`);
            console.log('Use this URL in your portfolio website!');
        } else {
            console.log('\n⚠️  Wiki Index not found yet (sync might still be running)');
            console.log('You can use the first page URL temporarily:\n');
            if (searchResults.results.length > 0) {
                console.log(`🔗 Temporary URL: ${searchResults.results[0].url}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

getWikiUrl();
