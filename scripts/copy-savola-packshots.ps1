$src = "C:\Users\asus\OneDrive\Desktop\savola pack shots"
$dst = "C:\Users\asus\OneDrive\Desktop\website\shop\public\products"

# List of [productId, relativePath]
$map = @(
  @("113", "400 Gm\Penne.png"),
  @("114", "1 Kg\El Maleka Small Rings 1KG-3D.png"),
  @("115", "maleka lasagne new.png"),
  @("116", "400 Gm\Melouki penne.png"),
  @("117", "1 Kg\El Maleka Spaghetti 1KG-3D.png"),
  @("118", "Italiano Box Big Shells - 2026.png"),
  @("119", "1 Kg\El Maleka Vermicelli 1KG-3D.png"),
  @("120", "Italiano Box lasagna - 2026.png"),
  @("121", "Italiano Box canelonni - 2026.png"),
  @("122", "OOH Pack Shots\Afia Corn 0.7L.png"),
  @("123", "OOH Pack Shots\02-25Afia Corn 1.6L copy mockup.jpg"),
  @("124", "OOH Pack Shots\New Afia 2.0 corn 2.2L Front.jpg"),
  @("125", "OOH Pack Shots\Afia Plus 0.7L.jpg"),
  @("126", "OOH Pack Shots\10-29 Afia Plus 1.6L new copy.jpg"),
  @("127", "OOH Pack Shots\New Afia Plus 2.2L Front.jpg"),
  @("128", "OOH Pack Shots\Afia Sunflower 0.8L.jpg"),
  @("129", "OOH Pack Shots\02-25 Afia Sunflower 1.6L copy mockup.jpg"),
  @("130", "OOH Pack Shots\New Afia Sunflower 2.2L Front.jpg"),
  @("131", "OOH Pack Shots\SLite SF 0.675L.png"),
  @("132", "OOH Pack Shots\SLITE_1.5L_Sunflower.png"),
  @("133", "OOH Pack Shots\Slite SF 2.1.jpg"),
  @("134", "OOH Pack Shots\Helwa 750ML.png"),
  @("135", "OOH Pack Shots\Helwa 750ML.png"),
  @("136", "OOH Pack Shots\Helwa 2.25 Lit.jpg"),
  @("137", "OOH Pack Shots\Helwa SF 4.5L packshot.png"),
  @("138", "OOH Pack Shots\Hanady_1Lit_2020.png"),
  @("139", "OOH Pack Shots\Hanady_1Lit_2020_with_Icon.png"),
  @("140", "OOH Pack Shots\Hanady 2.1_2020.png"),
  @("141", "OOH Pack Shots\Rawaby 350gm.png"),
  @("142", "OOH Pack Shots\Rawaby 1.25 pouch .png"),
  @("143", "OOH Pack Shots\Rawaby Tin.png"),
  @("144", "OOH Pack Shots\Rawaby Tin.png"),
  @("145", "OOH Pack Shots\Rawaby 11k mockup.png"),
  @("146", "OOH Pack Shots\Mockup 1 Al tahi.png"),
  @("147", "OOH Pack Shots\Mockup 1 Al tahi.png"),
  @("148", "OOH Pack Shots\Mockup 1 Al tahi.png"),
  @("149", "OOH Pack Shots\Ganna mix Mock-up.jpeg"),
  @("150", "OOH Pack Shots\Mockup 1 Al tahi.png"),
  @("151", "OOH Pack Shots\Mockup 1 Al tahi.png")
)

$ok = 0; $fail = 0

foreach ($entry in $map) {
  $id       = $entry[0]
  $relPath  = $entry[1]
  $srcFile  = Join-Path $src $relPath
  $ext      = [System.IO.Path]::GetExtension($srcFile).ToLower()
  $destFile = Join-Path $dst ($id + $ext)

  if (Test-Path $srcFile) {
    # Remove any old file with a different extension for this ID
    foreach ($oldExt in @(".jpg",".jpeg",".png",".webp")) {
      $oldFile = Join-Path $dst ($id + $oldExt)
      if ($oldFile -ne $destFile -and (Test-Path $oldFile)) {
        Remove-Item $oldFile -Force
      }
    }
    Copy-Item $srcFile $destFile -Force
    $sizeKB = [math]::Round((Get-Item $destFile).Length / 1KB, 1)
    Write-Host ("OK  {0} -> {1} ({2} KB)" -f $id, ([System.IO.Path]::GetFileName($srcFile)), $sizeKB)
    $ok++
  } else {
    Write-Host ("MISS {0} -> NOT FOUND: {1}" -f $id, $srcFile)
    $fail++
  }
}

Write-Host ""
Write-Host ("Finished: {0} copied, {1} not found" -f $ok, $fail)

# Show final count
$allImages = Get-ChildItem $dst -File | Where-Object { $_.Name -match '^\d+\.(jpg|jpeg|png|webp)$' }
Write-Host ("Total product images in public/products: {0}" -f $allImages.Count)
