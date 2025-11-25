# PowerShell script to create remaining wiki pages

$pages = @{
    "backend" = @(
        @{name="authentication"; title="Authentication & Authorization"},
        @{name="database-optimization"; title="Database Optimization"},
        @{name="caching"; title="Caching Strategies"},
        @{name="message-queues"; title="Message Queues"}
    )
    "microservices" = @(
        @{name="introduction"; title="Introduction to Microservices"},
        @{name="service-discovery"; title="Service Discovery"},
        @{name="api-gateway"; title="API Gateway Pattern"},
        @{name="circuit-breaker"; title="Circuit Breaker"},
        @{name="saga-pattern"; title="Saga Pattern"},
        @{name="event-driven"; title="Event-Driven Architecture"}
    )
    "docker" = @(
        @{name="dockerfile"; title="Dockerfile Best Practices"},
        @{name="compose"; title="Docker Compose"},
        @{name="networking"; title="Docker Networking"},
        @{name="volumes"; title="Volumes & Data"},
        @{name="multi-stage"; title="Multi-Stage Builds"}
    )
    "architecture" = @(
        @{name="clean-architecture"; title="Clean Architecture"},
        @{name="hexagonal"; title="Hexagonal Architecture"},
        @{name="layered"; title="Layered Architecture"},
        @{name="event-sourcing"; title="Event Sourcing"},
        @{name="cqrs"; title="CQRS Pattern"},
        @{name="ddd"; title="Domain-Driven Design"}
    )
    "kubernetes" = @(
        @{name="introduction"; title="K8s Introduction"},
        @{name="pods"; title="Pods & Deployments"},
        @{name="services"; title="Services & Networking"},
        @{name="configmaps"; title="ConfigMaps & Secrets"},
        @{name="ingress"; title="Ingress Controllers"},
        @{name="helm"; title="Helm Charts"}
    )
    "dotnet" = @(
        @{name="aspnet-core"; title="ASP.NET Core"},
        @{name="ef-core"; title="Entity Framework Core"},
        @{name="minimal-api"; title="Minimal APIs"},
        @{name="middleware"; title="Middleware Pipeline"},
        @{name="dependency-injection"; title="Dependency Injection"},
        @{name="testing"; title="Unit Testing"}
    )
    "python" = @(
        @{name="fastapi"; title="FastAPI Framework"},
        @{name="django"; title="Django Framework"},
        @{name="async"; title="Async Programming"},
        @{name="sqlalchemy"; title="SQLAlchemy ORM"},
        @{name="celery"; title="Celery Tasks"},
        @{name="testing"; title="Pytest"}
    )
    "database" = @(
        @{name="sql-fundamentals"; title="SQL Fundamentals"},
        @{name="postgresql"; title="PostgreSQL"},
        @{name="mongodb"; title="MongoDB"},
        @{name="redis"; title="Redis"},
        @{name="indexing"; title="Indexing Strategies"},
        @{name="transactions"; title="Transactions & ACID"}
    )
    "devops" = @(
        @{name="git"; title="Git Workflow"},
        @{name="github-actions"; title="GitHub Actions"},
        @{name="jenkins"; title="Jenkins Pipeline"},
        @{name="terraform"; title="Terraform IaC"},
        @{name="monitoring"; title="Monitoring & Logging"}
    )
}

$template = @'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{TITLE} - Hanung's Dev Wiki</title>
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
                <a href="#">{CATEGORY}</a><span>/</span>
                <span>{TITLE}</span>
            </div>

            <article class="doc-article">
                <h1>{TITLE}</h1>
                <div class="doc-meta">
                    <span class="badge badge-{BADGE}">{CATEGORY}</span>
                    <span class="doc-date"><i class="fas fa-calendar"></i> Updated: Nov 25, 2025</span>
                </div>

                <section class="doc-section">
                    <h2>Overview</h2>
                    <p>
                        This page covers {TITLE}. Content will be added soon.
                    </p>
                    <div class="info-box">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>Coming Soon:</strong> Detailed documentation, code examples, and best practices 
                            for {TITLE} will be available shortly.
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
    <script src="../../js/main.js"></script>
</body>
</html>
'@

foreach ($category in $pages.Keys) {
    $categoryName = $category -replace "-", " "
    $categoryName = (Get-Culture).TextInfo.ToTitleCase($categoryName)
    $badge = $category
    
    foreach ($page in $pages[$category]) {
        $fileName = "$($page.name).html"
        $filePath = "d:\Portofolio\wiki\pages\$category\$fileName"
        
        if (-not (Test-Path $filePath)) {
            $content = $template -replace "{TITLE}", $page.title
            $content = $content -replace "{CATEGORY}", $categoryName
            $content = $content -replace "{BADGE}", $badge
            
            Set-Content -Path $filePath -Value $content -Encoding UTF8
            Write-Host "Created: $filePath" -ForegroundColor Green
        } else {
            Write-Host "Skipped: $filePath (already exists)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nAll pages created successfully!" -ForegroundColor Cyan
