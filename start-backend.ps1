# Script para instalar e iniciar o backend do work-machine-viewer
# Este script configura o servidor para permitir acesso de múltiplas máquinas

Write-Host "🚀 Configurando backend compartilhado..." -ForegroundColor Green

# Verificar se Node.js está instalado
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Instalando via Chocolatey..." -ForegroundColor Red
    
    if (!(Get-Command "choco" -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Instalando Chocolatey primeiro..." -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    
    choco install nodejs -y
    Write-Host "✅ Node.js instalado!" -ForegroundColor Green
}

# Ir para o diretório do servidor
cd server

Write-Host "📦 Instalando dependências do servidor..." -ForegroundColor Yellow

# Instalar dependências
npm install express cors pg nodemon

Write-Host "🗄️ Verificando PostgreSQL..." -ForegroundColor Yellow

# Verificar se PostgreSQL está rodando
try {
    $env:PGPASSWORD = "postgres"
    $testConnection = & "C:\postgres-portable\pgsql\bin\psql.exe" -h localhost -U postgres -d work_machine_viewer -c "SELECT 1;" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL conectado!" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL não está acessível. Iniciando..." -ForegroundColor Yellow
        & "C:\postgres-portable\pgsql\bin\pg_ctl.exe" -D "C:\postgres-portable\data" start
        Start-Sleep -Seconds 3
    }
} catch {
    Write-Host "⚠️  Erro ao verificar PostgreSQL. Continuando..." -ForegroundColor Yellow
}

Write-Host "🌐 Iniciando servidor backend..." -ForegroundColor Green
Write-Host ""
Write-Host "📊 Servidor estará disponível em:" -ForegroundColor Cyan
Write-Host "   • Local: http://localhost:3001" -ForegroundColor White
Write-Host "   • Rede: http://10.46.0.213:3001" -ForegroundColor White
Write-Host "   • API Health: http://10.46.0.213:3001/api/health" -ForegroundColor White
Write-Host ""
Write-Host "🔌 Endpoints da API:" -ForegroundColor Cyan
Write-Host "   GET    /api/health          - Status do servidor" -ForegroundColor White
Write-Host "   GET    /api/cpus           - Listar CPUs" -ForegroundColor White
Write-Host "   POST   /api/cpus           - Criar CPU" -ForegroundColor White
Write-Host "   PUT    /api/cpus/:id       - Atualizar CPU" -ForegroundColor White
Write-Host "   DELETE /api/cpus/:id       - Deletar CPU" -ForegroundColor White
Write-Host "   GET    /api/users          - Listar usuários" -ForegroundColor White
Write-Host "   GET    /api/stats          - Estatísticas" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Para parar o servidor, pressione Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Iniciar o servidor
node server.js