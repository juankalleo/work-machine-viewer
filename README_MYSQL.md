# Work Machine Viewer - Configuração MySQL

## Visão Geral

Este projeto agora utiliza **MySQL** como banco de dados principal, removendo as dependências do Supabase e PostgreSQL local.

## Configuração do Banco de Dados

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:

```env
# Configurações do banco MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=work_machine_viewer
DATABASE_URL=mysql://root:sua_senha@localhost:3306/work_machine_viewer
```

### 2. Criação do Banco

Execute o script de migração para criar o banco e as tabelas:

```bash
npm run db:migrate
```

Ou execute manualmente:

```bash
mysql -u root -p < migrations/init.sql
```

### 3. Scripts Disponíveis

- `npm run db:migrate` - Executa as migrações do banco
- `npm run db:test` - Testa a conexão com o banco
- `npm run db:connect` - Conecta ao banco via CLI
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Constrói o projeto para produção

## Estrutura do Banco

O banco possui as seguintes tabelas:

### users
- `id` - UUID único
- `username` - Nome de usuário único
- `email` - Email único
- `password_hash` - Hash da senha
- `role` - Papel do usuário (user, admin)
- `created_at` - Data de criação
- `updated_at` - Data de atualização

### cpus
- `id` - UUID único
- `item` - Número do item
- `nomenclatura` - Nome/descrição do equipamento
- `tombamento` - Número de tombamento
- `marca_modelo` - Marca e modelo
- `processador` - Tipo de processador
- `memoria_ram` - Quantidade de memória RAM
- `hd` - Disco rígido (opcional)
- `ssd` - SSD (opcional)
- `sistema_operacional` - Sistema operacional
- `no_dominio` - Nome no domínio
- `departamento` - Departamento responsável
- `responsavel` - Pessoa responsável
- `e_estado` - Estado atual do equipamento
- `data_formatacao` - Data da formatação (opcional)
- `desfazimento` - Informações de desfazimento
- `created_at` - Data de criação
- `updated_at` - Data de atualização

### monitors
- `id` - UUID único
- `item` - Número do item
- `tombamento` - Número de tombamento (opcional)
- `numero_serie` - Número de série
- `modelo` - Modelo do monitor
- `polegadas` - Tamanho em polegadas
- `observacao` - Observações gerais
- `data_verificacao` - Data da verificação
- `responsavel` - Pessoa responsável
- `e_estado` - Estado atual
- `departamento` - Departamento responsável
- `desfazimento` - Informações de desfazimento
- `created_at` - Data de criação
- `updated_at` - Data de atualização

## Usuário Padrão

O sistema cria automaticamente um usuário administrador:
- **Usuário:** admin
- **Senha:** admin123
- **Email:** admin@example.com

## Configuração para Produção

Para usar em produção com um servidor MySQL externo:

1. Altere as variáveis no `.env`:
   ```env
   DB_HOST=seu-servidor-mysql.com
   DB_PORT=3306
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha_segura
   DB_NAME=work_machine_viewer
   ```

2. Certifique-se de que o servidor MySQL permite conexões externas
3. Execute as migrações no servidor de produção
4. Configure SSL se necessário

## Troubleshooting

### Erro de Conexão
- Verifique se o MySQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão: `npm run db:test`

### Tabelas não encontradas
- Execute as migrações: `npm run db:migrate`
- Verifique se o banco foi criado corretamente

### Permissões
- Certifique-se de que o usuário MySQL tem permissões necessárias:
  ```sql
  GRANT ALL PRIVILEGES ON work_machine_viewer.* TO 'seu_usuario'@'%';
  FLUSH PRIVILEGES;
  ```

## Migração de Dados

Se você tinha dados em PostgreSQL ou Supabase, será necessário exportar e importar manualmente os dados para o MySQL.