# Create Missing HTML Pages
$pages = @(
    @{
        filename = "strangler-fig.html"
        path = "patterns"
        title = "Strangler Fig Pattern"
        category = "Patterns"
        badge = "patterns"
        breadcrumb = "Design Patterns"
    },
    @{
        filename = "pydantic.html"
        path = "python"
        title = "Pydantic Data Validation"
        category = "Python"
        badge = "python"
        breadcrumb = "Python"
    },
    @{
        filename = "csharp-advanced.html"
        path = "dotnet"
        title = "Advanced C# Features"
        category = ".NET"
        badge = "dotnet"
        breadcrumb = ".NET Development"
    },
    @{
        filename = "bulkhead.html"
        path = "patterns"
        title = "Bulkhead Pattern"
        category = "Patterns"
        badge = "patterns"
        breadcrumb = "Design Patterns"
    },
    @{
        filename = "ansible.html"
        path = "devops"
        title = "Ansible Automation"
        category = "DevOps"
        badge = "devops"
        breadcrumb = "DevOps"
    },
    @{
        filename = "statefulsets.html"
        path = "kubernetes"
        title = "StatefulSets"
        category = "Kubernetes"
        badge = "kubernetes"
        breadcrumb = "Kubernetes"
    },
    @{
        filename = "retry-pattern.html"
        path = "patterns"
        title = "Retry Pattern"
        category = "Patterns"
        badge = "patterns"
        breadcrumb = "Design Patterns"
    }
)

foreach ($page in $pages) {
    $filepath = "d:\Portofolio\wiki\pages\$($page.path)\$($page.filename)"
    
    $htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$($page.title) - Hanung's Dev Wiki</title>
    <link rel="stylesheet" href="../../css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <header class="header">
        <div class="header-left">
            <button class="sidebar-toggle" id="sidebarToggle"><i class="fas fa-bars"></i></button>
            <a href="../../index.html" class="logo"><i class="fas fa-code"></i><span>Hanung's Dev Wiki</span></a>
        </div>
        <div class="header-right">
            <button class="theme-toggle" id="themeToggle"><i class="fas fa-moon"></i></button>
        </div>
    </header>

    <div class="container">
        <aside class="sidebar" id="sidebar"></aside>
        <main class="main-content">
            <div class="breadcrumb">
                <a href="../../index.html">Home</a><span>/</span>
                <a href="#">$($page.breadcrumb)</a><span>/</span>
                <span>$($page.title)</span>
            </div>

            <article class="doc-article">
                <h1>$($page.title)</h1>
                <div class="doc-meta">
                    <span class="badge badge-$($page.badge)">$($page.category)</span>
                    <span class="doc-date"><i class="fas fa-calendar"></i> Updated: Nov 25, 2025</span>
                </div>

                <section class="doc-section">
                    <h2>Overview</h2>
                    <p>
                        This page covers $($page.title). Content will be added soon.
                    </p>
                    <div class="info-box">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>Coming Soon:</strong> Detailed documentation, code examples, and best practices 
                            for $($page.title) will be available shortly.
                        </div>
                    </div>
                </section>

                <section class="doc-section">
                    <h2>Key Concepts</h2>
                    <ul>
                        <li>Fundamental principles and concepts</li>
                        <li>Common use cases and scenarios</li>
                        <li>Best practices and patterns</li>
                        <li>Real-world examples</li>
                    </ul>
                </section>

                <section class="doc-section">
                    <h2>Getting Started</h2>
                    <p>
                        Detailed tutorials and implementation guides coming soon.
                    </p>
                </section>
            </article>
        </main>
    </div>

    <script>
        // Load sidebar dynamically
        fetch('../../index.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const sidebarContent = doc.querySelector('.sidebar').innerHTML;
                const sidebarElement = document.getElementById('sidebar');
                
                if (sidebarElement) {
                    sidebarElement.innerHTML = sidebarContent;
                    console.log('✅ Sidebar loaded successfully');
                    
                    // Dispatch event after sidebar is loaded
                    const event = new Event('sidebarLoaded');
                    document.dispatchEvent(event);
                } else {
                    console.error('❌ Sidebar element not found');
                }
            })
            .catch(error => {
                console.error('❌ Error loading sidebar:', error);
            });
    </script>
    <script src="../../js/main.js"></script>
</body>
</html>
"@

    Set-Content -Path $filepath -Value $htmlContent -Encoding UTF8
    Write-Host "✅ Created: $($page.title) → $filepath" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "All 7 missing pages created!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
