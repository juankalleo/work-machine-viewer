# 🌐 Compartilhamento Entre Máquinas

Este guia explica como configurar o sistema para compartilhar dados entre múltiplas máquinas na rede.

## 🔍 **Problema Atual**

Atualmente o sistema usa `localStorage` do navegador, que é específico para cada máquina/navegador. Por isso:
- ✅ Máquina 1 (10.46.0.213): Dados salvos localmente
- ❌ Máquina 2: localStorage vazio, não vê dados da Máquina 1

## 💡 **Solução: Servidor Backend + PostgreSQL**

### **Arquitetura:**
```
┌─────────────┐    HTTP     ┌─────────────┐    SQL     ┌──────────────┐
│  Máquina 1  │ ◄────────► │   Servidor  │ ◄───────► │  PostgreSQL  │
│ (Frontend)  │             │  (Backend)  │            │  (Banco)     │
└─────────────┘             └─────────────┘            └──────────────┘
                                    ▲
                            HTTP    │
                                    ▼
┌─────────────┐                ┌─────────────┐
│  Máquina 2  │ ◄──────────────┤  Máquina N  │
│ (Frontend)  │                │ (Frontend)  │
└─────────────┘                └─────────────┘
```

---

## 🚀 **Configuração - Passo a Passo**

### **1. Configurar o Servidor Backend**

Na máquina principal (10.46.0.213):

```powershell
# Executar o script de configuração
.\start-backend.ps1
```

Ou manualmente:

```powershell
# Ir para o diretório do servidor
cd server

# Instalar dependências
npm install

# Iniciar o servidor
npm start
```

### **2. Verificar se está Funcionando**

Abra o navegador e teste:
- 🏥 **Health Check**: http://10.46.0.213:3001/api/health
- 📊 **Listar CPUs**: http://10.46.0.213:3001/api/cpus
- 👥 **Listar Usuários**: http://10.46.0.213:3001/api/users

### **3. Configurar Frontend para Usar API**

Alterar o frontend para usar a API ao invés do localStorage.

---

## 🔌 **API Endpoints**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Status do servidor |
| GET | `/api/cpus` | Listar todas as CPUs |
| POST | `/api/cpus` | Criar nova CPU |
| PUT | `/api/cpus/:id` | Atualizar CPU |
| DELETE | `/api/cpus/:id` | Deletar CPU |
| GET | `/api/users` | Listar usuários |
| GET | `/api/users/:username` | Buscar usuário |
| GET | `/api/stats` | Estatísticas gerais |

---

## 🔧 **Portas e Acessos**

### **Serviços Rodando:**
- 🌐 **Frontend**: `http://10.46.0.213:8080`
- 🔌 **Backend API**: `http://10.46.0.213:3001`
- 🗄️ **PostgreSQL**: `localhost:5432` (só local)

### **Acessos da Rede:**
```
http://10.46.0.213:8080/          ← Frontend (React)
http://10.46.0.213:3001/api/      ← Backend (Node.js)
```

---

## 📱 **Como Usar de Outras Máquinas**

### **Opção 1: Frontend já configurado**
1. Abrir: `http://10.46.0.213:8080`
2. Fazer login normalmente
3. Dados são compartilhados automaticamente

### **Opção 2: Testar API diretamente**
```bash
# Listar equipamentos
curl http://10.46.0.213:3001/api/cpus

# Criar novo equipamento
curl -X POST http://10.46.0.213:3001/api/cpus \
  -H "Content-Type: application/json" \
  -d '{
    "item": 1,
    "nomenclatura": "CPU-TESTE-001", 
    "tombamento": "TMB999",
    "marca_modelo": "Dell Test",
    "processador": "Intel i5",
    "memoria_ram": "8GB",
    "sistema_operacional": "Windows 11",
    "no_dominio": "SIM",
    "departamento": "TI",
    "responsavel": "Teste User",
    "e_estado": "210000999"
  }'
```

---

## 🛠️ **Troubleshooting**

### **Problema: "Connection refused"**
```bash
# Verificar se servidor está rodando
netstat -ano | findstr :3001

# Reiniciar servidor
cd server
npm start
```

### **Problema: "PostgreSQL não conecta"**
```powershell
# Verificar PostgreSQL
C:\postgres-portable\pgsql\bin\pg_ctl.exe -D C:\postgres-portable\data status

# Iniciar se necessário
C:\postgres-portable\pgsql\bin\pg_ctl.exe -D C:\postgres-portable\data start
```

### **Problema: "Firewall bloqueia"**
```powershell
# Abrir porta 3001 no firewall
New-NetFirewallRule -DisplayName "Work Machine Backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
```

---

## 📊 **Logs e Monitoramento**

### **Logs do Servidor:**
O servidor mostra logs de todas as requisições:
```
2025-09-30T14:55:00.000Z - GET /api/health
2025-09-30T14:55:05.000Z - GET /api/cpus
2025-09-30T14:55:10.000Z - POST /api/cpus
```

### **Monitorar Conexões:**
```powershell
# Ver conexões ativas
netstat -ano | findstr :3001

# Ver processos Node.js
Get-Process -Name node
```

---

## 🔒 **Segurança**

⚠️ **Importante**: Esta configuração é para uso interno na rede local.

Para produção, considere:
- 🔐 Autenticação JWT
- 🛡️ HTTPS
- 🚧 Rate limiting
- 📝 Logs de auditoria

---

## 🎯 **Resultado Esperado**

Após a configuração:

✅ **Máquina 1** adiciona CPU → Salva no PostgreSQL  
✅ **Máquina 2** vê a mesma CPU automaticamente  
✅ **Máquina 3** pode editar/excluir  
✅ **Todos compartilham os mesmos dados**

🎉 **Dados sincronizados entre todas as máquinas!**