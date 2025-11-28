/**
 * Identify Empty "Coming Soon" Pages
 * Scan HTML files to find pages with placeholder content
 */

import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';

async function analyzePage(filePath) {
    try {
        const html = await fs.readFile(filePath, 'utf-8');
        const $ = cheerio.load(html);

        const title = $('article h1').first().text().trim();
        const content = $('article').text().trim();

        // Check for "coming soon" indicators
        const comingSoonKeywords = [
            'coming soon',
            'under construction',
            'work in progress',
            'to be added',
            'placeholder',
            'TBD',
            'TODO'
        ];

        const lowerContent = content.toLowerCase();
        const hasComingSoon = comingSoonKeywords.some(keyword =>
            lowerContent.includes(keyword.toLowerCase())
        );

        // Check if content is very short (less than 500 chars after title)
        const contentLength = content.length;
        const isShort = contentLength < 500;

        // Count sections
        const sectionCount = $('article .doc-section').length;

        return {
            file: path.basename(filePath),
            title,
            hasComingSoon,
            isShort,
            contentLength,
            sectionCount,
            status: hasComingSoon ? 'coming-soon' : (isShort ? 'short' : 'complete')
        };

    } catch (error) {
        return {
            file: path.basename(filePath),
            title: 'Error',
            error: error.message
        };
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
        console.error(`Error scanning ${dir}:`, error.message);
    }

    return files;
}

async function identifyEmptyPages() {
    console.log('🔍 Identifying Empty/Coming Soon Pages\n');

    const pagesDir = 'd:/Portofolio/wiki/pages';

    console.log('📂 Scanning HTML files...\n');
    const htmlFiles = await scanDirectory(pagesDir);

    console.log('🔄 Analyzing content...\n');

    const results = [];
    for (const file of htmlFiles) {
        const analysis = await analyzePage(file);
        results.push(analysis);
    }

    // Sort by status
    results.sort((a, b) => {
        const order = { 'coming-soon': 0, 'short': 1, 'complete': 2 };
        return order[a.status] - order[b.status];
    });

    // Group by status
    const comingSoon = results.filter(r => r.status === 'coming-soon');
    const short = results.filter(r => r.status === 'short');
    const complete = results.filter(r => r.status === 'complete');

    console.log('📊 Results:\n');

    if (comingSoon.length > 0) {
        console.log('🚧 Coming Soon Pages:\n');
        comingSoon.forEach(page => {
            console.log(`   📄 ${page.title}`);
            console.log(`      File: ${page.file}`);
            console.log(`      Length: ${page.contentLength} chars, Sections: ${page.sectionCount}\n`);
        });
    }

    if (short.length > 0) {
        console.log('⚠️  Short Content Pages (< 500 chars):\n');
        short.forEach(page => {
            console.log(`   📄 ${page.title}`);
            console.log(`      File: ${page.file}`);
            console.log(`      Length: ${page.contentLength} chars, Sections: ${page.sectionCount}\n`);
        });
    }

    console.log('📊 Summary:');
    console.log(`   🚧 Coming Soon: ${comingSoon.length} pages`);
    console.log(`   ⚠️  Short Content: ${short.length} pages`);
    console.log(`   ✅ Complete: ${complete.length} pages`);
    console.log(`   📄 Total: ${results.length} pages\n`);

    // Save to file
    const report = {
        summary: {
            comingSoon: comingSoon.length,
            short: short.length,
            complete: complete.length,
            total: results.length
        },
        pages: {
            comingSoon,
            short,
            complete
        }
    };

    await fs.writeFile(
        'd:/Portofolio/wiki/notion-sync/empty-pages-report.json',
        JSON.stringify(report, null, 2),
        'utf-8'
    );

    console.log('✅ Report saved to: empty-pages-report.json\n');
}

identifyEmptyPages();
