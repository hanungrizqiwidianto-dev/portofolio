/**
 * Test HTML Parser
 * Tests the parser with a sample wiki page
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { parseHtmlFile, convertToNotionBlocks } from './parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testParser() {
    console.log('🧪 Testing HTML Parser...\n');

    const testFile = path.resolve(__dirname, '../pages/backend/authentication.html');

    try {
        console.log(`📄 Parsing: ${testFile}\n`);

        const parsed = await parseHtmlFile(testFile);

        if (!parsed) {
            console.error('❌ Failed to parse file');
            return;
        }

        console.log('✅ Parsed successfully!\n');
        console.log('📋 Extracted Data:');
        console.log(`   Title: ${parsed.title}`);
        console.log(`   Category: ${parsed.category}`);
        console.log(`   Breadcrumbs: ${parsed.breadcrumbs.join(' > ')}`);
        console.log(`   Sections: ${parsed.sections.length}`);
        console.log('');

        parsed.sections.forEach((section, i) => {
            console.log(`   Section ${i + 1}: ${section.title}`);
            console.log(`      Paragraphs: ${section.paragraphs.length}`);
            console.log(`      Lists: ${section.lists.length}`);
            console.log(`      Checklist items: ${section.checklist.length}`);
            console.log(`      Code blocks: ${section.codeBlocks.length}`);
            console.log(`      Info boxes: ${section.infoBoxes.length}`);
        });

        console.log('');
        console.log('🔄 Converting to Notion blocks...');

        const blocks = convertToNotionBlocks(parsed);

        console.log(`✅ Converted to ${blocks.length} Notion block(s)\n`);

        console.log('📦 Block types:');
        const blockTypes = {};
        blocks.forEach(block => {
            blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;
        });

        Object.entries(blockTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count}`);
        });

        console.log('\n✨ Parser test completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
}

testParser();
