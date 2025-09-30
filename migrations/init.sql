-- Migração inicial para PostgreSQL
-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de CPUs (equipamentos)
CREATE TABLE IF NOT EXISTS cpus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item INTEGER NOT NULL,
    nomenclatura VARCHAR(255) NOT NULL,
    tombamento VARCHAR(255) NOT NULL,
    marca_modelo VARCHAR(255) NOT NULL,
    processador VARCHAR(255) NOT NULL,
    memoria_ram VARCHAR(255) NOT NULL,
    hd VARCHAR(255),
    ssd VARCHAR(255),
    sistema_operacional VARCHAR(255) NOT NULL,
    no_dominio VARCHAR(255) NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    responsavel VARCHAR(255) NOT NULL,
    e_estado VARCHAR(255) NOT NULL,
    data_formatacao DATE,
    desfazimento VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de Monitores
CREATE TABLE IF NOT EXISTS monitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item INTEGER NOT NULL,
    tombamento VARCHAR(255),
    numero_serie VARCHAR(255) NOT NULL,
    modelo VARCHAR(255) NOT NULL,
    polegadas VARCHAR(255),
    observacao TEXT,
    data_verificacao DATE,
    responsavel VARCHAR(255) NOT NULL,
    e_estado VARCHAR(255) NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    desfazimento VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_cpus_departamento ON cpus(departamento);
CREATE INDEX IF NOT EXISTS idx_cpus_estado ON cpus(e_estado);
CREATE INDEX IF NOT EXISTS idx_cpus_created_at ON cpus(created_at);
CREATE INDEX IF NOT EXISTS idx_monitors_departamento ON monitors(departamento);
CREATE INDEX IF NOT EXISTS idx_monitors_estado ON monitors(e_estado);
CREATE INDEX IF NOT EXISTS idx_monitors_created_at ON monitors(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cpus_updated_at
    BEFORE UPDATE ON cpus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitors_updated_at
    BEFORE UPDATE ON monitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO users (username, email, password_hash, role) 
VALUES (
    'admin', 
    'admin@example.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2G', -- admin123
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Sistema inicia vazio - dados de equipamentos serão inseridos pelos usuários
