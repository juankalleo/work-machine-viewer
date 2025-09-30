@echo off
echo ========================================
echo   CONFIGURANDO ACESSO PARA CELULAR
echo ========================================
echo.
echo Este script criará regras de firewall temporárias
echo para permitir acesso do celular ao sistema.
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

echo Criando regra para Frontend (porta 8080)...
netsh advfirewall firewall add rule name="Work Machine Frontend Mobile" dir=in action=allow protocol=TCP localport=8080

echo Criando regra para Backend API (porta 3001)...
netsh advfirewall firewall add rule name="Work Machine Backend Mobile" dir=in action=allow protocol=TCP localport=3001

echo.
echo ========================================
echo           CONFIGURAÇÃO CONCLUÍDA
echo ========================================
echo.
echo URLs para acesso móvel:
echo Frontend: http://10.46.0.213:8080
echo Backend:  http://10.46.0.213:3001/api/health
echo.
echo No seu celular (conectado na mesma rede):
echo 1. Conecte-se à mesma rede WiFi corporativa
echo 2. Abra o navegador
echo 3. Digite: 10.46.0.213:8080
echo.
echo Para remover as regras posteriormente:
echo netsh advfirewall firewall delete rule name="Work Machine Frontend Mobile"
echo netsh advfirewall firewall delete rule name="Work Machine Backend Mobile"
echo.
pause