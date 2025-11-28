/**
 * Fix HTML Encoding Issues
 * Replace malformed emoji encoding with proper UTF-8 emojis
 */

import fs from 'fs/promises';
import path from 'path';

// Malformed UTF-8 sequences to proper emojis
// These are the actual bytes that appear when emojis are incorrectly decoded
const ENCODING_FIXES = [
    // Most common: books emoji in "Recommended Resources"
    { pattern: /ð\Ÿ"\š/g, replacement: '📚' },
    { pattern: /ðŸ"š/g, replacement: '�' },
    // Light bulb
    { pattern: /ð\Ÿ'\¡/g, replacement: '💡' },
    { pattern: /ðŸ'¡/g, replacement: '�' },
    // Warning
    { pattern: /â\š \ï\¸/g, replacement: '⚠️' },
    { pattern: /âš ï¸/g, replacement: '⚠️' },
    // Checkmark
    { pattern: /â\œ\…/g, replacement: '✅' },
    { pattern: /âœ…/g, replacement: '✅' },
    // Wrench
    { pattern: /ð\Ÿ"\§/g, replacement: '�' },
    { pattern: /ðŸ"§/g, replacement: '�' },
    // Rocket
    { pattern: /ð\Ÿš\€/g, replacement: '�' },
    { pattern: /ðŸš€/g, replacement: '�' },
    // Book
    { pattern: /ð\Ÿ"\–/g, replacement: '📖' },
    { pattern: /ðŸ"–/g, replacement: '�' },
    // Page
    { pattern: /ð\Ÿ"\„/g, replacement: '�' },
    { pattern: /ðŸ"„/g, replacement: '📄' },
];

async function fixHtmlFile(filePath) {
    try {
        let content = await fs.readFile(filePath, 'utf-8');
        let fixed = false;

        for (const { pattern, replacement } of ENCODING_FIXES) {
            if (pattern.test(content)) {
                content = content.replace(pattern, replacement);
                fixed = true;
            }
        }

        if (fixed) {
            await fs.writeFile(filePath, content, 'utf-8');
            return true;
        }

        return false;

    } catch (error) {
        console.error(`   ❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

async function scanDirectory(dir) {
    const files = [];

    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                const subFiles = await scanDirectory(fullPath);
                files.push(...subFiles);
            } else if (entry.name.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`   ❌ Error scanning ${dir}:`, error.message);
    }

    return files;
}

async function fixAllHtmlFiles() {
    console.log('🔧 Fixing HTML Encoding Issues\n');

    const pagesDir = 'd:/Portofolio/wiki/pages';

    console.log('📂 Scanning for HTML files...\n');
    const htmlFiles = await scanDirectory(pagesDir);

    console.log(`   Found ${htmlFiles.length} HTML files\n`);

    console.log('🔄 Fixing encoding issues...\n');

    let fixed = 0;
    let unchanged = 0;

    for (const file of htmlFiles) {
        const wasFixed = await fixHtmlFile(file);
        const fileName = path.basename(file);

        if (wasFixed) {
            console.log(`   ✅ Fixed: ${fileName}`);
            fixed++;
        } else {
            unchanged++;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Fixed: ${fixed} files`);
    console.log(`   ⏭️  Unchanged: ${unchanged} files`);
    console.log(`   📄 Total: ${htmlFiles.length} files\n`);

    if (fixed > 0) {
        console.log('✨ Next steps:');
        console.log('   1. Run: npm run clean:resync (to delete old pages)');
        console.log('   2. Wait 5 seconds for confirmation');
        console.log('   3. Run: npm run sync:super (to re-create clean pages)\n');
    } else {
        console.log('✅ All files already have correct encoding!\n');
    }
}

fixAllHtmlFiles();
