/**
 * Notion Page Manager
 * Creates and updates pages in Notion with hierarchical structure
 */

import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

/**
 * Get a page that the integration has access to (for use as root)
 */
export async function getAccessiblePage() {
    try {
        const searchResults = await notion.search({
            filter: {
                property: 'object',
                value: 'page'
            },
            page_size: 1
        });

        if (searchResults.results.length > 0) {
            return searchResults.results[0].id;
        }

        throw new Error('No accessible pages found. Please share a page with the integration first.');
    } catch (error) {
        throw error;
    }
}

/**
 * Find or create parent page (e.g., "Backend", "Database", etc.)
 */
export async function findOrCreateParentPage(parentName, rootPageId) {
    try {
        // Search for existing parent page
        const searchResults = await notion.search({
            query: parentName,
            filter: {
                property: 'object',
                value: 'page'
            }
        });

        // Check if page already exists
        for (const page of searchResults.results) {
            const title = page.properties?.title?.title?.[0]?.plain_text ||
                page.properties?.Name?.title?.[0]?.plain_text || '';

            if (title.toLowerCase() === parentName.toLowerCase()) {
                console.log(`✅ Found existing parent: ${parentName} (${page.id})`);
                return page.id;
            }
        }

        // Create new parent page
        console.log(`📝 Creating parent page: ${parentName}`);

        const emoji = getEmojiForCategory(parentName);

        const newPage = await notion.pages.create({
            parent: { page_id: rootPageId },
            icon: { emoji },
            properties: {
                title: {
                    title: [{
                        text: { content: parentName }
                    }]
                }
            },
            children: [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{
                            type: 'text',
                            text: { content: `📚 ${parentName} documentation and learning resources` }
                        }]
                    }
                }
            ]
        });

        console.log(`✅ Created parent page: ${parentName} (${newPage.id})`);
        return newPage.id;

    } catch (error) {
        console.error(`❌ Error creating parent page ${parentName}:`, error.message);
        throw error;
    }
}

/**
 * Create or update a wiki page in Notion
 */
export async function createOrUpdatePage(title, blocks, parentId, metadata = {}) {
    try {
        // Search for existing page
        const searchResults = await notion.search({
            query: title,
            filter: {
                property: 'object',
                value: 'page'
            }
        });

        // Check if page exists with same parent
        let existingPageId = null;
        for (const page of searchResults.results) {
            const pageTitle = page.properties?.title?.title?.[0]?.plain_text ||
                page.properties?.Name?.title?.[0]?.plain_text || '';

            if (pageTitle === title && page.parent?.page_id === parentId) {
                existingPageId = page.id;
                break;
            }
        }

        if (existingPageId) {
            // Update existing page
            console.log(`🔄 Updating page: ${title}`);

            // Delete all existing blocks
            const existingBlocks = await notion.blocks.children.list({
                block_id: existingPageId
            });

            for (const block of existingBlocks.results) {
                try {
                    await notion.blocks.delete({ block_id: block.id });
                } catch (e) {
                    // Some blocks can't be deleted, skip them
                }
            }

            // Add new blocks in batches (max 100 per request)
            const batchSize = 100;
            for (let i = 0; i < blocks.length; i += batchSize) {
                const batch = blocks.slice(i, i + batchSize);
                await notion.blocks.children.append({
                    block_id: existingPageId,
                    children: batch
                });
            }

            console.log(`✅ Updated: ${title}`);
            return existingPageId;

        } else {
            // Create new page
            console.log(`📝 Creating page: ${title}`);

            const emoji = metadata.emoji || getEmojiForCategory(metadata.category);

            // Create page with blocks in batches
            const initialBlocks = blocks.slice(0, 100);

            const newPage = await notion.pages.create({
                parent: { page_id: parentId },
                icon: { emoji },
                properties: {
                    title: {
                        title: [{
                            text: { content: title }
                        }]
                    }
                },
                children: initialBlocks
            });

            // Add remaining blocks if any
            if (blocks.length > 100) {
                for (let i = 100; i < blocks.length; i += 100) {
                    const batch = blocks.slice(i, i + 100);
                    await notion.blocks.children.append({
                        block_id: newPage.id,
                        children: batch
                    });
                }
            }

            console.log(`✅ Created: ${title} (${newPage.id})`);
            return newPage.id;
        }

    } catch (error) {
        console.error(`❌ Error creating/updating page "${title}":`, error.message);
        if (error.body) {
            console.error('   Details:', JSON.stringify(error.body, null, 2));
        }
        throw error;
    }
}

/**
 * Create index/navigation page
 */
export async function createIndexPage(categories, rootPageId) {
    try {
        console.log('📝 Creating Wiki Index page...');

        const blocks = [
            {
                object: 'block',
                type: 'heading_1',
                heading_1: {
                    rich_text: [{
                        type: 'text',
                        text: { content: 'Development Wiki' }
                    }]
                }
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{
                        type: 'text',
                        text: { content: '📚 Comprehensive documentation for modern development practices and technologies.' }
                    }]
                }
            },
            {
                object: 'block',
                type: 'divider',
                divider: {}
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{
                        type: 'text',
                        text: { content: 'Categories' }
                    }]
                }
            }
        ];

        // Add category links
        for (const [categoryName, categoryId] of Object.entries(categories)) {
            const emoji = getEmojiForCategory(categoryName);
            blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [
                        {
                            type: 'text',
                            text: { content: `${emoji} ` }
                        },
                        {
                            type: 'mention',
                            mention: {
                                type: 'page',
                                page: { id: categoryId }
                            }
                        }
                    ]
                }
            });
        }

        // Search for existing index
        const searchResults = await notion.search({
            query: 'Wiki Index',
            filter: { property: 'object', value: 'page' }
        });

        let indexPageId = null;
        for (const page of searchResults.results) {
            const title = page.properties?.title?.title?.[0]?.plain_text || '';
            if (title === 'Wiki Index') {
                indexPageId = page.id;
                break;
            }
        }

        if (indexPageId) {
            // Update existing index
            const existingBlocks = await notion.blocks.children.list({
                block_id: indexPageId
            });

            for (const block of existingBlocks.results) {
                try {
                    await notion.blocks.delete({ block_id: block.id });
                } catch (e) { }
            }

            await notion.blocks.children.append({
                block_id: indexPageId,
                children: blocks
            });

            console.log('✅ Updated Wiki Index');
            return indexPageId;
        } else {
            // Create new index
            const newPage = await notion.pages.create({
                parent: { page_id: rootPageId },
                icon: { emoji: '📖' },
                properties: {
                    title: {
                        title: [{
                            text: { content: 'Wiki Index' }
                        }]
                    }
                },
                children: blocks
            });

            console.log('✅ Created Wiki Index');
            return newPage.id;
        }

    } catch (error) {
        console.error('❌ Error creating index page:', error.message);
        throw error;
    }
}

/**
 * Get emoji for category
 */
function getEmojiForCategory(category) {
    const emojiMap = {
        'backend': '⚙️',
        'frontend': '🎨',
        'database': '💾',
        'devops': '🚀',
        'docker': '🐳',
        'kubernetes': '☸️',
        'nodejs': '💚',
        'python': '🐍',
        'dotnet': '💎',
        'go': '🔷',
        'microservices': '🔧',
        'architecture': '🏗️',
        'patterns': '🎯',
        'authentication': '🔐',
        'caching': '⚡',
        'api': '🔌',
        'graphql': '📊'
    };

    const key = category.toLowerCase().replace(/\s+/g, '');
    return emojiMap[key] || '📄';
}
