$filePath = "c:\Users\Lenovo\Documents\webnurulilmi-main\webnurulilmi-main\index.html"
$content = Get-Content $filePath -Raw

# Find the exact text pattern
$searchText = '<p style="color: #666; font-size: 1.1rem;">YPI Nurul Ilmi menyediakan fasilitas lengkap untuk mendukung pembelajaran dan perkembangan seluruh peserta didik.</p>'
$searchText = $searchText -replace '\r?\n', '' -replace '\s+', ' '

# New button to add after the paragraph
$buttonHtml = '<a href="galeri-fasilitas.html" class="btn-fasilitas-goto" style="display: inline-block; background: linear-gradient(135deg, #0A4F42, #0d6b5a); color: #fff; padding: 14px 35px; border-radius: 30px; font-weight: 600; text-decoration: none; transition: all 0.3s; box-shadow: 0 8px 25px rgba(10, 79, 66, 0.3); margin-top: 20px;"><i class="fas fa-images mr-2"></i>Lihat Fasilitas</a>'

# Simple line by line replacement
$lines = Get-Content $filePath
$newLines = @()
$found = $false

foreach ($line in $lines) {
    $newLines += $line
    if ($line -match 'YPI Nurul Ilmi menyediakan fasilitas lengkap untuk mendukung pembelajaran dan perkembangan seluruh peserta didik' -and -not $found) {
        $found = $true
        # Add the button after this line
        $indent = $line -replace '(<[^>]*>).*', '$1' -replace '<[^>]*>', ''
        # Match indentation based on leading spaces/tabs
        if ($line -match '^(\s*)') {
            $spaces = $matches[1]
            $newLines += "$spaces$buttonHtml"
        } else {
            $newLines += $buttonHtml
        }
    }
}

$newLines | Set-Content $filePath -Encoding UTF8
Write-Host "Button added successfully!"
