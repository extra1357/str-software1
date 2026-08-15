# Script para juntar os arquivos-chave do projeto str-software1 em um único
# arquivo de texto, pronto para subir no chat de uma vez só.

$projeto = "C:\Users\cotaw\Projetos\str-software1"
$saida = "C:\Users\cotaw\Projetos\str-software1\contexto-codigo.txt"

# Lista de arquivos que queremos capturar (caminhos relativos à raiz do projeto).
# Se algum não existir, o script simplesmente avisa e pula, sem travar.
$arquivosDesejados = @(
    "app\page.tsx",
    "app\layout.tsx",
    "app\globals.css",
    "tailwind.config.ts",
    "tailwind.config.js",
    "package.json"
)

if (Test-Path $saida) { Remove-Item $saida -Force }

foreach ($rel in $arquivosDesejados) {
    $caminhoCompleto = Join-Path $projeto $rel
    if (Test-Path $caminhoCompleto) {
        Write-Host "Incluindo: $rel" -ForegroundColor Green
        Add-Content -Path $saida -Value "===== ARQUIVO: $rel ====="
        Add-Content -Path $saida -Value (Get-Content $caminhoCompleto -Raw)
        Add-Content -Path $saida -Value "`n===== FIM: $rel =====`n`n"
    } else {
        Write-Host "Não encontrado (pulando): $rel" -ForegroundColor Yellow
    }
}

# Também tenta encontrar componentes relacionados a serviços/regiões, caso
# existam em pastas separadas (ex: app/components/ServiceCard.tsx)
Write-Host ""
Write-Host "Procurando componentes relacionados a serviços/regiões..." -ForegroundColor Cyan
$componentesRelevantes = Get-ChildItem -Path $projeto -Recurse -File -Include "*.tsx","*.ts" -ErrorAction SilentlyContinue |
    Where-Object {
        $_.FullName -notmatch "node_modules|\.next|\.git" -and
        ($_.Name -match "(?i)servic|region|card|hero|footer|header")
    }

foreach ($comp in $componentesRelevantes) {
    $relPath = $comp.FullName.Substring($projeto.Length + 1)
    Write-Host "Incluindo componente: $relPath" -ForegroundColor Green
    Add-Content -Path $saida -Value "===== ARQUIVO: $relPath ====="
    Add-Content -Path $saida -Value (Get-Content $comp.FullName -Raw)
    Add-Content -Path $saida -Value "`n===== FIM: $relPath =====`n`n"
}

Write-Host ""
Write-Host "=== Pronto! ===" -ForegroundColor Yellow
Write-Host "Arquivo gerado em: $saida"
$tamanhoKB = [math]::Round((Get-Item $saida).Length / 1KB, 1)
Write-Host "Tamanho: $tamanhoKB KB"
Write-Host ""
Write-Host "Agora é só subir esse arquivo (contexto-codigo.txt) no chat." -ForegroundColor Cyan
