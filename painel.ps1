# ============================================================
#  PAINEL DE TAREFAS - Personal Pro PWA
#  Como usar:
#    1. Edite o arquivo tarefas.txt com suas tarefas
#    2. Clique com botao direito neste arquivo
#    3. Selecione "Executar com PowerShell"
#    4. Va fazer outra coisa - o Claude trabalha sozinho!
# ============================================================

$arquivo   = Join-Path $PSScriptRoot "tarefas.txt"
$encoding  = "UTF8"

# Cabecalho
Clear-Host
Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host "   PAINEL DE TAREFAS - Personal Pro PWA   " -ForegroundColor Cyan
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se o arquivo de tarefas existe
if (-not (Test-Path $arquivo)) {
    Write-Host "  [AVISO] tarefas.txt nao encontrado. Criando modelo..." -ForegroundColor Yellow
    @"
[ ] Crie o arquivo CLAUDE.md na raiz do projeto com as regras do projeto Personal Pro PWA
[ ] Exemplo de tarefa 2 - substitua pelo que voce quer
[ ] Exemplo de tarefa 3 - substitua pelo que voce quer
"@ | Set-Content $arquivo -Encoding $encoding
    Write-Host "  Arquivo tarefas.txt criado! Edite-o e rode novamente." -ForegroundColor Green
    Write-Host ""
    Pause
    exit
}

# Le todas as linhas
$linhas  = Get-Content $arquivo -Encoding $encoding
$total   = ($linhas | Where-Object { $_ -match '^\[ \]' }).Count
$feitas  = 0
$erros   = 0

if ($total -eq 0) {
    Write-Host "  Nenhuma tarefa pendente encontrada no tarefas.txt." -ForegroundColor Gray
    Write-Host "  Adicione linhas no formato:  [ ] Descricao da tarefa" -ForegroundColor Gray
    Write-Host ""
    Pause
    exit
}

Write-Host "  Tarefas pendentes: $total" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Iniciando execucao automatica..." -ForegroundColor Gray
Write-Host "  (voce pode minimizar esta janela)" -ForegroundColor Gray
Write-Host ""
Start-Sleep -Seconds 2

# Loop principal
for ($i = 0; $i -lt $linhas.Count; $i++) {
    $linha = $linhas[$i]

    if ($linha -match '^\[ \] (.+)') {
        $tarefa = $matches[1].Trim()
        $feitas++

        $hora = Get-Date -Format "HH:mm:ss"
        Write-Host "  [$hora] Tarefa $feitas/$total" -ForegroundColor Cyan
        Write-Host "  >> $tarefa" -ForegroundColor White
        Write-Host ""

        try {
            # Executa Claude Code em modo headless
            $saida = & claude -p $tarefa --dangerously-skip-permissions 2>&1 | Out-String

            # Monta resumo com ultimas linhas nao vazias (max 220 chars)
            $linhasOutput = ($saida -split "`n") | Where-Object { $_.Trim() -ne "" }
            $resumo = ($linhasOutput | Select-Object -Last 4) -join " | "
            if ($resumo.Length -gt 220) { $resumo = $resumo.Substring(0, 220) + "..." }
            if ([string]::IsNullOrWhiteSpace($resumo)) { $resumo = "Concluido sem saida de texto" }

            # Atualiza linha no array
            $linhas[$i] = "[OK] $tarefa`n     Resultado: $resumo"

            Write-Host "  [OK] Concluido!" -ForegroundColor Green

        } catch {
            $linhas[$i] = "[ERRO] $tarefa`n     Erro: $($_.Exception.Message)"
            $erros++
            Write-Host "  [ERRO] Falhou: $($_.Exception.Message)" -ForegroundColor Red
        }

        # Salva arquivo imediatamente apos cada tarefa
        $linhas | Set-Content $arquivo -Encoding $encoding

        Write-Host ""
        Write-Host "  ------------------------------------------" -ForegroundColor DarkGray
        Write-Host ""
    }
}

# Resumo final
$hora = Get-Date -Format "HH:mm:ss"
Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host "   EXECUCAO FINALIZADA - $hora" -ForegroundColor Cyan
Write-Host "   Concluidas : $feitas" -ForegroundColor Green
if ($erros -gt 0) {
    Write-Host "   Com erro   : $erros" -ForegroundColor Red
}
Write-Host "   Veja o resultado em tarefas.txt" -ForegroundColor White
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host ""
Pause
