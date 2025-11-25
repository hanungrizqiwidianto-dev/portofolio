# PowerShell script to add sidebar loading script to all pages

$pagesDir = "d:\Portofolio\wiki\pages"

# Script to load sidebar
$sidebarScript = @'

    <script>
        // Load sidebar dynamically
        fetch('../../index.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const sidebarContent = doc.querySelector('.sidebar').innerHTML;
                document.getElementById('sidebar').innerHTML = sidebarContent;
                
                // Re-run sidebar initialization from main.js
                const event = new Event('sidebarLoaded');
                document.dispatchEvent(event);
            });
    </script>
'@

# Get all HTML files recursively
$htmlFiles = Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html"

$count = 0
foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Check if sidebar script already exists
    if ($content -notmatch "Load sidebar dynamically") {
        # Find the closing </body> tag and insert script before it
        $content = $content -replace '</body>', ($sidebarScript + "`n</body>")
        
        # Save the file
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Added sidebar script to: $($file.FullName)" -ForegroundColor Green
        $count++
    }
}

Write-Host "`nTotal files updated: $count" -ForegroundColor Cyan
