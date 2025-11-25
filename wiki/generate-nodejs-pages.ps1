# Generate Node.js pages
Write-Host "Generating Node.js documentation pages..." -ForegroundColor Green

# Page data
$pages = @(
    @{
        filename = "nestjs.html"
        title = "NestJS Framework"
        description = "Build scalable server-side applications with NestJS - a progressive Node.js framework with TypeScript support."
        icon = "fab fa-node-js"
    },
    @{
        filename = "async-patterns.html"
        title = "Async Patterns & Promises"
        description = "Master asynchronous programming in Node.js with Promises, async/await, and event-driven patterns."
        icon = "fas fa-sync-alt"
    },
    @{
        filename = "prisma.html"
        title = "Prisma ORM"
        description = "Next-generation ORM for Node.js and TypeScript with type-safe database access."
        icon = "fas fa-database"
    },
    @{
        filename = "testing.html"
        title = "Jest & Testing"
        description = "Write comprehensive tests for Node.js applications using Jest testing framework."
        icon = "fas fa-vial"
    },
    @{
        filename = "npm-packages.html"
        title = "NPM & Package Management"
        description = "Manage Node.js dependencies and publish packages using NPM and modern package management."
        icon = "fab fa-npm"
    }
)

foreach ($page in $pages) {
    $content = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$($page.title) - Node.js Development</title>
    <link rel="stylesheet" href="../../css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div id="sidebarContainer"></div>

    <div class="container">
        <main class="content">
            <div class="page-header">
                <div class="breadcrumb">
                    <a href="../../index.html">Home</a>
                    <span>/</span>
                    <a href="#">Node.js Development</a>
                    <span>/</span>
                    <span>$($page.title)</span>
                </div>
                <h1><i class="$($page.icon)"></i> $($page.title)</h1>
                <p class="page-description">$($page.description)</p>
            </div>

            <div class="content-section">
                <h2><i class="fas fa-info-circle"></i> Overview</h2>
                <p>Comprehensive guide to $($page.title.ToLower()) in Node.js development.</p>
            </div>

            <div class="content-section">
                <h2><i class="fas fa-code"></i> Getting Started</h2>
                <pre><code>// Coming soon: Detailed code examples and best practices</code></pre>
            </div>

            <div class="navigation-links">
                <a href="express.html" class="nav-link"><i class="fas fa-arrow-left"></i> Back to Express</a>
            </div>
        </main>
    </div>

    <script>
        fetch('../../index.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const sidebar = doc.querySelector('.sidebar');
                if (sidebar) {
                    document.getElementById('sidebarContainer').appendChild(sidebar);
                    const event = new Event('sidebarLoaded');
                    document.dispatchEvent(event);
                }
            });
    </script>
    <script src="../../js/main.js"></script>
</body>
</html>
"@

    $filepath = "pages\nodejs\$($page.filename)"
    $content | Out-File -FilePath $filepath -Encoding UTF8
    Write-Host "Created: $filepath" -ForegroundColor Cyan
}

Write-Host "`nAll Node.js pages created successfully!" -ForegroundColor Green
