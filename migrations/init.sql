-- Migração inicial para MySQL
-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS work_machine_viewer;
USE work_machine_viewer;

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de CPUs (equipamentos)
CREATE TABLE IF NOT EXISTS cpus (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
    e_estado INTEGER NOT NULL,
    data_formatacao DATE,
    desfazimento VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de Monitores
CREATE TABLE IF NOT EXISTS monitors (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    item INTEGER NOT NULL,
    tombamento VARCHAR(255),
    numero_serie VARCHAR(255) NOT NULL,
    modelo VARCHAR(255) NOT NULL,
    polegadas VARCHAR(255),
    observacao TEXT,
    data_verificacao DATE,
    responsavel VARCHAR(255) NOT NULL,
    e_estado INTEGER NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    desfazimento VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cpus_departamento ON cpus(departamento);
CREATE INDEX idx_cpus_estado ON cpus(e_estado);
CREATE INDEX idx_cpus_created_at ON cpus(created_at);
CREATE INDEX idx_monitors_departamento ON monitors(departamento);
CREATE INDEX idx_monitors_estado ON monitors(e_estado);
CREATE INDEX idx_monitors_created_at ON monitors(created_at);

-- Inserir usuário admin padrão (senha: admin123)
INSERT IGNORE INTO users (username, email, password_hash, role) 
VALUES (
    'admin', 
    'admin@example.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2G', -- admin123
    'admin'
);

-- Sistema inicia vazio - dados de equipamentos serão inseridos pelos usuários
