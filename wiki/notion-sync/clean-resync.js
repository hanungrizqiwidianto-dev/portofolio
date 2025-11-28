/**
 * Clean and Re-sync Script
 * Deletes all wiki pages and re-creates them with clean content
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function cleanAndResync() {
    console.log('🧹 Clean and Re-sync Wiki Pages\n');
    console.log('⚠️  WARNING: This will DELETE all wiki pages!\n');
    
    try {
        // Step 1: Find all pages
        console.log('📋 Step 1: Finding all wiki pages...');
        const searchResults = await notion.search({
            filter: { property: 'object', value: 'page' },
            page_size: 100
        });
        
        console.log(`✅ Found ${searchResults.results.length} pages\n`);
        
        // Step 2: Identify category and wiki pages (not index)
        const pagesToDelete = [];
        const categoryPages = [
            'Architecture', 'Backend', 'Database', 'DevOps', 'Docker',
            'Dotnet', 'General', 'Go', 'Kubernetes', 'Microservices',
            'Nodejs', 'Patterns', 'Python'
        ];
        
        for (const page of searchResults.results) {
            const title = page.properties?.title?.title?.[0]?.plain_text || 
                         page.properties?.Name?.title?.[0]?.plain_text || '';
            
            // Skip WIKI index page (keep it)
            if (title === 'WIKI' || title === 'Wiki Index') {
                console.log(`⏭️  Keeping: ${title} (main index)`);
                continue;
            }
            
            // Delete category pages and their children
            if (categoryPages.includes(title) || !categoryPages.some(cat => title.includes(cat))) {
                pagesToDelete.push({ id: page.id, title });
            }
        }
        
        console.log(`\n🗑️  Pages to delete: ${pagesToDelete.length}\n`);
        
        if (pagesToDelete.length === 0) {
            console.log('✅ No pages to delete!\n');
            return;
        }
        
        // Step 3: Delete pages
        console.log('🗑️  Step 2: Deleting pages...\n');
        
        let deleted = 0;
        let errors = 0;
        
        for (const page of pagesToDelete) {
            try {
                await notion.pages.update({
                    page_id: page.id,
                    archived: true
                });
                console.log(`   ✅ Deleted: ${page.title}`);
                deleted++;
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.log(`   ❌ Error deleting ${page.title}: ${error.message}`);
                errors++;
            }
        }
        
        console.log(`\n📊 Deletion Summary:`);
        console.log(`   ✅ Deleted: ${deleted} pages`);
        console.log(`   ❌ Errors: ${errors} pages\n`);
        
        // Step 4: Instructions for re-sync
        console.log('🔄 Step 3: Ready to re-sync!\n');
        console.log('Run this command to create clean pages:');
        console.log('   npm run sync:super\n');
        console.log('✨ New pages will have:');
        console.log('   ✅ No duplicate content');
        console.log('   ✅ Proper character encoding');
        console.log('   ✅ Clean formatting\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run with confirmation
console.log('⚠️  This script will DELETE wiki pages (except WIKI index)\n');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(() => {
    cleanAndResync();
}, 5000);
