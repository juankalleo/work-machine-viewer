# Work Machine Viewer - Sistema Integrado Multi-Dispositivo

## 🚀 Visão Geral

O sistema agora funciona de forma completamente integrada entre múltiplos dispositivos (computadores e celulares), permitindo que equipamentos sejam incluídos, editados ou excluídos de qualquer dispositivo e apareçam automaticamente em todos os outros dispositivos conectados.

## 🔧 Configuração do Sistema

### 1. Configurar o Banco de Dados PostgreSQL

```bash
# 1. Instalar PostgreSQL (se não tiver instalado)
# No Windows: Baixar do site oficial postgresql.org

# 2. Criar o banco de dados
createdb work_machine_viewer

# 3. Executar as migrações
psql -d work_machine_viewer -f migrations/init.sql
```

### 2. Configurar o Servidor Backend

```bash
# 1. Navegar para a pasta do servidor
cd server

# 2. Instalar dependências (se não tiver feito ainda)
npm install express cors pg

# 3. Iniciar o servidor
node server.js
```

O servidor será iniciado em:
- **Localhost**: `http://localhost:3001`
- **Rede local**: `http://10.46.0.213:3001`

### 3. Configurar o Frontend

```bash
# 1. Na pasta raiz do projeto
npm install

# 2. Iniciar o frontend
npm run dev
```

## 🌐 Como Funciona a Integração

### Descoberta Automática do Servidor

O sistema tenta encontrar automaticamente o servidor backend na rede:

1. **http://localhost:3001** - Servidor local
2. **http://10.46.0.213:3001** - Servidor da rede (GTI)
3. **http://192.168.1.100:3001** - Outros servidores configurados

### Sincronização em Tempo Real

- **Polling a cada 5 segundos**: Verifica mudanças automaticamente
- **Cache local**: Funciona offline com dados em cache
- **Reconexão automática**: Tenta reconectar a cada 30 segundos quando offline

### Indicadores Visuais

- **Status de conexão**: Verde (online) / Vermelho (offline)
- **Indicador de sincronização**: Ícone girando durante sync
- **Última sincronização**: Mostra quando foi a última atualização
- **Número de dispositivos**: Quantos dispositivos estão conectados

## 🔄 Fluxo de Funcionamento

### Adicionando Equipamentos

1. **Usuário adiciona equipamento** em qualquer dispositivo
2. **Sistema salva no PostgreSQL** via API
3. **Cache local é invalidado** para forçar reload
4. **Outros dispositivos detectam mudança** via polling
5. **Equipamento aparece em todos os dispositivos** automaticamente

### Modo Offline

- Dados ficam salvos no **cache local do navegador**
- Interface mostra **mensagem de "Modo Offline"**
- Quando conectar novamente, **sincroniza automaticamente**

## ⚙️ Configuração Manual do Servidor

Se a descoberta automática falhar:

1. Clique no ícone de **configurações** no status de conexão
2. Digite o **endereço do servidor** manualmente
3. Clique em **"Testar"** para verificar conexão
4. **Salvar** se o teste passar

### Endereços Típicos:

```
http://localhost:3001          # Servidor local
http://10.46.0.213:3001        # Servidor da rede GTI
http://192.168.1.100:3001      # Outro servidor da rede
```

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dispositivo 1 │    │   Dispositivo 2 │    │   Dispositivo N │
│    (React)      │    │    (React)      │    │    (React)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      Servidor Backend     │
                    │       (Node.js)           │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │      PostgreSQL           │
                    │   (Banco de Dados)        │
                    └───────────────────────────┘
```

## 🆕 Mudanças Principais

### 1. Sistema de Database
- ✅ **Substituído localStorage** por API REST
- ✅ **PostgreSQL compartilhado** entre todos os dispositivos
- ✅ **Cache local** para funcionamento offline

### 2. Sincronização
- ✅ **Polling automático** a cada 5 segundos
- ✅ **Detecção de mudanças** via hash de dados
- ✅ **Reconexão automática** quando servidor volta online

### 3. Interface
- ✅ **Indicadores de status** (online/offline)
- ✅ **Configurações de servidor** manual
- ✅ **Mensagens de erro** amigáveis
- ✅ **Botão de sincronização** manual

### 4. Dados Limpos
- ✅ **Removidos dados de exemplo**
- ✅ **Sistema inicia vazio**
- ✅ **Apenas usuário admin padrão** (admin/admin123)

## 🔐 Usuário Padrão

**Usuário**: `admin`  
**Senha**: `admin123`  
**Papel**: Administrador (pode adicionar/editar/excluir)

## 📱 Uso em Celulares

O sistema é **responsive** e funciona perfeitamente em celulares:

1. Abrir navegador no celular
2. Acessar o endereço do servidor (ex: `http://10.46.0.213:5173`)
3. Fazer login com admin/admin123
4. Usar normalmente - tudo sincroniza automaticamente!

## 🔧 Troubleshooting

### Servidor não encontrado
- Verificar se PostgreSQL está rodando
- Verificar se servidor Node.js está ativo
- Tentar configurar servidor manualmente

### Dados não sincronizam
- Verificar conexão de rede
- Forçar sincronização manual
- Verificar console do navegador para erros

### Performance
- Sistema foi otimizado para redes locais
- Cache local reduz uso de banda
- Polling inteligente só quando necessário

## 🎯 Benefícios

- ✅ **Multi-dispositivo real**: Funciona em qualquer lugar da rede
- ✅ **Tempo real**: Mudanças aparecem em segundos
- ✅ **Funciona offline**: Cache local para situações sem rede
- ✅ **Fácil de usar**: Descoberta automática de servidor
- ✅ **Robusto**: Reconexão automática e tratamento de erros
- ✅ **Escalável**: Suporta muitos dispositivos simultaneamente

Agora o sistema está completamente integrado e pronto para uso em múltiplos dispositivos! 🚀