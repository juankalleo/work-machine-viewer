# Work Machine Viewer - PostgreSQL

Sistema de monitoramento de equipamentos usando PostgreSQL local.

## 🚀 Configuração Rápida

### 1. Instalar PostgreSQL

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS:
```bash
brew install postgresql
brew services start postgresql
```

### 2. Configurar o Projeto

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:setup

# Iniciar o projeto
npm run dev
```

## 📊 Estrutura do Banco

### Tabelas Principais:

- **users**: Usuários do sistema
- **cpus**: Equipamentos/CPUs cadastrados

### Usuário Padrão:
- **Username**: admin
- **Password**: admin123
- **Role**: admin

## 🔧 Comandos Úteis

```bash
# Configurar banco
npm run db:setup

# Testar conexão
npm run db:test

# Aplicar migrações
npm run db:migrate

# Iniciar desenvolvimento
npm run dev
```

## 🌐 URLs

- **Aplicação**: http://localhost:8080
- **Database**: postgresql://postgres:postgres@localhost:5432/work_machine_viewer

## 🔐 Autenticação

O sistema usa JWT para autenticação. As configurações estão em:
- `src/lib/auth.ts` - Lógica de autenticação
- `src/lib/database.ts` - Conexão com PostgreSQL

## 📁 Estrutura do Projeto

```
src/
├── lib/
│   ├── auth.ts          # Autenticação JWT
│   ├── database.ts      # Conexão PostgreSQL
│   └── equipment.ts     # CRUD de equipamentos
├── hooks/
│   ├── useAuth.ts       # Hook de autenticação
│   └── useEquipment.ts  # Hook de equipamentos
└── components/          # Componentes React
```

## 🛠️ Desenvolvimento

### Adicionar Novo Equipamento:
```typescript
import { insertCPU } from '@/lib/equipment';

const newCPU = await insertCPU({
  item: 1,
  nomenclatura: 'CPU-001',
  tombamento: 'TMB001',
  // ... outros campos
});
```

### Autenticação:
```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, login, signOut } = useAuth();
```

## 🐛 Solução de Problemas

### Erro de Conexão:
1. Verifique se PostgreSQL está rodando: `pg_isready`
2. Teste a conexão: `npm run db:test`
3. Verifique as credenciais no arquivo `.env`

### Erro de Permissão:
1. Verifique se o usuário `postgres` existe
2. Teste: `psql -h localhost -U postgres -d postgres`

### Migrações:
1. Execute: `npm run db:migrate`
2. Verifique se o arquivo `migrations/init.sql` existe

## 📝 Notas

- O sistema não usa mais Supabase
- Autenticação é feita via JWT
- Banco de dados é PostgreSQL puro
- Todas as operações são síncronas com PostgreSQL
