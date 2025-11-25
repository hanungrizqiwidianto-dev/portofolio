# PowerShell script to fix sidebar loading order in all pages

$pagesDir = "d:\Portofolio\wiki\pages"

# Correct sidebar loading script
$correctSidebarScript = @'

    <script>
        // Load sidebar dynamically FIRST before loading main.js
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
'@

# Get all HTML files recursively
$htmlFiles = Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html"

$count = 0
$fixed = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Remove old sidebar script if exists
    $content = $content -replace '<script>\s*//\s*Load sidebar dynamically.*?</script>\s*', ''
    
    # Remove main.js if it's at the end
    $content = $content -replace '<script src="../../js/main\.js"></script>\s*</body>', '</body>'
    
    # Find the closing </main> and </div> tags before </body>
    if ($content -match '(</main>\s*</div>)\s*(<script.*?)?</body>') {
        # Insert the correct script before </body>
        $content = $content -replace '(</main>\s*</div>)\s*', ('$1' + $correctSidebarScript + "`n    ")
        
        # Clean up any duplicate scripts
        $content = $content -replace '(<script src="../../js/main\.js"></script>\s*){2,}', '<script src="../../js/main.js"></script>'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            Write-Host "✅ Fixed: $($file.Name)" -ForegroundColor Green
            $fixed++
        } else {
            Write-Host "⏭️  Skipped (no change): $($file.Name)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Warning: Pattern not found in: $($file.Name)" -ForegroundColor Red
    }
    
    $count++
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Total files processed: $count" -ForegroundColor Cyan
Write-Host "Files fixed: $fixed" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
