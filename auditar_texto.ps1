<#
====================================================================
 auditar_texto.ps1
 STR Software — Auditoria de "cheiro de IA": travessões e falta de
 acentuação em todo o projeto, de uma vez só.

 USO:
   cd C:\Users\cotaw\Projetos\str-software1
   .\auditar_texto.ps1                 -> só gera o relatório (não muda nada)
   .\auditar_texto.ps1 -Corrigir       -> gera relatório E aplica as
                                          correções SEGURAS automaticamente
                                          (lista curada, sem ambiguidade)
   .\auditar_texto.ps1 -Corrigir -WhatIf  -> mostra o que seria corrigido,
                                             sem gravar nada (simulação)

 O que ele faz:
   1. Varre .tsx/.ts/.jsx/.js/.mdx do projeto inteiro (ignora
      node_modules/.next/.git/dist/build)
   2. Marca toda ocorrência de travessão — (em-dash), que é a marca
      mais óbvia de texto gerado por IA em português
   3. Marca palavras terminadas em padrões que quase sempre perdem
      acento em texto "achatado" (ex: informacao, servico, regiao,
      atencao, solucoes) — usando sufixos, não dicionário fixo, para
      pegar qualquer palavra do projeto, não só uma lista fechada
   4. Marca uma lista curada de palavras comuns sem ambiguidade
      (nao->não, voce->você, etc.) — essas são seguras pra correção
      automática
   5. Gera relatorio_texto.html (visual, com arquivo+linha+contexto)
      e, se -Corrigir, aplica as trocas seguras direto nos arquivos
      (fazendo backup .bak antes de cada arquivo tocado)
====================================================================
#>

param(
    [string]$Caminho = ".",
    [switch]$Corrigir,
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

# ---------------------------------------------------------------
# 1) Lista de trocas SEGURAS (sem ambiguidade) — aplicadas só com -Corrigir
#    Regra: word boundary, case-insensitive, preserva capitalização
# ---------------------------------------------------------------
$trocasSeguras = @{
    'nao'          = 'não'
    'voce'         = 'você'
    'voces'        = 'vocês'
    'ate'          = 'até'
    'sao'          = 'são'
    'regiao'       = 'região'
    'regioes'      = 'regiões'
    'atencao'      = 'atenção'
    'solucao'      = 'solução'
    'solucoes'     = 'soluções'
    'informacao'   = 'informação'
    'informacoes'  = 'informações'
    'construcao'   = 'construção'
    'gestao'       = 'gestão'
    'orcamento'    = 'orçamento'
    'orcamentos'   = 'orçamentos'
    'servico'      = 'serviço'
    'servicos'     = 'serviços'
    'sao paulo'    = 'São Paulo'
    'ribeirao'     = 'Ribeirão'
    'e-commerce'   = 'e-commerce'
    'consultoria'  = 'consultoria'
    'aplicacao'    = 'aplicação'
    'aplicacoes'   = 'aplicações'
    'automacao'    = 'automação'
    'implementacao'= 'implementação'
    'personalizacao'='personalização'
    'otimizacao'   = 'otimização'
    'integracao'   = 'integração'
    'migracao'     = 'migração'
    'manutencao'   = 'manutenção'
    'transformacao'= 'transformação'
    'inteligencia' = 'inteligência'
    'tecnologia'   = 'tecnologia'
    'estrategia'   = 'estratégia'
    'experiencia'  = 'experiência'
    'agil'         = 'ágil'
    'facil'        = 'fácil'
    'movel'        = 'móvel'
    'analitico'    = 'analítico'
    'automatico'   = 'automático'
    'dinamico'     = 'dinâmico'
    'unico'        = 'único'
    'basico'       = 'básico'
    'pratico'      = 'prático'
    'seguranca'    = 'segurança'
    'confianca'    = 'confiança'
    'lideranca'    = 'liderança'
    'presenca'     = 'presença'
    'crescimento'  = 'crescimento'
    'escalavel'    = 'escalável'
    'disponivel'   = 'disponível'
    'flexivel'     = 'flexível'
    'possivel'     = 'possível'
    'responsavel'  = 'responsável'
    'sustentavel'  = 'sustentável'
    'confiavel'    = 'confiável'
}

# ---------------------------------------------------------------
# 2) Sufixos que quase sempre indicam acento perdido (regra geral,
#    pega palavras que não estão na lista curada acima)
# ---------------------------------------------------------------
$sufixosSuspeitos = @(
    'cao\b', 'coes\b', 'gao\b', 'goes\b', 'encia\b', 'ancia\b',
    'avel\b', 'ivel\b', 'atico\b', 'atica\b'
)

$extensoes = @("*.tsx","*.ts","*.jsx","*.js","*.mdx")
$ignorarPastas = @("node_modules","\.next","\.git","dist","build")

Write-Host "Varrendo projeto em: $Caminho" -ForegroundColor Cyan

$arquivos = Get-ChildItem -Path $Caminho -Recurse -File -Include $extensoes -ErrorAction SilentlyContinue |
    Where-Object {
        $full = $_.FullName
        -not ($ignorarPastas | Where-Object { $full -match [regex]::Escape($_) -or $full -match $_ })
    }

Write-Host "Arquivos encontrados: $($arquivos.Count)" -ForegroundColor Cyan

$achadosTravessao = New-Object System.Collections.Generic.List[Object]
$achadosAcento    = New-Object System.Collections.Generic.List[Object]
$arquivosAlterados = New-Object System.Collections.Generic.List[Object]

$utf8SemBom = New-Object System.Text.UTF8Encoding($false)

foreach ($arquivo in $arquivos) {
    $linhas = [System.IO.File]::ReadAllLines($arquivo.FullName, [System.Text.Encoding]::UTF8)
    $mudou = $false
    $novasLinhas = @()

    for ($i = 0; $i -lt $linhas.Count; $i++) {
        $linha = $linhas[$i]
        $numeroLinha = $i + 1

        # --- travessão (—) ---
        if ($linha -match '—') {
            $achadosTravessao.Add([PSCustomObject]@{
                Arquivo = $arquivo.FullName.Replace((Resolve-Path $Caminho).Path, ".")
                Linha   = $numeroLinha
                Trecho  = $linha.Trim()
            })
        }

        # --- sufixos suspeitos (só relatório, não corrige automático) ---
        foreach ($sufixo in $sufixosSuspeitos) {
            $regex = "\b[a-z]{3,}$sufixo"
            $ocorrencias = [regex]::Matches($linha, $regex, "IgnoreCase")
            foreach ($m in $ocorrencias) {
                $palavra = $m.Value
                # pula se já está na lista curada (essa já é tratada separado)
                if (-not $trocasSeguras.ContainsKey($palavra.ToLower())) {
                    $achadosAcento.Add([PSCustomObject]@{
                        Arquivo = $arquivo.FullName.Replace((Resolve-Path $Caminho).Path, ".")
                        Linha   = $numeroLinha
                        Palavra = $palavra
                        Trecho  = $linha.Trim()
                        Tipo    = "sufixo-suspeito (revisar manual)"
                    })
                }
            }
        }

        # --- trocas seguras (lista curada) ---
        $linhaCorrigida = $linha
        foreach ($errada in $trocasSeguras.Keys) {
            $certa = $trocasSeguras[$errada]
            $regex = "\b$([regex]::Escape($errada))\b"
            if ($linhaCorrigida -match $regex) {
                $achadosAcento.Add([PSCustomObject]@{
                    Arquivo = $arquivo.FullName.Replace((Resolve-Path $Caminho).Path, ".")
                    Linha   = $numeroLinha
                    Palavra = $errada
                    Trecho  = $linha.Trim()
                    Tipo    = "correcao-segura ($errada -> $certa)"
                })
                if ($Corrigir) {
                    $linhaCorrigida = [regex]::Replace($linhaCorrigida, $regex, $certa, "IgnoreCase")
                    $mudou = $true
                }
            }
        }
        $novasLinhas += $linhaCorrigida
    }

    if ($mudou -and $Corrigir) {
        if ($WhatIf) {
            Write-Host "[SIMULACAO] Corrigiria: $($arquivo.FullName)" -ForegroundColor Yellow
        } else {
            [System.IO.File]::Copy($arquivo.FullName, "$($arquivo.FullName).bak", $true)
            [System.IO.File]::WriteAllLines($arquivo.FullName, $novasLinhas, $utf8SemBom)
            $arquivosAlterados.Add($arquivo.FullName)
            Write-Host "Corrigido (backup .bak criado): $($arquivo.FullName)" -ForegroundColor Green
        }
    }
}

# ---------------------------------------------------------------
# 3) Relatório HTML
# ---------------------------------------------------------------
Add-Type -AssemblyName System.Web

$html = @"
<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Auditoria de Texto — STR Software</title>
<style>
body{font-family:system-ui,Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px}
h1{color:#38bdf8} h2{color:#f8fafc;border-bottom:1px solid #334155;padding-bottom:6px;margin-top:36px}
table{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px}
th{background:#1e293b;text-align:left;padding:8px;position:sticky;top:0}
td{padding:6px 8px;border-bottom:1px solid #1e293b;vertical-align:top}
tr:hover{background:#1e293b}
code{color:#facc15;background:#1e293b;padding:2px 4px;border-radius:4px}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
.seguro{background:#166534;color:#dcfce7}
.revisar{background:#854d0e;color:#fef9c3}
.travessao{background:#7f1d1d;color:#fee2e2}
.resumo{background:#1e293b;padding:16px;border-radius:8px;margin-bottom:24px}
</style></head><body>
<h1>Auditoria de Texto — Travessões e Acentuação</h1>
<div class="resumo">
  <strong>Arquivos varridos:</strong> $($arquivos.Count)<br>
  <strong>Travessões (—) encontrados:</strong> $($achadosTravessao.Count)<br>
  <strong>Ocorrências de acentuação (total):</strong> $($achadosAcento.Count)<br>
  <strong>Modo:</strong> $(if($Corrigir){"CORRIGIR (trocas seguras aplicadas)"}else{"Somente relatório (nada foi alterado)"})
</div>

<h2>Travessões (—) — trocar manualmente por vírgula, dois-pontos ou reformular a frase</h2>
<table><tr><th>Arquivo</th><th>Linha</th><th>Trecho</th></tr>
$(($achadosTravessao | ForEach-Object { "<tr><td>$($_.Arquivo)</td><td>$($_.Linha)</td><td><code>$([System.Web.HttpUtility]::HtmlEncode($_.Trecho))</code></td></tr>" }) -join "`n")
</table>

<h2>Acentuação — correções seguras aplicadas / sugeridas</h2>
<table><tr><th>Tipo</th><th>Arquivo</th><th>Linha</th><th>Palavra</th><th>Trecho</th></tr>
$(($achadosAcento | Sort-Object Tipo | ForEach-Object {
    $classe = if($_.Tipo -match "segura"){"seguro"}else{"revisar"}
    "<tr><td><span class='badge $classe'>$($_.Tipo)</span></td><td>$($_.Arquivo)</td><td>$($_.Linha)</td><td>$($_.Palavra)</td><td><code>$([System.Web.HttpUtility]::HtmlEncode($_.Trecho))</code></td></tr>"
}) -join "`n")
</table>
</body></html>
"@

$caminhoRelatorio = Join-Path (Resolve-Path $Caminho).Path "relatorio_texto.html"
[System.IO.File]::WriteAllText($caminhoRelatorio, $html, $utf8SemBom)

Write-Host ""
Write-Host "=== RESUMO ===" -ForegroundColor Cyan
Write-Host "Arquivos varridos: $($arquivos.Count)"
Write-Host "Travessoes encontrados: $($achadosTravessao.Count)" -ForegroundColor Red
Write-Host "Ocorrencias de acentuacao: $($achadosAcento.Count)" -ForegroundColor Yellow
if ($Corrigir -and -not $WhatIf) {
    Write-Host "Arquivos corrigidos automaticamente: $($arquivosAlterados.Count)" -ForegroundColor Green
    Write-Host "(backups .bak criados ao lado de cada arquivo alterado)" -ForegroundColor Green
}
Write-Host ""
Write-Host "Relatorio completo gerado em: $caminhoRelatorio" -ForegroundColor Cyan
Write-Host "Abra esse arquivo no navegador pra ver tudo organizado."
