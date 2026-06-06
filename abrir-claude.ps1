# ============================================================
#  ABRIR CLAUDE CODE - Personal Pro PWA
#  Clique com botao direito -> Executar com PowerShell
#  Ou pressione F5 dentro do VS Code
# ============================================================

# Vai para a pasta do projeto automaticamente
Set-Location $PSScriptRoot

Clear-Host
Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host "   CLAUDE CODE - Personal Pro PWA          " -ForegroundColor Cyan
Write-Host "   Modo: sem interrupcoes                  " -ForegroundColor Green
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Dicas rapidas:" -ForegroundColor Yellow
Write-Host "  - Digite sua tarefa em portugues e pressione Enter" -ForegroundColor Gray
Write-Host "  - Para sair: Ctrl+C depois /logout" -ForegroundColor Gray
Write-Host "  - Git push e feito automatico apos cada tarefa" -ForegroundColor Gray
Write-Host ""

# Abre o Claude Code sem pedir autorizacoes
claude --dangerously-skip-permissions
