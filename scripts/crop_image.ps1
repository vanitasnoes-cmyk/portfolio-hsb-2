Add-Type -AssemblyName System.Drawing

$srcPath = "C:/Users/USER/.gemini/antigravity/brain/569be0c9-133a-4206-93f1-1ae4dd410265/media__1780824306741.png"
$destPath1 = "C:/Users/USER/Downloads/Portfolio hsb 2/public/images/steps/bt5/01.jpeg"
$destPath2 = "C:/Users/USER/Downloads/Portfolio hsb 2/public/images/steps/bt5/02.jpeg"

if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found: $srcPath"
    exit 1
}

$img = [System.Drawing.Image]::FromFile($srcPath)
$width = $img.Width
$height = $img.Height

Write-Output "Image Dimensions: Width=$width, Height=$height"

# Split vertically in half
$halfHeight = [int]($height / 2)

Write-Output "Splitting image: top half (0 to $halfHeight) and bottom half ($halfHeight to $height)"

# 1. Top half (Section I)
$bmp1 = New-Object System.Drawing.Bitmap($width, $halfHeight)
$graph1 = [System.Drawing.Graphics]::FromImage($bmp1)
$srcRect1 = New-Object System.Drawing.Rectangle(0, 0, $width, $halfHeight)
$destRect1 = New-Object System.Drawing.Rectangle(0, 0, $width, $halfHeight)
$graph1.DrawImage($img, $destRect1, $srcRect1, [System.Drawing.GraphicsUnit]::Pixel)
$bmp1.Save($destPath1, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$graph1.Dispose()
$bmp1.Dispose()
Write-Output "Saved top half to $destPath1"

# 2. Bottom half (Section II)
$cropHeight = $height - $halfHeight
$bmp2 = New-Object System.Drawing.Bitmap($width, $cropHeight)
$graph2 = [System.Drawing.Graphics]::FromImage($bmp2)
$srcRect2 = New-Object System.Drawing.Rectangle(0, $halfHeight, $width, $cropHeight)
$destRect2 = New-Object System.Drawing.Rectangle(0, 0, $width, $cropHeight)
$graph2.DrawImage($img, $destRect2, $srcRect2, [System.Drawing.GraphicsUnit]::Pixel)
$bmp2.Save($destPath2, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$graph2.Dispose()
$bmp2.Dispose()
Write-Output "Saved bottom half to $destPath2"

$img.Dispose()
Write-Output "Successfully split and saved both image steps!"
