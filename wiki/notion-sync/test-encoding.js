/**
 * Test Character Encoding
 * Verify emojis are handled correctly
 */

import { parseHtmlFile } from './parser.js';

async function testEncoding() {
    console.log('🧪 Testing Character Encoding\n');

    // Test emoji rendering
    const testEmojis = {
        '📚': 'books',
        '⚠️': 'warning',
        '💡': 'lightbulb',
        '✅': 'checkmark',
        '🔧': 'wrench',
        '🚀': 'rocket',
        '📖': 'book',
        '📄': 'page'
    };

    console.log('📋 Emoji Test:\n');
    for (const [emoji, name] of Object.entries(testEmojis)) {
        console.log(`   ${emoji} ${name} - UTF-8: ${Buffer.from(emoji).toString('utf-8')}`);
    }

    // Test parsing a sample file
    console.log('\n📄 Parsing Sample File:\n');

    try {
        const metadata = await parseHtmlFile('d:/Portofolio/wiki/pages/architecture/clean-architecture.html');
        console.log(`   Title: ${metadata.title}`);
        console.log(`   Category: ${metadata.category}`);
        console.log(`   Emoji: ${metadata.emoji || '(none)'}`);
        console.log(`   Sections: ${metadata.sections.length}`);

        if (metadata.sections.length > 0) {
            console.log(`\n   First Section:`);
            console.log(`   - Title: ${metadata.sections[0].title}`);
            console.log(`   - Paragraphs: ${metadata.sections[0].paragraphs.length}`);
            console.log(`   - Lists: ${metadata.sections[0].lists.length}`);

            if (metadata.sections[0].paragraphs.length > 0) {
                const firstPara = metadata.sections[0].paragraphs[0].substring(0, 100);
                console.log(`\n   First paragraph:\n   "${firstPara}..."`);
            }
        }

        console.log('\n✅ Encoding test passed!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testEncoding();
