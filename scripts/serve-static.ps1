$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Port = 4178
$Listener = [System.Net.HttpListener]::new()
$Listener.Prefixes.Add("http://127.0.0.1:$Port/")
$Listener.Start()
Write-Host "Serving $Root at http://127.0.0.1:$Port/"

$MimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg" = "image/svg+xml"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webmanifest" = "application/manifest+json"
}

try {
  while ($Listener.IsListening) {
    $Context = $Listener.GetContext()
    $RequestPath = [System.Uri]::UnescapeDataString($Context.Request.Url.AbsolutePath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($RequestPath)) {
      $RequestPath = "index.html"
    }

    $Candidate = Join-Path $Root $RequestPath
    $Resolved = $null
    if (Test-Path -LiteralPath $Candidate -PathType Leaf) {
      $Resolved = (Resolve-Path -LiteralPath $Candidate).Path
    }

    if (-not $Resolved -or -not $Resolved.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
      $Resolved = Join-Path $Root "index.html"
    }

    $Bytes = [System.IO.File]::ReadAllBytes($Resolved)
    $Extension = [System.IO.Path]::GetExtension($Resolved).ToLowerInvariant()
    $Context.Response.ContentType = if ($MimeTypes.ContainsKey($Extension)) { $MimeTypes[$Extension] } else { "application/octet-stream" }
    $Context.Response.ContentLength64 = $Bytes.Length
    $Context.Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
    $Context.Response.OutputStream.Close()
  }
}
finally {
  $Listener.Stop()
}
