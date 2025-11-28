/**
 * HTML Parser for Wiki Pages
 * Extracts content from HTML files and converts to Notion blocks format
 */

import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

/**
 * Parse HTML file and extract structured content
 */
export async function parseHtmlFile(filePath) {
    try {
        const html = await fs.readFile(filePath, 'utf-8');
        const $ = cheerio.load(html);

        // Extract metadata
        const title = $('article h1').first().text().trim() ||
            $('title').text().replace(" - Hanung's Dev Wiki", "").trim();

        const badge = $('.badge').first().text().trim();
        const category = badge || 'General';

        // Extract breadcrumb for hierarchy
        const breadcrumbs = [];
        $('.breadcrumb a, .breadcrumb span').each((i, el) => {
            const text = $(el).text().trim();
            if (text && text !== '/') {
                breadcrumbs.push(text);
            }
        });

        // Extract content sections
        const sections = [];

        $('article .doc-section').each((i, section) => {
            const $section = $(section);
            const sectionTitle = $section.find('h2').first().text().trim();

            // Extract paragraphs (exclude those inside info-boxes)
            const paragraphs = [];
            $section.find('> p, p').each((j, p) => {
                const $p = $(p);
                // Skip if inside info-box, example-box, or warning-box
                if (!$p.closest('.info-box, .example-box, .warning-box').length) {
                    const text = $p.text().trim();
                    if (text) paragraphs.push(text);
                }
            });

            // Extract lists (exclude those inside boxes)
            const lists = [];
            $section.find('ul li, ol li').each((j, li) => {
                const $li = $(li);
                // Skip if inside info-box, example-box, checklist, or warning-box
                if (!$li.closest('.info-box, .example-box, .warning-box, .checklist').length) {
                    const text = $li.text().trim();
                    if (text) lists.push(text);
                }
            });

            // Extract checklist items
            const checklist = [];
            $section.find('.checklist-item').each((j, item) => {
                const text = $(item).find('span').text().trim();
                if (text) checklist.push(text);
            });

            // Extract code blocks
            const codeBlocks = [];
            $section.find('pre code').each((j, code) => {
                const language = $(code).attr('class')?.replace('language-', '') || 'plaintext';
                const codeText = $(code).text().trim();
                if (codeText) {
                    codeBlocks.push({ language, code: codeText });
                }
            });

            // Extract info boxes
            const infoBoxes = [];
            $section.find('.info-box, .warning-box, .example-box').each((j, box) => {
                const $box = $(box);
                const type = $box.hasClass('warning-box') ? 'warning' :
                    $box.hasClass('example-box') ? 'example' : 'info';
                const content = $box.text().trim();
                if (content) {
                    infoBoxes.push({ type, content });
                }
            });

            if (sectionTitle) {
                sections.push({
                    title: sectionTitle,
                    paragraphs,
                    lists,
                    checklist,
                    codeBlocks,
                    infoBoxes
                });
            }
        });

        return {
            title,
            category,
            breadcrumbs,
            sections,
            filePath
        };

    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Convert parsed content to Notion blocks
 */
export function convertToNotionBlocks(parsedContent) {
    const blocks = [];

    // Add category badge as callout
    if (parsedContent.category) {
        blocks.push({
            object: 'block',
            type: 'callout',
            callout: {
                rich_text: [{
                    type: 'text',
                    text: { content: `📁 Category: ${parsedContent.category}` }
                }],
                icon: { emoji: '📚' },
                color: 'blue_background'
            }
        });
    }

    // Process each section
    parsedContent.sections.forEach(section => {
        // Section heading
        blocks.push({
            object: 'block',
            type: 'heading_2',
            heading_2: {
                rich_text: [{
                    type: 'text',
                    text: { content: section.title }
                }]
            }
        });

        // Paragraphs
        section.paragraphs.forEach(para => {
            blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{
                        type: 'text',
                        text: { content: para }
                    }]
                }
            });
        });

        // Info boxes as callouts
        section.infoBoxes.forEach(box => {
            const emoji = box.type === 'warning' ? '⚠️' :
                box.type === 'example' ? '💡' : 'ℹ️';
            const color = box.type === 'warning' ? 'yellow_background' :
                box.type === 'example' ? 'green_background' : 'blue_background';

            blocks.push({
                object: 'block',
                type: 'callout',
                callout: {
                    rich_text: [{
                        type: 'text',
                        text: { content: box.content }
                    }],
                    icon: { emoji },
                    color
                }
            });
        });

        // Checklist
        if (section.checklist.length > 0) {
            section.checklist.forEach(item => {
                blocks.push({
                    object: 'block',
                    type: 'to_do',
                    to_do: {
                        rich_text: [{
                            type: 'text',
                            text: { content: item }
                        }],
                        checked: true
                    }
                });
            });
        }

        // Lists
        if (section.lists.length > 0) {
            section.lists.forEach(item => {
                blocks.push({
                    object: 'block',
                    type: 'bulleted_list_item',
                    bulleted_list_item: {
                        rich_text: [{
                            type: 'text',
                            text: { content: item }
                        }]
                    }
                });
            });
        }

        // Code blocks
        section.codeBlocks.forEach(codeBlock => {
            // Map unsupported languages to Notion-supported ones
            let language = codeBlock.language.toLowerCase();

            const languageMap = {
                'csharp': 'c#',
                'cs': 'c#',
                'plaintext': 'plain text',
                'text': 'plain text',
                'sh': 'shell',
                'yml': 'yaml',
                'ts': 'typescript',
                'js': 'javascript',
                'py': 'python',
                'rb': 'ruby',
                'java/c/c++/c#': 'java'
            };

            language = languageMap[language] || language;

            // If still not supported, default to plain text
            const supportedLanguages = [
                'abap', 'arduino', 'bash', 'basic', 'c', 'clojure', 'coffeescript',
                'c++', 'c#', 'css', 'dart', 'diff', 'docker', 'elixir', 'elm',
                'erlang', 'flow', 'fortran', 'f#', 'gherkin', 'glsl', 'go',
                'graphql', 'groovy', 'haskell', 'html', 'java', 'javascript',
                'json', 'julia', 'kotlin', 'latex', 'less', 'lisp', 'livescript',
                'lua', 'makefile', 'markdown', 'markup', 'matlab', 'mermaid',
                'nix', 'objective-c', 'ocaml', 'pascal', 'perl', 'php',
                'plain text', 'powershell', 'prolog', 'protobuf', 'python',
                'r', 'reason', 'ruby', 'rust', 'sass', 'scala', 'scheme',
                'scss', 'shell', 'sql', 'swift', 'typescript', 'vb.net',
                'visual basic', 'xml', 'yaml'
            ];

            if (!supportedLanguages.includes(language)) {
                language = 'plain text';
            }

            blocks.push({
                object: 'block',
                type: 'code',
                code: {
                    rich_text: [{
                        type: 'text',
                        text: { content: codeBlock.code }
                    }],
                    language: language
                }
            });
        });
    });

    return blocks;
}

/**
 * Scan directory for HTML files
 */
export async function scanWikiDirectory(dirPath) {
    const files = [];

    async function scan(currentPath, relativePath = '') {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            const relPath = path.join(relativePath, entry.name);

            if (entry.isDirectory()) {
                await scan(fullPath, relPath);
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                // Skip index and test files
                if (!entry.name.includes('index') && !entry.name.includes('test')) {
                    files.push({
                        fullPath,
                        relativePath: relPath,
                        directory: relativePath,
                        fileName: entry.name
                    });
                }
            }
        }
    }

    await scan(dirPath);
    return files;
}
