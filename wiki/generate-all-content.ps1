# Main Content Generator Script
# Generates high-quality HTML content from content database

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

# Apply to pages
$pagesDir = "d:\Portofolio\wiki\pages"
$updated = 0

foreach ($pageKey in $contentDatabase.Keys) {
    $pageData = $contentDatabase[$pageKey]
    
    # Find the HTML file
    $htmlFile = Get-ChildItem -Path $pagesDir -Recurse -Filter "$pageKey.html" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if ($htmlFile) {
        $content = Get-Content -Path $htmlFile.FullName -Raw -Encoding UTF8
        
        # Check if page needs update (has "Coming Soon")
        if ($content -match "Coming Soon") {
            # Generate new content
            $newContent = Generate-ContentHTML `
                -title $pageData.title `
                -category $pageData.category `
                -badge $pageData.badge `
                -overview $pageData.overview `
                -concepts $pageData.concepts `
                -useCases $pageData.useCases `
                -bestPractices $pageData.bestPractices
            
            # Replace the content between <article> tags
            $pattern = '(<article class="doc-article">.*?<span class="doc-date">.*?</span>\s*</div>)(.*?)(</article>)'
            
            if ($content -match $pattern) {
                $content = $content -replace $pattern, ('$1' + "`n`n" + $newContent + "`n            " + '$3')
                
                # Save file
                Set-Content -Path $htmlFile.FullName -Value $content -Encoding UTF8 -NoNewline
                Write-Host "✅ Updated: $($pageData.title)" -ForegroundColor Green
                $updated++
            }
        } else {
            Write-Host "⏭️  Skipped (already has content): $($pageData.title)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  File not found for: $pageKey" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Pages updated with template content: $updated" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
