# Read the file
$filePath = "c:\Users\Lenovo\Documents\webnurulilmi-main\webnurulilmi-main\index.html"
$content = Get-Content $filePath -Raw

# Old text to find (exact match with tabs)
$oldText = @"
							<p style="color: #666; font-size: 1.1rem;">YPI Nurul Ilmi menyediakan fasilitas lengkap untuk mendukung pembelajaran dan perkembangan seluruh peserta didik.</p>
						</div>
"@

# New text to replace with
$newText = @"
							<p style="color: #666; font-size: 1.1rem;">YPI Nurul Ilmi menyediakan fasilitas lengkap untuk mendukung pembelajaran dan perkembangan seluruh peserta didik.</p>
							<a href="galeri-fasilitas.html" class="btn-fasilitas-goto" style="display: inline-block; background: linear-gradient(135deg, #0A4F42, #0d6b5a); color: #fff; padding: 14px 35px; border-radius: 30px; font-weight: 600; text-decoration: none; transition: all 0.3s; box-shadow: 0 8px 25px rgba(10, 79, 66, 0.3); margin-top: 20px;">
								<i class="fas fa-images mr-2"></i>Lihat Fasilitas
							</a>
						</div>
"@

# Replace and save
$newContent = $content -replace [regex]::Escape($oldText), $newText
$newContent | Set-Content $filePath -NoNewline

Write-Host "Button added successfully!"
