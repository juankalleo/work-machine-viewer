#!/bin/bash

echo "🚀 Configurando PostgreSQL para work-machine-viewer..."

# Verificar se o PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não está instalado. Instalando..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt &> /dev/null; then
            sudo apt update
            sudo apt install -y postgresql postgresql-contrib
        elif command -v yum &> /dev/null; then
            sudo yum install -y postgresql postgresql-server postgresql-contrib
            sudo postgresql-setup initdb
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install postgresql
            brew services start postgresql
        fi
    fi
fi

# Iniciar PostgreSQL
echo "🔄 Iniciando PostgreSQL..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Criar banco de dados
echo "🗄️ Criando banco de dados..."
sudo -u postgres psql -c "CREATE DATABASE work_machine_viewer;" 2>/dev/null || echo "Banco já existe"

# Criar usuário se não existir
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';" 2>/dev/null || echo "Usuário já existe"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE work_machine_viewer TO postgres;" 2>/dev/null

# Executar migrações
echo "🔄 Aplicando migrações..."
PGPASSWORD=postgres psql -h localhost -U postgres -d work_machine_viewer -f migrations/init.sql

echo "✅ Configuração concluída!"
echo "📊 Database: postgresql://postgres:postgres@localhost:5432/work_machine_viewer"
