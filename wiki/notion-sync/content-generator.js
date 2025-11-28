/**
 * Smart Content Generator for Wiki Pages
 * Generates complete, professional content with code examples
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WIKI_PATH = path.resolve(__dirname, '../pages');

// Content templates per category with REAL implementations
const CONTENT_TEMPLATES = {
    'backend': {
        'authentication': {
            title: 'Authentication & Authorization',
            sections: [
                {
                    title: 'JWT Authentication Implementation',
                    paragraphs: [
                        'JWT (JSON Web Tokens) adalah standar terbuka (RFC 7519) untuk transmisi informasi secara aman antara pihak-pihak sebagai objek JSON. Token ini digunakan untuk autentikasi stateless dalam aplikasi modern.',
                        'Dalam implementasi JWT, server membuat token yang berisi payload (data user) dan signature. Token ini kemudian dikirim ke client dan disimpan (biasanya di localStorage atau httpOnly cookie).'
                    ],
                    codeBlocks: [
                        {
                            language: 'javascript',
                            code: `// JWT Authentication Middleware (Node.js + Express)
const jwt = require('jsonwebtoken');

// Generate JWT Token
function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h',
        issuer: 'your-app-name'
    });
}

// Verify JWT Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Usage in routes
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Authenticate user (check database)
    const user = await User.findByEmail(email);
    if (!user || !await user.verifyPassword(password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name }
    });
});

// Protected route
app.get('/api/profile', authenticateToken, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user);
});`
                        },
                        {
                            language: 'csharp',
                            code: `// JWT Authentication in ASP.NET Core
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class JwtService
{
    private readonly IConfiguration _config;
    
    public JwtService(IConfiguration config)
    {
        _config = config;
    }
    
    public string GenerateToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Secret"])
        );
        var credentials = new SigningCredentials(
            securityKey, 
            SecurityAlgorithms.HmacSha256
        );
        
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };
        
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(24),
            signingCredentials: credentials
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// Configure in Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"])
            )
        };
    });

// Use in controller
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    [HttpGet]
    public IActionResult GetProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        // Get user from database
        return Ok(new { userId, email = User.Identity.Name });
    }
}`
                        }
                    ],
                    infoBoxes: [
                        {
                            type: 'info',
                            content: '💡 Best Practice: Simpan JWT di httpOnly cookie untuk keamanan maksimal, bukan di localStorage yang rentan XSS attacks.'
                        }
                    ]
                },
                {
                    title: 'OAuth 2.0 Implementation',
                    paragraphs: [
                        'OAuth 2.0 adalah protokol authorization yang memungkinkan aplikasi pihak ketiga mendapatkan akses terbatas ke layanan HTTP. Ini adalah standar industri untuk social login (Google, Facebook, GitHub).',
                        'Flow OAuth 2.0 yang paling umum adalah Authorization Code Flow dengan PKCE untuk aplikasi SPA dan mobile.'
                    ],
                    codeBlocks: [
                        {
                            language: 'javascript',
                            code: `// OAuth 2.0 with Passport.js (Google)
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Find or create user
            let user = await User.findOne({ googleId: profile.id });
            
            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    picture: profile.photos[0].value
                });
            }
            
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

// Routes
app.get('/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT for your app
        const token = generateToken(req.user);
        res.redirect(\`/dashboard?token=\${token}\`);
    }
);`
                        }
                    ]
                },
                {
                    title: 'Role-Based Access Control (RBAC)',
                    paragraphs: [
                        'RBAC membatasi akses sistem berdasarkan roles pengguna. Setiap role memiliki permissions tertentu yang menentukan actions apa yang bisa dilakukan.'
                    ],
                    codeBlocks: [
                        {
                            language: 'javascript',
                            code: `// RBAC Middleware
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Forbidden: Insufficient permissions' 
            });
        }
        
        next();
    };
}

// Usage
app.delete('/api/users/:id', 
    authenticateToken,
    authorize('admin'),
    async (req, res) => {
        await User.delete(req.params.id);
        res.json({ message: 'User deleted' });
    }
);

app.post('/api/posts', 
    authenticateToken,
    authorize('admin', 'editor', 'author'),
    async (req, res) => {
        const post = await Post.create(req.body);
        res.json(post);
    }
);`
                        }
                    ]
                },
                {
                    title: 'Password Hashing Best Practices',
                    paragraphs: [
                        'NEVER store passwords in plain text! Gunakan bcrypt, Argon2, atau PBKDF2 untuk hashing. Bcrypt secara otomatis menangani salt dan memiliki work factor yang adjustable.'
                    ],
                    codeBlocks: [
                        {
                            language: 'javascript',
                            code: `// Bcrypt Example (Node.js)
const bcrypt = require('bcrypt');

// Hash password on registration
async function hashPassword(plainPassword) {
    const saltRounds = 12; // Cost factor
    return await bcrypt.hash(plainPassword, saltRounds);
}

// Verify password on login
async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

// User registration example
app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || password.length < 8) {
        return res.status(400).json({ 
            error: 'Invalid input' 
        });
    }
    
    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        return res.status(409).json({ 
            error: 'Email already exists' 
        });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await User.create({
        email,
        password: hashedPassword,
        name
    });
    
    // Generate token
    const token = generateToken(user);
    
    res.status(201).json({ token, user });
});`
                        }
                    ],
                    infoBoxes: [
                        {
                            type: 'warning',
                            content: '⚠️ Security Warning: Gunakan HTTPS untuk semua authentication endpoints. Tanpa HTTPS, tokens dan passwords dapat dicuri melalui man-in-the-middle attacks!'
                        }
                    ]
                }
            ],
            resources: [
                'JWT.io - Official JWT documentation and debugger',
                'OAuth 2.0 Simplified - Comprehensive guide by Aaron Parecki',
                'OWASP Authentication Cheat Sheet',
                'Auth0 Blog - Best practices and tutorials',
                'PassportJS Documentation - Node.js authentication middleware'
            ]
        }
    }
};

// Function to generate complete HTML
async function generateEnhancedContent(category, topic) {
    const template = CONTENT_TEMPLATES[category]?.[topic];
    if (!template) {
        console.log(`⚠️  No template for ${category}/${topic}, skipping...`);
        return null;
    }

    let implementationSection = '';

    template.sections.forEach(section => {
        implementationSection += `
                <section class="doc-section">
                    <h2>${section.title}</h2>`;

        // Add paragraphs
        section.paragraphs.forEach(para => {
            implementationSection += `
                    <p>${para}</p>`;
        });

        // Add info boxes
        if (section.infoBoxes) {
            section.infoBoxes.forEach(box => {
                const boxClass = box.type === 'warning' ? 'warning-box' :
                    box.type === 'example' ? 'example-box' : 'info-box';
                implementationSection += `
                    <div class="${boxClass}">
                        <i class="fas fa-${box.type === 'warning' ? 'exclamation-triangle' : 'lightbulb'}"></i>
                        <div>${box.content}</div>
                    </div>`;
            });
        }

        // Add code blocks
        if (section.codeBlocks) {
            section.codeBlocks.forEach(block => {
                implementationSection += `
                    <pre><code class="language-${block.language}">${escapeHtml(block.code)}</code></pre>`;
            });
        }

        implementationSection += `
                </section>`;
    });

    // Add resources section
    if (template.resources) {
        implementationSection += `
                <section class="doc-section">
                    <h2>📚 Recommended Resources</h2>
                    <ul>`;
        template.resources.forEach(resource => {
            implementationSection += `
                        <li>${resource}</li>`;
        });
        implementationSection += `
                    </ul>
                </section>`;
    }

    return implementationSection;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Main function
async function enhanceAllPages() {
    console.log('🚀 Starting Content Enhancement...\n');

    let enhanced = 0;
    let skipped = 0;

    for (const [category, topics] of Object.entries(CONTENT_TEMPLATES)) {
        console.log(`\n📁 Category: ${category}`);

        for (const [topic, data] of Object.entries(topics)) {
            const filePath = path.join(WIKI_PATH, category, `${topic}.html`);

            try {
                // Check if file exists
                await fs.access(filePath);

                // Read current content
                let content = await fs.readFile(filePath, 'utf-8');

                // Generate enhanced content
                const enhancedSection = await generateEnhancedContent(category, topic);

                if (enhancedSection) {
                    // Replace Implementation Guide section
                    const regex = /<section class="doc-section">\s*<h2>Implementation Guide<\/h2>[\s\S]*?<\/section>/;

                    if (regex.test(content)) {
                        content = content.replace(regex, enhancedSection.trim());

                        // Write back
                        await fs.writeFile(filePath, content, 'utf-8');

                        console.log(`   ✅ Enhanced: ${topic}`);
                        enhanced++;
                    } else {
                        console.log(`   ⚠️  Pattern not found: ${topic}`);
                        skipped++;
                    }
                } else {
                    skipped++;
                }

            } catch (error) {
                console.log(`   ❌ Error: ${topic} - ${error.message}`);
                skipped++;
            }
        }
    }

    console.log(`\n\n✨ Enhancement Complete!`);
    console.log(`   ✅ Enhanced: ${enhanced} pages`);
    console.log(`   ⏭️  Skipped: ${skipped} pages`);
}

// Run
enhanceAllPages().catch(console.error);
