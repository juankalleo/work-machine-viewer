# Setup PostgreSQL Portable para Work Machine Viewer
# Este script baixa e configura PostgreSQL portable

Write-Host "Configurando PostgreSQL para work-machine-viewer..." -ForegroundColor Green

# Criar diretorio para PostgreSQL
$pgDir = "C:\postgres-portable"
if (!(Test-Path $pgDir)) {
    New-Item -ItemType Directory -Path $pgDir -Force
    Write-Host "Diretorio criado: $pgDir" -ForegroundColor Green
}

# URL do PostgreSQL portable (versao 15)
$pgUrl = "https://get.enterprisedb.com/postgresql/postgresql-15.8-1-windows-x64-binaries.zip"
$zipFile = "$pgDir\postgresql.zip"

Write-Host "Baixando PostgreSQL..." -ForegroundColor Yellow

try {
    Invoke-WebRequest -Uri $pgUrl -OutFile $zipFile -UseBasicParsing
    Write-Host "Download concluido" -ForegroundColor Green
} catch {
    Write-Host "Erro no download: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Extrair arquivo
Write-Host "Extraindo arquivos..." -ForegroundColor Yellow
try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile, $pgDir)
    Write-Host "Arquivos extraidos" -ForegroundColor Green
} catch {
    Write-Host "Erro na extracao: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Configurar diretorio de dados
$dataDir = "$pgDir\data"
$binDir = "$pgDir\pgsql\bin"

# Inicializar banco de dados
Write-Host "Inicializando banco de dados..." -ForegroundColor Yellow
$env:PGPASSWORD = "postgres"
& "$binDir\initdb.exe" -D $dataDir -U postgres --auth-local=trust --auth-host=md5

# Criar arquivo de configuracao
$configContent = "listen_addresses = 'localhost'`nport = 5432`nmax_connections = 100`nshared_buffers = 128MB"
$configContent | Out-File "$dataDir\postgresql.conf" -Encoding UTF8

# Criar arquivo de autenticacao
$hbaContent = "local   all             all                                     trust`nhost    all             all             127.0.0.1/32            md5`nhost    all             all             ::1/128                 md5"
$hbaContent | Out-File "$dataDir\pg_hba.conf" -Encoding UTF8

Write-Host "Iniciando PostgreSQL..." -ForegroundColor Yellow
Start-Process -FilePath "$binDir\pg_ctl.exe" -ArgumentList "-D", $dataDir, "start" -Wait

# Aguardar PostgreSQL iniciar
Start-Sleep -Seconds 3

# Criar banco de dados
Write-Host "Criando banco work_machine_viewer..." -ForegroundColor Yellow
& "$binDir\createdb.exe" -h localhost -U postgres work_machine_viewer

Write-Host "PostgreSQL configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Informacoes da conexao:" -ForegroundColor Cyan
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Porta: 5432" -ForegroundColor White
Write-Host "   Banco: work_machine_viewer" -ForegroundColor White
Write-Host "   Usuario: postgres" -ForegroundColor White
Write-Host "   Senha: postgres" -ForegroundColor White
Write-Host ""
Write-Host "Para parar o PostgreSQL:" -ForegroundColor Yellow
Write-Host "   $binDir\pg_ctl.exe -D $dataDir stop" -ForegroundColor White
Write-Host ""
Write-Host "Para iniciar novamente:" -ForegroundColor Yellow
Write-Host "   $binDir\pg_ctl.exe -D $dataDir start" -ForegroundColor White

# Remover arquivo zip
Remove-Item $zipFile -Force
