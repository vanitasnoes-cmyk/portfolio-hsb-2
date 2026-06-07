Add-Type -AssemblyName System.Drawing

$srcPath = "C:/Users/USER/.gemini/antigravity/brain/569be0c9-133a-4206-93f1-1ae4dd410265/media__1780823935408.png"
$destPath = "C:/Users/USER/Downloads/Portfolio hsb 2/public/images/steps/bt5/01.jpeg"

if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found: $srcPath"
    exit 1
}

$img = [System.Drawing.Image]::FromFile($srcPath)
$width = $img.Width
$height = $img.Height

Write-Output "Image Dimensions: Width=$width, Height=$height"

# Crop the bottom half (the second image).
$cropY = [int]($height / 2)
$cropHeight = $height - $cropY

Write-Output "Cropping Y=$cropY to Height=$cropHeight"

$bmp = New-Object System.Drawing.Bitmap($width, $cropHeight)
$graph = [System.Drawing.Graphics]::FromImage($bmp)

$srcRect = New-Object System.Drawing.Rectangle(0, $cropY, $width, $cropHeight)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $width, $cropHeight)

$graph.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

# Ensure the output directory exists
$destDir = [System.IO.Path]::GetDirectoryName($destPath)
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

# Save as JPEG
$bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

# Clean up
$graph.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Output "Successfully cropped and saved to $destPath"
