# Smart Content Generator - Matches files intelligently
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

# File mapping - map content keys to actual filenames
$fileMapping = @{
    "authentication" = "authentication.html"
    "caching" = "caching.html"
    "database-optimization" = "database-optimization.html"
    "message-queues" = "message-queues.html"
    "dockerfile" = "dockerfile.html"
    "compose" = "compose.html"
    "networking" = "networking.html"
    "service-discovery" = "service-discovery.html"
    "api-gateway" = "api-gateway.html"
    "saga-pattern" = "saga-pattern.html"
    "event-driven" = "event-driven.html"
    "clean-architecture" = "clean-architecture.html"
    "cqrs" = "cqrs.html"
    "event-sourcing" = "event-sourcing.html"
    "ddd" = "ddd.html"
    "circuit-breaker" = "circuit-breaker.html"
    "retry-pattern" = "retry-pattern.html"  # May not exist
    "bulkhead" = "bulkhead.html"  # May not exist
    "strangler-fig" = "strangler-fig.html"  # May not exist
    "k8s-intro" = "introduction.html"  # Kubernetes intro
    "deployments" = "pods.html"  # Kubernetes deployments
    "services-ingress" = "services.html" # or ingress.html
    "configmaps-secrets" = "configmaps.html"
    "statefulsets" = "statefulsets.html"  # May not exist
    "helm" = "helm.html"
    "aspnet-core" = "aspnet-core.html"
    "ef-core" = "ef-core.html"
    "csharp-advanced" = "csharp-advanced.html"  # May not exist
    "dotnet-testing" = "testing.html"  # .NET testing
    "fastapi" = "fastapi.html"
    "django" = "django.html"
    "python-async" = "async.html"
    "pydantic" = "pydantic.html"  # May not exist
    "postgresql" = "postgresql.html"
    "mongodb" = "mongodb.html"
    "redis" = "redis.html"
    "sql-optimization" = "indexing.html"  # SQL optimization
    "github-actions" = "github-actions.html"
    "jenkins" = "jenkins.html"
    "terraform" = "terraform.html"
    "ansible" = "ansible.html"  # May not exist
}

$pagesDir = "d:\Portofolio\wiki\pages"
$updated = 0
$skipped = 0
$notFound = 0

foreach ($pageKey in $contentDatabase.Keys) {
    $pageData = $contentDatabase[$pageKey]
    
    # Get mapped filename or use key as-is
    $filename = if ($fileMapping.ContainsKey($pageKey)) { 
        $fileMapping[$pageKey] 
    } else { 
        "$pageKey.html" 
    }
    
    # Find the HTML file
    $htmlFile = Get-ChildItem -Path $pagesDir -Recurse -Filter $filename -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if ($htmlFile) {
        $content = Get-Content -Path $htmlFile.FullName -Raw -Encoding UTF8
        
        # Check if page needs update (has "Coming Soon" or basic placeholder content)
        if ($content -match "Coming Soon" -or $content -match "Content will be added soon") {
            # Generate new content
            $newContent = Generate-ContentHTML `
                -title $pageData.title `
                -category $pageData.category `
                -badge $pageData.badge `
                -overview $pageData.overview `
                -concepts $pageData.concepts `
                -useCases $pageData.useCases `
                -bestPractices $pageData.bestPractices
            
            # Simple approach: find doc-meta closing, then replace until </article>
            $startPattern = '(<div class="doc-meta">.*?</div>)'
            $endPattern = '(</article>)'
            
            # Match everything between doc-meta and </article>
            if ($content -match "$startPattern[\s\S]*?$endPattern") {
                $replacement = '$1' + "`n`n" + $newContent + "`n            " + '$2'
                $content = $content -replace "$startPattern[\s\S]*?$endPattern", $replacement
                
                # Save file
                Set-Content -Path $htmlFile.FullName -Value $content -Encoding UTF8 -NoNewline
                Write-Host "✅ Updated: $($pageData.title) → $filename" -ForegroundColor Green
                $updated++
            } else {
                Write-Host "⚠️  Pattern match failed for: $($pageData.title)" -ForegroundColor Yellow
                Write-Host "     File: $($htmlFile.FullName)" -ForegroundColor Gray
            }
        } else {
            Write-Host "⏭️  Skipped (already has content): $($pageData.title)" -ForegroundColor Yellow
            $skipped++
        }
    } else {
        Write-Host "⚠️  File not found: $filename (key: $pageKey)" -ForegroundColor Red
        $notFound++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Pages updated: $updated" -ForegroundColor Green
Write-Host "Pages skipped (has content): $skipped" -ForegroundColor Yellow
Write-Host "Pages not found: $notFound" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
