#!/bin/bash

echo "🚀 Configurando PostgreSQL para work-machine-viewer..."

# Verificar se o PostgreSQL está rodando
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "❌ PostgreSQL não está rodando. Inicie o PostgreSQL primeiro:"
    echo "   sudo systemctl start postgresql"
    echo "   # ou no macOS: brew services start postgresql"
    exit 1
fi

# Testar conexão
echo "🔄 Testando conexão com PostgreSQL..."
if psql -h localhost -U postgres -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Conexão com PostgreSQL OK"
else
    echo "❌ Erro ao conectar com PostgreSQL"
    echo "   Verifique se o PostgreSQL está rodando e as credenciais estão corretas"
    exit 1
fi

# Criar banco se não existir
echo "🗄️ Criando banco de dados..."
psql -h localhost -U postgres -d postgres -c "CREATE DATABASE work_machine_viewer;" 2>/dev/null || echo "Banco já existe"

# Aplicar migrações
echo "🔄 Aplicando migrações..."
if [ -f "migrations/init.sql" ]; then
    psql -h localhost -U postgres -d work_machine_viewer -f migrations/init.sql
    echo "✅ Migrações aplicadas com sucesso"
else
    echo "❌ Arquivo de migração não encontrado: migrations/init.sql"
    exit 1
fi

echo "✅ Configuração concluída!"
echo "📊 Database: postgresql://postgres:postgres@localhost:5432/work_machine_viewer"
echo ""
echo "🚀 Para iniciar o projeto: npm run dev"
