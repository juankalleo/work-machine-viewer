# 📱 Guia de Acesso Móvel - Work Machine Viewer

## ✅ Status Atual
- **IP do Computador:** `10.46.0.213`
- **Frontend:** `http://10.46.0.213:8080` ✅ FUNCIONANDO
- **Backend:** `http://10.46.0.213:3001` ✅ FUNCIONANDO
- **Firewall:** Node.js tem permissões de entrada

## 🔧 URLs para Teste

### Frontend (Interface Principal)
```
http://10.46.0.213:8080
```

### Backend API (Teste de Conectividade)
```
http://10.46.0.213:3001/api/health
```

### Dados da API
```
http://10.46.0.213:3001/api/cpus
http://10.46.0.213:3001/api/stats
```

## 📱 Passos para Acesso no Celular

### 1. **Verificar Conexão de Rede**
- **IMPORTANTE:** O celular deve estar na **mesma rede** que o computador
- O computador está conectado via cabo na rede `10.46.0.x`
- O celular deve estar conectado no WiFi **corporativo/empresarial**
- **NÃO funcionará** se o celular estiver em rede móvel (4G/5G)

### 2. **Testar Conectividade**
Abra o navegador do celular e teste:

1. **Primeiro teste:** `http://10.46.0.213:3001/api/health`
   - Deve retornar: `{"status":"OK","message":"Servidor funcionando!"}`

2. **Segundo teste:** `http://10.46.0.213:8080`
   - Deve carregar a interface do sistema

### 3. **Se NÃO Funcionar**

#### Opção A: Problemas de Rede
- Verifique se o celular está na rede WiFi **corporativa**
- Teste pingar o computador: use app "Network Analyzer" ou similar
- Ping para: `10.46.0.213`

#### Opção B: Configurar Firewall (REQUER ADMIN)
Execute como **Administrador**:
```cmd
netsh advfirewall firewall add rule name="Work Machine Frontend Mobile" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="Work Machine Backend Mobile" dir=in action=allow protocol=TCP localport=3001
```

#### Opção C: Usar Hotspot do Celular
1. Ative o hotspot do celular
2. Conecte o computador no WiFi do celular
3. Veja o novo IP do computador: `ipconfig`
4. Use esse novo IP para acessar

### 4. **Para Redes Corporativas Restritivas**

Se a rede corporativa bloqueia acesso entre dispositivos:

#### Solução Temporária - ngrok (Túnel)
```cmd
# Instalar ngrok
# Expor porta 8080
ngrok http 8080

# Usar a URL pública gerada (ex: https://abc123.ngrok.io)
```

## 🧪 Testes de Diagnóstico

### No Computador:
```powershell
# Verificar portas ativas
netstat -ano | findstr ":8080\|:3001"

# Testar conectividade local
Test-NetConnection -ComputerName 10.46.0.213 -Port 8080
Test-NetConnection -ComputerName 10.46.0.213 -Port 3001

# Ver IP atual
ipconfig | findstr "IPv4"
```

### No Celular:
1. **App Network Analyzer** ou **Fing**
2. Escanear rede para encontrar `10.46.0.213`
3. Testar ping para esse IP
4. Testar porta 8080 e 3001

## ⚠️ Possíveis Problemas

### 1. **Redes Diferentes**
- Computador: Cabo Ethernet (10.46.0.213)
- Celular: WiFi diferente (192.168.x.x)
- **Solução:** Conectar ambos na mesma rede

### 2. **Firewall Corporativo**
- Rede empresarial pode bloquear comunicação entre dispositivos
- **Solução:** Pedir ao admin de TI para liberar as portas

### 3. **Proxy Corporativo**
- Algumas empresas usam proxy obrigatório
- **Solução:** Configurar proxy no navegador móvel

### 4. **VPN/Políticas de Segurança**
- Políticas podem impedir acesso direto por IP
- **Solução:** Usar ngrok ou similar

## 📞 Suporte

Se nada funcionar:

1. **Teste com outro dispositivo** na mesma rede WiFi
2. **Use um computador pessoal** conectado no mesmo WiFi
3. **Contate o admin de rede** para verificar políticas
4. **Use ngrok** como solução temporária

## 🗑️ Limpeza (Remover Regras)

Para remover regras de firewall criadas:
```cmd
netsh advfirewall firewall delete rule name="Work Machine Frontend Mobile"
netsh advfirewall firewall delete rule name="Work Machine Backend Mobile"
```

---
**Última atualização:** 30/09/2025 - 16:10h