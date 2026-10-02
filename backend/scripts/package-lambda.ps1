# ─────────────────────────────────────────────────────────────────────────────
# package-lambda.ps1
# Empaqueta la función Lambda de CyberGuard AI en un zip listo para subir.
#
# Uso desde la raíz del repositorio:
#   .\backend\scripts\package-lambda.ps1
#
# Uso desde backend/:
#   .\scripts\package-lambda.ps1
#
# Requisitos: Node.js en el PATH
# ─────────────────────────────────────────────────────────────────────────────

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Resolver ruta raíz del backend ───────────────────────────────────────────
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Split-Path -Parent $scriptDir

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗"
Write-Host "║   CyberGuard AI — Lambda Packager        ║"
Write-Host "╚══════════════════════════════════════════╝"
Write-Host ""

# ── 1. Verificar Node.js ──────────────────────────────────────────────────────
Write-Host "► Verificando Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = & node --version 2>&1
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Error "Node.js no encontrado en el PATH. Instálalo desde https://nodejs.org"
    exit 1
}

# ── 2. Instalar dependencias del backend ─────────────────────────────────────
Write-Host ""
Write-Host "► Instalando dependencias del backend..." -ForegroundColor Cyan
Set-Location $backendDir
& node (Join-Path $backendDir "node_modules\.bin\npm-cli.js" -ErrorAction SilentlyContinue) install 2>&1
# Fallback: llamar a npm directamente
try { & npm install --prefer-offline 2>&1 | Out-Null } catch {}

# ── 3. Compilar con esbuild ───────────────────────────────────────────────────
Write-Host ""
Write-Host "► Compilando Lambda con esbuild..." -ForegroundColor Cyan
& node esbuild.config.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Error "esbuild falló. Revisa los errores anteriores."
    exit 1
}

$bundleFile = Join-Path $backendDir "dist\index.js"
if (-not (Test-Path $bundleFile)) {
    Write-Error "dist/index.js no encontrado tras el build."
    exit 1
}

$bundleSize = [math]::Round((Get-Item $bundleFile).Length / 1024, 1)
Write-Host "  Bundle: dist/index.js ($bundleSize KB)" -ForegroundColor Green

# ── 4. Crear el zip ───────────────────────────────────────────────────────────
Write-Host ""
Write-Host "► Empaquetando en zip..." -ForegroundColor Cyan

$distDir = Join-Path $backendDir "dist"
$zipFile = Join-Path $distDir "function.zip"

# Eliminar zip anterior si existe
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
    Write-Host "  Zip anterior eliminado." -ForegroundColor DarkGray
}

# Comprimir solo index.js (AWS SDK viene del runtime de Lambda)
Compress-Archive -Path $bundleFile -DestinationPath $zipFile -Force

if (-not (Test-Path $zipFile)) {
    Write-Error "No se pudo crear dist/function.zip"
    exit 1
}

$zipSize = [math]::Round((Get-Item $zipFile).Length / 1024, 1)
Write-Host "  Zip creado: dist/function.zip ($zipSize KB)" -ForegroundColor Green

# ── 5. Resumen ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗"
Write-Host "║   Empaquetado completado exitosamente    ║"
Write-Host "╚══════════════════════════════════════════╝"
Write-Host ""
Write-Host "  Archivo listo para subir a Lambda:" -ForegroundColor White
Write-Host "  $zipFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Para actualizar la función en AWS Lambda:" -ForegroundColor White
Write-Host "  aws lambda update-function-code ``" -ForegroundColor DarkGray
Write-Host "    --function-name cyberguard-analyze ``" -ForegroundColor DarkGray
Write-Host "    --zip-file fileb://dist/function.zip" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  O desde la consola AWS Lambda → Upload from → .zip file" -ForegroundColor DarkGray
Write-Host ""
