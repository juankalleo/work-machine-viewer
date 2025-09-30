#!/bin/bash

echo "🚀 Configuração Manual do PostgreSQL"
echo "====================================="
echo ""

# Verificar se PostgreSQL está rodando
if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "✅ PostgreSQL está rodando"
else
    echo "❌ PostgreSQL não está rodando"
    echo "   Execute: sudo systemctl start postgresql"
    exit 1
fi

echo ""
echo "📋 Execute os comandos abaixo no terminal:"
echo ""

echo "1️⃣ Configure a senha do usuário postgres:"
echo "   sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\""
echo ""

echo "2️⃣ Crie o banco de dados:"
echo "   sudo -u postgres createdb work_machine_viewer"
echo ""

echo "3️⃣ Teste a conexão:"
echo "   psql -h localhost -U postgres -d work_machine_viewer -c \"SELECT 1;\""
echo ""

echo "4️⃣ Aplique as migrações:"
echo "   psql -h localhost -U postgres -d work_machine_viewer -f migrations/init.sql"
echo ""

echo "5️⃣ Inicie o projeto:"
echo "   npm run dev"
echo ""

echo "🔧 Se der erro de autenticação, tente:"
echo "   sudo -u postgres psql"
echo "   \\password postgres"
echo "   (digite 'postgres' como senha)"
echo "   \\q"
echo ""

echo "📊 Após configurar, o banco estará em:"
echo "   postgresql://postgres:postgres@localhost:5432/work_machine_viewer"
