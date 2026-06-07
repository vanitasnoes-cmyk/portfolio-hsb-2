Add-Type -AssemblyName System.Drawing

$files = @(
    "C:/Users/USER/.gemini/antigravity/brain/569be0c9-133a-4206-93f1-1ae4dd410265/media__1780824294644.png",
    "C:/Users/USER/.gemini/antigravity/brain/569be0c9-133a-4206-93f1-1ae4dd410265/media__1780824306741.png"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $img = [System.Drawing.Image]::FromFile($f)
        Write-Output "File: $(Split-Path $f -Leaf) - Width: $($img.Width), Height: $($img.Height)"
        $img.Dispose()
    } else {
        Write-Output "File not found: $f"
    }
}
