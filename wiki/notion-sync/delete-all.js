/**
 * Delete All Wiki Pages
 * Safely deletes all wiki-related pages except the root page
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function deleteAllWikiPages() {
    console.log('🗑️  Starting deletion of all wiki pages...\n');
    console.log('⚠️  This will delete ALL pages created by sync!\n');

    const startTime = Date.now();
    let deletedCount = 0;
    let errorCount = 0;

    try {
        // Get all pages
        console.log('📋 Fetching all pages...');
        const searchResults = await notion.search({
            filter: { property: 'object', value: 'page' },
            page_size: 100
        });

        const pages = searchResults.results;
        console.log(`✅ Found ${pages.length} total page(s)\n`);

        if (pages.length === 0) {
            console.log('✅ No pages to delete!\n');
            return;
        }

        // Identify wiki pages (exclude the original root page if needed)
        const wikiPages = [];
        const categoryNames = [
            'Wiki Index', 'Backend', 'Frontend', 'Database', 'DevOps',
            'Docker', 'Dotnet', 'Go', 'Kubernetes', 'Microservices',
            'Nodejs', 'Patterns', 'Python', 'Architecture', 'General'
        ];

        for (const page of pages) {
            const title = page.properties?.title?.title?.[0]?.plain_text ||
                page.properties?.Name?.title?.[0]?.plain_text || '';

            // Check if it's a wiki page or child
            const isWikiPage =
                categoryNames.some(cat => title.includes(cat)) ||
                title.includes('Pattern') ||
                title.includes('Architecture') ||
                title.includes('Framework') ||
                page.parent?.type === 'page_id'; // Has a parent (is a child page)

            if (isWikiPage && title !== 'WIKI') {
                wikiPages.push({ id: page.id, title });
            }
        }

        console.log(`🎯 Identified ${wikiPages.length} wiki page(s) to delete\n`);

        if (wikiPages.length === 0) {
            console.log('✅ No wiki pages found to delete!\n');
            return;
        }

        // Confirm deletion
        console.log('📝 Pages to be deleted:');
        wikiPages.slice(0, 10).forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.title}`);
        });
        if (wikiPages.length > 10) {
            console.log(`   ... and ${wikiPages.length - 10} more`);
        }
        console.log('');

        // Delete in batches
        console.log('🗑️  Starting deletion...\n');
        const BATCH_SIZE = 5;

        for (let i = 0; i < wikiPages.length; i += BATCH_SIZE) {
            const batch = wikiPages.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(wikiPages.length / BATCH_SIZE);

            console.log(`🔄 Batch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, wikiPages.length)}/${wikiPages.length})`);

            const results = await Promise.allSettled(
                batch.map(async (page) => {
                    try {
                        await notion.pages.update({
                            page_id: page.id,
                            archived: true
                        });
                        console.log(`   ✅ Deleted: ${page.title}`);
                        return { status: 'success' };
                    } catch (error) {
                        console.log(`   ❌ Error: ${page.title} - ${error.message}`);
                        return { status: 'error' };
                    }
                })
            );

            // Count results
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value.status === 'success') {
                    deletedCount++;
                } else {
                    errorCount++;
                }
            });

            console.log(`   Progress: ✅ ${deletedCount} deleted | ❌ ${errorCount} errors\n`);

            // Small delay between batches
            if (i + BATCH_SIZE < wikiPages.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log('✨ Deletion Complete!\n');
        console.log('📊 Summary:');
        console.log(`   ✅ Deleted: ${deletedCount} page(s)`);
        console.log(`   ❌ Errors: ${errorCount} page(s)`);
        console.log(`   ⏱️  Time: ${totalTime}s`);
        console.log('');
        console.log('✅ Ready for fresh sync!');
        console.log('💡 Run: npm run sync:clean\n');

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
}

deleteAllWikiPages();
