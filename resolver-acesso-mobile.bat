@echo off
echo ========================================
echo     RESOLVER ACESSO MOBILE
echo ========================================
echo.
echo Este script resolverá o problema de acesso do celular.
echo IMPORTANTE: Execute como ADMINISTRADOR!
echo.
echo Pressione ENTER para continuar ou CTRL+C para cancelar...
pause >nul

echo.
echo Criando regras de firewall específicas...
netsh advfirewall firewall add rule name="WorkMachine-Frontend-3001" dir=in action=allow protocol=TCP localport=3001 profile=any
netsh advfirewall firewall add rule name="WorkMachine-Backend-8080" dir=in action=allow protocol=TCP localport=8080 profile=any

echo.
echo Verificando se funcionou...
timeout /t 2 /nobreak >nul
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://10.46.0.213:3001/api/health' -TimeoutSec 3; Write-Host 'SUCCESS: API acessivel via rede!' -ForegroundColor Green } catch { Write-Host 'ERRO: Ainda nao acessivel via rede' -ForegroundColor Red }"

echo.
echo ========================================
echo           TESTE NO CELULAR
echo ========================================
echo.
echo Agora teste no celular:
echo 1. Digite: 10.46.0.213:3001/api/health
echo 2. Deve aparecer: {"status":"OK","message":"Servidor funcionando!"}
echo.
echo Se funcionar, acesse: 10.46.0.213:8080
echo.
echo Para REMOVER as regras depois:
echo netsh advfirewall firewall delete rule name="WorkMachine-Frontend-3001"
echo netsh advfirewall firewall delete rule name="WorkMachine-Backend-8080"
echo.
pause