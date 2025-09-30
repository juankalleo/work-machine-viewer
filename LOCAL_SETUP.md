# Configuração do PostgreSQL Local

Este guia explica como configurar o projeto para usar PostgreSQL local diretamente, sem Supabase.

## Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL (versão 15 ou superior)

## Instalação

### 1. Instalar PostgreSQL

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (com Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

### 2. Configurar o Projeto

Execute o script de configuração:
```bash
./setup-postgresql.sh
```

Ou configure manualmente:

1. Crie o banco de dados:
```bash
sudo -u postgres createdb work_machine_viewer
```

2. Aplique as migrações:
```bash
npm run db:migrate
```

## Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=work_machine_viewer
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Configurações de Autenticação JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

## URLs de Desenvolvimento

Após configurar o PostgreSQL, você terá acesso a:

- **Database URL**: postgresql://postgres:postgres@localhost:5432/work_machine_viewer
- **Aplicação**: http://localhost:8080 (após executar `npm run dev`)

## Comandos Úteis

### Configurar banco de dados:
```bash
npm run db:setup
```

### Testar conexão:
```bash
npm run db:test
```

### Aplicar migrações:
```bash
npm run db:migrate
```

### Iniciar o projeto React:
```bash
npm run dev
```

## Estrutura do Banco de Dados

O projeto usa as seguintes tabelas:

- **cpus**: Armazena informações dos equipamentos
- **profiles**: Gerencia usuários e permissões

## Solução de Problemas

### Erro de conexão com o banco:
1. Verifique se o PostgreSQL está rodando: `sudo systemctl status postgresql`
2. Verifique se o Supabase está rodando: `supabase status`
3. Reinicie o Supabase: `supabase stop && supabase start`

### Erro de permissão:
1. Verifique se o usuário tem permissões adequadas no PostgreSQL
2. Verifique se as portas 54321, 54322, 54323 estão disponíveis

### Migrações não aplicadas:
1. Execute `supabase db reset` para recriar o banco
2. Verifique se os arquivos de migração estão na pasta `supabase/migrations/`

## Migração de Dados

Se você tem dados no Supabase remoto que deseja migrar para o local:

1. Exporte os dados do Supabase remoto
2. Importe os dados no banco local usando o Supabase Studio (http://localhost:54323)
3. Ou use scripts SQL para inserir os dados diretamente

## Desenvolvimento

Com o ambiente local configurado, você pode:

- Desenvolver sem dependência de internet
- Testar mudanças no banco de dados
- Usar ferramentas locais de debug
- Ter controle total sobre o ambiente de desenvolvimento
