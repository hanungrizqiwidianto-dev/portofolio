/**
 * FAST Content Improver
 * Fix encoding + Remove "coming soon" + Add basic examples
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WIKI_PATH = path.resolve(__dirname, '../pages');

// Fix emoji encoding - using hex codes to avoid encoding issues in source
const EMOJI_FIXES = [
    { pattern: /ðŸ"š/g, replacement: '📚' },
    { pattern: /ð\Ÿ"\š/g, replacement: '📚' },
    { pattern: /ðŸ'¡/g, replacement: '💡' },
    { pattern: /ð\Ÿ'\¡/g, replacement: '💡' },
    { pattern: /âœ…/g, replacement: '✅' },
    { pattern: /ðŸ"§/g, replacement: '🔧' },
    { pattern: /ðŸš€/g, replacement: '🚀' },
    { pattern: /ðŸ"–/g, replacement: '📖' },
    { pattern: /ðŸ"„/g, replacement: '�' }
];

// Generic code examples per language
const CODE_TEMPLATES = {
    'backend': {
        javascript: `// Example: RESTful API with Express.js
const express = require('express');
const app = express();

app.use(express.json());

// GET endpoint
app.get('/api/items', async (req, res) => {
    const items = await database.getItems();
    res.json(items);
});

// POST endpoint
app.post('/api/items', async (req, res) => {
    const newItem = await database.createItem(req.body);
    res.status(201).json(newItem);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});`,
        csharp: `// Example: ASP.NET Core API
[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly IItemService _itemService;
    
    public ItemsController(IItemService itemService)
    {
        _itemService = itemService;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetItems()
    {
        var items = await _itemService.GetAllAsync();
        return Ok(items);
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateItem([FromBody] ItemDto dto)
    {
        var item = await _itemService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetItems), new { id = item.Id }, item);
    }
}`
    },
    'database': {
        sql: `-- Example: Common SQL Operations

-- SELECT with JOIN
SELECT u.name, o.order_date, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.order_date >= '2024-01-01'
ORDER BY o.order_date DESC;

-- CREATE INDEX for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);

-- Transaction example
BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;`,
        javascript: `// Example: Database Query (Node.js)
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getUsers() {
    const result = await pool.query(
        'SELECT * FROM users WHERE active = $1 ORDER BY created_at DESC',
        [true]
    );
    return result.rows;
}

async function createUser(name, email) {
    const result = await pool.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
    );
    return result.rows[0];
}`
    },
    'docker': {
        dockerfile: `# Multi-stage Dockerfile example
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]`,
        yaml: `# docker-compose.yml example
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://db:5432/myapp
    depends_on:
      - db
      
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_PASSWORD=secret

volumes:
  postgres_data:`
    },
    'patterns': {
        javascript: `// Design Pattern Implementation Example
class Service {
    constructor() {
        this.cache = new Map();
    }
    
    async getData(id) {
        // Check cache first
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        
        // Fetch from source
        const data = await this.fetchFromSource(id);
        
        // Cache result
        this.cache.set(id, data);
        
        return data;
    }
}`,
        csharp: `// Design Pattern Implementation Example
public class Service : IService
{
    private readonly IRepository _repository;
    private readonly ILogger<Service> _logger;
    
    public Service(IRepository repository, ILogger<Service> logger)
    {
        _repository = repository;
        _logger = logger;
    }
    
    public async Task<Result> ProcessAsync(Request request)
    {
        _logger.LogInformation("Processing request {Id}", request.Id);
        
        var data = await _repository.GetAsync(request.Id);
        
        // Business logic here
        
        return new Result { Success = true, Data = data };
    }
}`
    },
    'kubernetes': {
        yaml: `# Kubernetes Deployment Example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer`
    }
};

async function improveHtmlFile(filePath, category) {
    try {
        let content = await fs.readFile(filePath, 'utf-8');
        let modified = false;

        // 1. Fix emoji encoding
        for (const fix of EMOJI_FIXES) {
            if (fix.pattern.test(content)) {
                content = content.replace(fix.pattern, fix.replacement);
                modified = true;
            }
        }

        // 2. Replace "coming soon" section with actual content
        const comingSoonPattern = /<section class="doc-section">\s*<h2>Implementation Guide<\/h2>\s*<p>\s*Detailed implementation.*?will be enhanced in future updates.*?<\/p>\s*<div class="example-box">.*?<\/div>\s*<\/section>/s;

        if (comingSoonPattern.test(content)) {
            const categoryKey = getCategoryKey(category);
            const codeTemplates = CODE_TEMPLATES[categoryKey] || CODE_TEMPLATES['backend'];

            const newSection = `<section class="doc-section">
                    <h2>Implementation Examples</h2>
                    <p>Berikut adalah contoh implementasi praktis yang dapat Anda pelajari dan terapkan. Setiap contoh menunjukkan best practices dan pola yang umum digunakan dalam industri.</p>
                    
${Object.entries(codeTemplates).map(([lang, code]) => `                    <h3>${capitalizeFirst(lang)} Implementation</h3>
                    <pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>
`).join('\n')}
                    
                    <div class="info-box">
                        <i class="fas fa-lightbulb"></i>
                        <div>
                            <strong>💡 Best Practice:</strong> Selalu ikuti prinsip-prinsip SOLID, gunakan dependency injection, dan pastikan code Anda testable. Untuk detail lebih lanjut, lihat dokumentasi resmi dari teknologi yang Anda gunakan.
                        </div>
                    </div>
                </section>

                <section class="doc-section">
                    <h2>📚 Additional Resources</h2>
                    <ul>
                        <li>Official documentation and API references</li>
                        <li>GitHub repositories dengan real-world examples</li>
                        <li>Online courses dan tutorial videos</li>
                        <li>Community forums dan Stack Overflow discussions</li>
                        <li>Industry blogs dan technical articles</li>
                    </ul>
                </section>`;

            content = content.replace(comingSoonPattern, newSection);
            modified = true;
        }

        // 3. Write back if modified
        if (modified) {
            await fs.writeFile(filePath, content, 'utf-8');
            return true;
        }

        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

function getCategoryKey(category) {
    const mapping = {
        'backend': 'backend',
        'database': 'database',
        'docker': 'docker',
        'patterns': 'patterns',
        'kubernetes': 'kubernetes',
        'architecture': 'patterns',
        'microservices': 'backend',
        'devops': 'docker',
        'dotnet': 'backend',
        'go': 'backend',
        'nodejs': 'backend',
        'python': 'backend'
    };
    return mapping[category] || 'backend';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function processAllFiles() {
    console.log('🚀 Starting FAST Content Improvement...\n');

    const categories = await fs.readdir(WIKI_PATH);
    let improved = 0;
    let skipped = 0;
    let total = 0;

    for (const category of categories) {
        const categoryPath = path.join(WIKI_PATH, category);
        const stat = await fs.stat(categoryPath);

        if (!stat.isDirectory()) continue;

        console.log(`\n📁 Processing: ${category}`);

        const files = await fs.readdir(categoryPath);

        for (const file of files) {
            if (!file.endsWith('.html') || file === 'index.html') continue;

            total++;
            const filePath = path.join(categoryPath, file);
            const wasImproved = await improveHtmlFile(filePath, category);

            if (wasImproved) {
                console.log(`   ✅ ${file}`);
                improved++;
            } else {
                console.log(`   ⏭️  ${file} (no changes needed)`);
                skipped++;
            }
        }
    }

    console.log(`\n\n✨ Improvement Complete!`);
    console.log(`📊 Summary:`);
    console.log(`   ✅ Improved: ${improved} files`);
    console.log(`   ⏭️  Skipped: ${skipped} files`);
    console.log(`   📝 Total: ${total} files`);
    console.log(`\n🎉 Ready to sync to Notion!`);
    console.log(`   Run: npm run sync:super\n`);
}

processAllFiles().catch(console.error);
