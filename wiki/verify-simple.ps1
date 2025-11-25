# Verify Sidebar Scripts - Simplified
Write-Host "`nChecking sidebar scripts in all pages...`n" -ForegroundColor Cyan

$pagesDir = "D:\Portofolio\wiki\pages"
$allFiles = Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html"

$hasScript = 0
$missing = 0
$wrongPath = 0

foreach ($file in $allFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $relativePath = $file.FullName.Replace($pagesDir, "").TrimStart('\')
    
    if ($content -match 'fetch.*index\.html') {
        $hasScript++
        
        # Determine correct path depth - count backslashes in relative path
        $pathParts = $relativePath.Split('\')
        $depth = $pathParts.Length - 1
        
        $expectedPath = if ($depth -eq 0) { '../index.html' } else { '../../index.html' }
        
        if ($content -notmatch [regex]::Escape($expectedPath)) {
            Write-Host "⚠️  WRONG PATH: $relativePath (depth: $depth)" -ForegroundColor Yellow
            Write-Host "   Expected: $expectedPath" -ForegroundColor Gray
            
            # Show what it currently has
            if ($content -match "fetch\('([^']+)'\)") {
                Write-Host "   Current: $($matches[1])" -ForegroundColor Gray
            }
            $wrongPath++
        }
    } else {
        Write-Host "❌ MISSING: $relativePath" -ForegroundColor Red
        $missing++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Total files: $($allFiles.Count)" -ForegroundColor White
Write-Host "✅ Has sidebar script: $hasScript" -ForegroundColor Green
Write-Host "⚠️  Wrong path: $wrongPath" -ForegroundColor Yellow
Write-Host "❌ Missing script: $missing" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

if ($wrongPath -eq 0 -and $missing -eq 0) {
    Write-Host "🎉 All files configured correctly!`n" -ForegroundColor Green
}
