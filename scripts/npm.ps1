param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

# Ajoute Node.js au PATH pour cette session
$nodePath = "C:\Program Files\nodejs"
if (Test-Path $nodePath) {
  $env:Path = "$nodePath;$env:Path"
} else {
  Write-Error "Node.js introuvable dans $nodePath. Installe-le depuis https://nodejs.org/"
  exit 1
}

Set-Location (Join-Path $PSScriptRoot "..")

if ($Args.Count -eq 0) {
  Write-Host "Usage: .\scripts\npm.ps1 install | run db:push | run db:seed | run dev"
  exit 0
}

& npm @Args
