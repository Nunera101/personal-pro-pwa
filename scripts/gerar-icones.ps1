param(
  [string]$OutputDir = "assets"
)

Add-Type -AssemblyName System.Drawing

function New-AppIcon {
  param(
    [string]$Path,
    [int]$Size,
    [bool]$Maskable = $false
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $brand = [System.Drawing.Color]::FromArgb(11, 107, 87)
  $accent = [System.Drawing.Color]::FromArgb(231, 168, 62)
  $white = [System.Drawing.Color]::White

  $graphics.Clear($brand)

  $padding = if ($Maskable) { [int]($Size * 0.18) } else { [int]($Size * 0.12) }
  $rect = New-Object System.Drawing.Rectangle $padding, $padding, ($Size - ($padding * 2)), ($Size - ($padding * 2))
  $radius = [int]($Size * 0.18)

  $pathObj = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $pathObj.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
  $pathObj.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
  $pathObj.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $pathObj.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $pathObj.CloseFigure()

  $graphics.FillPath((New-Object System.Drawing.SolidBrush $white), $pathObj)

  $fontSize = [int]($Size * 0.26)
  $font = New-Object System.Drawing.Font "Arial", $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center

  $textRect = New-Object System.Drawing.RectangleF 0, ([int]($Size * 0.08)), $Size, ([int]($Size * 0.68))
  $graphics.DrawString("PP", $font, (New-Object System.Drawing.SolidBrush $brand), $textRect, $format)

  $barHeight = [int]($Size * 0.035)
  $barWidth = [int]($Size * 0.34)
  $barX = [int](($Size - $barWidth) / 2)
  $barY = [int]($Size * 0.70)
  $barRect = New-Object System.Drawing.Rectangle $barX, $barY, $barWidth, $barHeight
  $graphics.FillRectangle((New-Object System.Drawing.SolidBrush $accent), $barRect)

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-Item -ItemType Directory -Force $OutputDir | Out-Null
New-AppIcon -Path (Join-Path $OutputDir "icon-192.png") -Size 192
New-AppIcon -Path (Join-Path $OutputDir "icon-512.png") -Size 512
New-AppIcon -Path (Join-Path $OutputDir "icon-maskable-512.png") -Size 512 -Maskable $true
New-AppIcon -Path (Join-Path $OutputDir "apple-touch-icon.png") -Size 180

Write-Host "Icones gerados em $OutputDir"
