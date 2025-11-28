# Wiki to Notion Sync 📚🔄

Automatically sync your HTML wiki pages to Notion with proper structure and navigation.

## ✨ Features

- 🔄 **Automatic Sync**: Convert all HTML wiki pages to Notion pages
- 📁 **Hierarchical Structure**: Maintains folder structure as parent/child pages
- 🎨 **Rich Formatting**: Preserves headings, lists, code blocks, callouts, and more
- 🔍 **Smart Update**: Updates existing pages instead of duplicating
- 📊 **Navigation Index**: Auto-generates index page with all categories
- ⚡ **Rate Limit Safe**: Built-in delays to respect Notion API limits

## 📋 Prerequisites

- Node.js (v16 or higher)
- Notion account with workspace
- Notion Integration (API key)

## 🚀 Setup

### 1. Install Dependencies

```powershell
cd wiki\notion-sync
npm install
```

### 2. Configure Notion Integration

Your API key is already configured in `.env` file:
```
NOTION_API_KEY=ntn_kth609911623kw8bNlkZm6m8vfJ49N0ukaQ0vSIUWxg9Fr
```

### 3. Share Pages with Integration

⚠️ **Important**: You need to share your Notion workspace or specific pages with the integration:

1. Go to your Notion workspace
2. Create a new page (or use existing) where you want the wiki
3. Click "..." (more options) → "Connections"
4. Find "Wiki Portofolio" and connect it
5. This gives the integration access to create/update pages

## 🧪 Testing

### Test Connection
Verify your Notion API key and permissions:

```powershell
npm test
```

This will:
- ✅ Verify API key is valid
- 📋 List existing pages in your workspace
- 🔍 Show workspace information

### Test Parser
Test HTML parsing with a sample page:

```powershell
npm run parse
```

This will:
- 📄 Parse a sample HTML file
- 🔄 Convert to Notion blocks
- 📊 Show statistics about extracted content

## 🔄 Syncing

### Full Sync
Sync all wiki pages to Notion:

```powershell
npm run sync
```

The sync process will:
1. 📂 Scan all HTML files in `wiki/pages/`
2. 📁 Group by categories (backend, database, devops, etc.)
3. 🏗️ Create parent pages for each category
4. 📄 Create/update individual wiki pages
5. 📖 Generate navigation index

### What Gets Synced

✅ **Synced Elements:**
- Page titles and headings
- Paragraphs and text content
- Bulleted and numbered lists
- Checklists (to-do items)
- Code blocks with syntax highlighting
- Info boxes, warnings, examples (as callouts)
- Category badges
- Breadcrumb hierarchy

❌ **Not Synced:**
- Images (Notion API limitation for inline images)
- Custom CSS styling
- JavaScript interactivity
- External links appearance (converted to plain text)

## 📊 Output Structure

The sync creates this structure in Notion:

```
📖 Wiki Index
├── ⚙️ Backend
│   ├── 🔐 Authentication & Authorization
│   ├── ⚡ Caching Strategies
│   ├── 💾 Database Optimization
│   ├── 📊 GraphQL
│   ├── 📨 Message Queues
│   └── 🔌 REST API
├── 💾 Database
│   └── (database pages...)
├── 🚀 DevOps
│   └── (devops pages...)
└── (other categories...)
```

## 🔧 Configuration

Edit `.env` to customize:

```env
# Notion API Key
NOTION_API_KEY=your_api_key_here

# Wiki pages location (relative to this folder)
WIKI_PATH=../pages

# Wiki root (for scanning)
WIKI_ROOT=..
```

## 🤖 Automation (Optional)

### Option 1: Manual Sync
Run `npm run sync` whenever you update wiki pages

### Option 2: GitHub Actions (Automated)
Create `.github/workflows/sync-wiki.yml`:

```yaml
name: Sync Wiki to Notion

on:
  push:
    paths:
      - 'wiki/pages/**/*.html'
  workflow_dispatch:

jobs:
  sync:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd wiki/notion-sync
          npm install
      
      - name: Sync to Notion
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
        run: |
          cd wiki/notion-sync
          npm run sync
```

Then add `NOTION_API_KEY` to your GitHub repository secrets.

### Option 3: Scheduled Sync
Add to Windows Task Scheduler:

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily or Weekly
4. Action: Start a Program
   - Program: `powershell.exe`
   - Arguments: `-Command "cd D:\Portofolio\wiki\notion-sync; npm run sync"`

## 🐛 Troubleshooting

### "Unauthorized" Error
- ✅ Check API key in `.env`
- ✅ Make sure integration is connected to workspace/page
- ✅ Verify integration has write permissions

### "Rate Limit" Error
- ⏱️ Built-in delays should prevent this
- 📊 Free tier: 3 requests/second
- 💎 Paid tier: Higher limits

### No Pages Found
- 📂 Check `WIKI_PATH` in `.env`
- 📄 Ensure HTML files exist in `wiki/pages/`
- 🔍 Files should not be named `index.html` or `test.html`

### Pages Not Updating
- 🔗 Ensure integration has access to the pages
- 🔄 Delete pages manually and re-sync
- 📋 Check console output for specific errors

## 📝 Notes

- **API Limits**: Free Notion has rate limits (3 req/sec). Sync includes delays.
- **Page Ownership**: All pages created by integration, can be edited manually in Notion
- **Sync Direction**: One-way only (Wiki → Notion). Manual Notion edits will be overwritten on next sync.
- **Images**: Not supported due to Notion API limitations for file uploads

## 🆘 Support

If you encounter issues:
1. Run `npm test` to verify connection
2. Check console output for specific error messages
3. Ensure integration is properly connected to Notion workspace

## 📄 License

MIT License - Feel free to modify and use as needed!

---

Made with ❤️ for seamless wiki documentation
