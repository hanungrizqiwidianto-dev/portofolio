# Simple script to fix ALL pages - append sidebar script if not exists in correct position

$pagesDir = "d:\Portofolio\wiki\pages"

$sidebarLoadScript = @'
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
'@

# Get all HTML files
$htmlFiles = Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html"

$fixed = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Check if file needs fixing
    if ($content -match '</main>\s*</div>') {
        # Remove any existing sidebar load scripts
        $content = $content -replace '<script>\s*//\s*Load sidebar dynamically.*?</script>', ''
        
        # Find position of </body> tag
        if ($content -match '</body>') {
            # Remove main.js script temporarily
            $contentWithoutMainJs = $content -replace '\s*<script src="\.\.\/\.\.\/js\/main\.js"></script>', ''
            
            # Insert sidebar script + main.js before </body>
            $contentWithoutMainJs = $contentWithoutMainJs -replace '</body>', ($sidebarLoadScript + "`n    <script src=`"../../js/main.js`"></script>`n</body>")
            
            # Save file
            Set-Content -Path $file.FullName -Value $contentWithoutMainJs -Encoding UTF8 -NoNewline
            Write-Host "✅ Fixed: $($file.Name)" -ForegroundColor Green
            $fixed++
        }
    }
}

Write-Host "`nTotal files fixed: $fixed" -ForegroundColor Cyan
