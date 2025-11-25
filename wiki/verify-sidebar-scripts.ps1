# Verify Sidebar Scripts in All Pages
Write-Host "`n🔍 Checking sidebar scripts in all HTML pages..." -ForegroundColor Cyan

$pagesDir = "d:\Portofolio\wiki\pages"
$allFiles = Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html"

$results = @{
    "HasSidebarScript" = @()
    "MissingSidebarScript" = @()
    "WrongPath" = @()
}

foreach ($file in $allFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Check if has sidebar loading script
    if ($content -match 'fetch\([''"].*index\.html[''"]') {
        $results["HasSidebarScript"] += $file.FullName
        
        # Check if path is correct based on file location
        $relativePath = $file.FullName.Replace("$pagesDir\", "")
        $depth = ($relativePath.Split('\').Length) - 1
        
        if ($depth -eq 0) {
            # Files in pages/ should use ../index.html
            if ($content -notmatch 'fetch\([''"]\.\.\/index\.html[''"]') {
                $results["WrongPath"] += "$($file.Name) - Should use ../index.html"
            }
        } else {
            # Files in subdirectories should use ../../index.html
            if ($content -notmatch 'fetch\([''"]\.\.\/\.\.\/index\.html[''"]') {
                $results["WrongPath"] += "$($file.Name) - Should use ../../index.html (depth: $depth)"
            }
        }
    } else {
        $results["MissingSidebarScript"] += $file.FullName
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 VERIFICATION RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n✅ Files with sidebar script: $($results['HasSidebarScript'].Count)" -ForegroundColor Green
if ($results["HasSidebarScript"].Count -gt 0 -and $results["HasSidebarScript"].Count -le 5) {
    foreach ($file in $results["HasSidebarScript"]) {
        Write-Host "   - $file" -ForegroundColor Gray
    }
}

Write-Host "`n⚠️  Files with WRONG paths: $($results['WrongPath'].Count)" -ForegroundColor Yellow
if ($results["WrongPath"].Count -gt 0) {
    foreach ($file in $results["WrongPath"]) {
        Write-Host "   - $file" -ForegroundColor Yellow
    }
}

Write-Host "`n❌ Files MISSING sidebar script: $($results['MissingSidebarScript'].Count)" -ForegroundColor Red
if ($results["MissingSidebarScript"].Count -gt 0) {
    foreach ($file in $results["MissingSidebarScript"]) {
        Write-Host "   - $file" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
if ($results["WrongPath"].Count -eq 0 -and $results["MissingSidebarScript"].Count -eq 0) {
    Write-Host "🎉 All files are configured correctly!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some files need attention" -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan
