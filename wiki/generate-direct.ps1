# Direct Content Replacement Script - Simple and Reliable
. ".\content-database.ps1"

function Generate-ContentHTML {
    param(
        [string]$title,
        [string]$category,
        [string]$badge,
        [string]$overview,
        [array]$concepts,
        [array]$useCases,
        [array]$bestPractices
    )
    
    $html = @"
                <section class="doc-section">
                    <h2>Overview</h2>
                    <p>$overview</p>
                    <div class="info-box">
                        <i class="fas fa-lightbulb"></i>
                        <div>
                            <strong>Why It Matters:</strong> Understanding $title is essential for building robust, scalable, and secure modern applications.
                        </div>
                    </div>
                </section>

                <section class="doc-section">
                    <h2>Key Concepts</h2>
                    <div class="checklist">
"@

    foreach ($concept in $concepts) {
        $html += @"

                        <div class="checklist-item">
                            <i class="fas fa-check-circle"></i>
                            <span>$concept</span>
                        </div>
"@
    }

    $html += @"

                    </div>
                </section>

                <section class="doc-section">
                    <h2>Common Use Cases</h2>
                    <div class="example-box">
                        <h4>Where to Apply $title</h4>
                        <ul>
"@

    foreach ($useCase in $useCases) {
        $html += @"

                            <li>$useCase</li>
"@
    }

    $html += @"

                        </ul>
                    </div>
                </section>

                <section class="doc-section">
                    <h2>Best Practices</h2>
                    <div class="checklist">
"@

    foreach ($practice in $bestPractices) {
        $html += @"

                        <div class="checklist-item">
                            <i class="fas fa-check-circle"></i>
                            <span>$practice</span>
                        </div>
"@
    }

    $html += @"

                    </div>
                </section>

                <section class="doc-section">
                    <h2>Implementation Guide</h2>
                    <p>
                        Detailed implementation examples, code snippets, and step-by-step tutorials for $title 
                        will be enhanced in future updates. For now, refer to official documentation and community resources.
                    </p>
                    <div class="example-box">
                        <h4>📚 Recommended Resources</h4>
                        <ul>
                            <li>Official documentation and API references</li>
                            <li>Industry best practices and design patterns</li>
                            <li>Real-world case studies and examples</li>
                            <li>Community tutorials and blog posts</li>
                            <li>Video courses and interactive learning platforms</li>
                        </ul>
                    </div>
                </section>

                <section class="doc-section">
                    <h2>Further Reading</h2>
                    <ul>
                        <li>Browse related topics in the sidebar navigation</li>
                        <li>Check official documentation for your tech stack</li>
                        <li>Join community forums and discussions</li>
                        <li>Follow industry blogs and newsletters</li>
                        <li>Practice with hands-on projects and tutorials</li>
                    </ul>
                </section>
"@

    return $html
}

# File mapping
$fileMapping = @{
    "authentication" = "backend\authentication.html"
    "caching" = "backend\caching.html"
    "database-optimization" = "backend\database-optimization.html"
    "message-queues" = "backend\message-queues.html"
    "dockerfile" = "docker\dockerfile.html"
    "compose" = "docker\compose.html"
    "networking" = "docker\networking.html"
    "service-discovery" = "microservices\service-discovery.html"
    "api-gateway" = "microservices\api-gateway.html"
    "saga-pattern" = "microservices\saga-pattern.html"
    "event-driven" = "microservices\event-driven.html"
    "clean-architecture" = "architecture\clean-architecture.html"
    "cqrs" = "architecture\cqrs.html"
    "event-sourcing" = "architecture\event-sourcing.html"
    "ddd" = "architecture\ddd.html"
    "circuit-breaker" = "microservices\circuit-breaker.html"
    "k8s-intro" = "kubernetes\introduction.html"
    "deployments" = "kubernetes\pods.html"
    "services-ingress" = "kubernetes\services.html"
    "configmaps-secrets" = "kubernetes\configmaps.html"
    "helm" = "kubernetes\helm.html"
    "aspnet-core" = "dotnet\aspnet-core.html"
    "ef-core" = "dotnet\ef-core.html"
    "dotnet-testing" = "dotnet\testing.html"
    "fastapi" = "python\fastapi.html"
    "django" = "python\django.html"
    "python-async" = "python\async.html"
    "postgresql" = "database\postgresql.html"
    "mongodb" = "database\mongodb.html"
    "redis" = "database\redis.html"
    "sql-optimization" = "database\indexing.html"
    "github-actions" = "devops\github-actions.html"
    "jenkins" = "devops\jenkins.html"
    "terraform" = "devops\terraform.html"
    "strangler-fig" = "patterns\strangler-fig.html"
    "pydantic" = "python\pydantic.html"
    "csharp-advanced" = "dotnet\csharp-advanced.html"
    "bulkhead" = "patterns\bulkhead.html"
    "ansible" = "devops\ansible.html"
    "statefulsets" = "kubernetes\statefulsets.html"
    "retry-pattern" = "patterns\retry-pattern.html"
}

$pagesDir = "d:\Portofolio\wiki\pages"
$updated = 0
$skipped = 0
$notFound = 0

foreach ($pageKey in $contentDatabase.Keys) {
    $pageData = $contentDatabase[$pageKey]
    
    # Get mapped filename
    if (-not $fileMapping.ContainsKey($pageKey)) {
        Write-Host "⚠️  No mapping for key: $pageKey" -ForegroundColor Red
        $notFound++
        continue
    }
    
    $relativePath = $fileMapping[$pageKey]
    $htmlFile = Join-Path -Path $pagesDir -ChildPath $relativePath
    
    if (Test-Path $htmlFile) {
        $content = Get-Content -Path $htmlFile -Raw -Encoding UTF8
        
        # Check if needs update
        if ($content -notmatch "Coming Soon") {
            Write-Host "⏭️  Skipped (no 'Coming Soon' marker): $($pageData.title)" -ForegroundColor Yellow
            $skipped++
            continue
        }
        
        # Find the section markers and replace
        $lines = $content -split "`r?`n"
        $startIdx = -1
        $endIdx = -1
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match 'class="doc-date"' -and $startIdx -eq -1) {
                # Find the next few lines until we hit a section
                $maxJ = [Math]::Min($i + 10, $lines.Count)
                for ($j = $i; $j -lt $maxJ; $j++) {
                    if ($lines[$j] -match '</div>\s*$' -and $lines[$j] -notmatch 'doc-meta') {
                        $startIdx = $j
                        break
                    }
                }
            }
            if ($lines[$i] -match '</article>' -and $startIdx -ne -1) {
                $endIdx = $i
                break
            }
        }
        
        if ($startIdx -ne -1 -and $endIdx -ne -1) {
            # Build new content
            $newContent = Generate-ContentHTML `
                -title $pageData.title `
                -category $pageData.category `
                -badge $pageData.badge `
                -overview $pageData.overview `
                -concepts $pageData.concepts `
                -useCases $pageData.useCases `
                -bestPractices $pageData.bestPractices
            
            # Reconstruct file
            $newLines = @()
            $newLines += $lines[0..$startIdx]
            $newLines += ""
            $newLines += $newContent
            $newLines += "            " + $lines[$endIdx]
            $newLines += $lines[($endIdx+1)..($lines.Count-1)]
            
            $newFileContent = $newLines -join "`r`n"
            Set-Content -Path $htmlFile -Value $newFileContent -Encoding UTF8 -NoNewline
            
            Write-Host "✅ Updated: $($pageData.title)" -ForegroundColor Green
            $updated++
        } else {
            Write-Host "⚠️  Could not find markers in: $($pageData.title)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  File not found: $relativePath" -ForegroundColor Red
        $notFound++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Pages updated: $updated" -ForegroundColor Green
Write-Host "Pages skipped: $skipped" -ForegroundColor Yellow
Write-Host "Pages not found: $notFound" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
