# Script para configurar acesso móvel ao Work Machine Viewer
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURANDO ACESSO PARA CELULAR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está rodando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  AVISO: Este script precisa ser executado como Administrador" -ForegroundColor Yellow
    Write-Host "Clique com botão direito no PowerShell e 'Executar como Administrador'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..."
    Read-Host
    exit
}

# Obter IP atual
$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet" | Where-Object {$_.IPAddress -like "10.*"}).IPAddress
if (-not $ip) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"}).IPAddress
}

Write-Host "🖥️  IP do computador: $ip" -ForegroundColor Green
Write-Host ""

# Verificar se as portas estão em uso
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if ($port8080) {
    Write-Host "✅ Frontend rodando na porta 8080" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend NÃO está rodando na porta 8080" -ForegroundColor Red
}

if ($port3001) {
    Write-Host "✅ Backend rodando na porta 3001" -ForegroundColor Green
} else {
    Write-Host "❌ Backend NÃO está rodando na porta 3001" -ForegroundColor Red
}

Write-Host ""
Write-Host "Criando regras de firewall..." -ForegroundColor Yellow

try {
    # Criar regras de firewall
    New-NetFirewallRule -DisplayName "Work Machine Frontend Mobile" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -ErrorAction Stop
    Write-Host "✅ Regra criada para porta 8080" -ForegroundColor Green
    
    New-NetFirewallRule -DisplayName "Work Machine Backend Mobile" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow -ErrorAction Stop
    Write-Host "✅ Regra criada para porta 3001" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "           CONFIGURAÇÃO CONCLUÍDA" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📱 URLs para acesso móvel:" -ForegroundColor Yellow
    Write-Host "Frontend: http://$ip`:8080" -ForegroundColor White
    Write-Host "Backend:  http://$ip`:3001/api/health" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Passos no celular:" -ForegroundColor Yellow
    Write-Host "1. Conecte-se à mesma rede WiFi/corporativa" -ForegroundColor White
    Write-Host "2. Abra o navegador" -ForegroundColor White
    Write-Host "3. Digite: $ip`:8080" -ForegroundColor White
    Write-Host ""
    
    # Testar conectividade
    Write-Host "🧪 Testando conectividade..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://$ip`:3001/api/health" -TimeoutSec 5
        Write-Host "✅ Backend respondendo: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao conectar no backend" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erro ao criar regras de firewall: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🗑️  Para remover as regras posteriormente:" -ForegroundColor Yellow
Write-Host 'Remove-NetFirewallRule -DisplayName "Work Machine Frontend Mobile"' -ForegroundColor Gray
Write-Host 'Remove-NetFirewallRule -DisplayName "Work Machine Backend Mobile"' -ForegroundColor Gray
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
Read-Host