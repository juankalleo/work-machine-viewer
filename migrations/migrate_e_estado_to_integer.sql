-- Migração para converter o campo e_estado de VARCHAR para INTEGER
-- Este script deve ser executado APÓS fazer backup dos dados existentes

-- 1. Primeiro, criar colunas temporárias para armazenar os novos valores
ALTER TABLE cpus ADD COLUMN e_estado_temp INTEGER;
ALTER TABLE monitors ADD COLUMN e_estado_temp INTEGER;

-- 2. Converter os valores existentes para números
-- Assumindo que valores como "Ativo", "ATIVO", ou números em string devem virar números
-- Você pode ajustar essas regras conforme seus dados atuais
UPDATE cpus SET e_estado_temp = 
  CASE 
    WHEN e_estado REGEXP '^[0-9]+$' THEN CAST(e_estado AS UNSIGNED)  -- Se já é um número em string
    WHEN LOWER(e_estado) IN ('ativo', 'active', 'sim', 'yes', '1') THEN 210000509  -- Estados ativos
    WHEN LOWER(e_estado) IN ('inativo', 'inactive', 'nao', 'no', '0') THEN 0  -- Estados inativos
    WHEN LOWER(e_estado) = 'rasurado' THEN -1  -- Estado especial rasurado
    ELSE 0  -- Valor padrão para casos não mapeados
  END;

UPDATE monitors SET e_estado_temp = 
  CASE 
    WHEN e_estado REGEXP '^[0-9]+$' THEN CAST(e_estado AS UNSIGNED)  -- Se já é um número em string
    WHEN LOWER(e_estado) IN ('ativo', 'active', 'sim', 'yes', '1') THEN 210000509  -- Estados ativos
    WHEN LOWER(e_estado) IN ('inativo', 'inactive', 'nao', 'no', '0') THEN 0  -- Estados inativos
    WHEN LOWER(e_estado) = 'rasurado' THEN -1  -- Estado especial rasurado
    ELSE 0  -- Valor padrão para casos não mapeados
  END;

-- 3. Verificar se a conversão foi bem-sucedida (opcional)
-- SELECT e_estado, e_estado_temp, COUNT(*) FROM cpus GROUP BY e_estado, e_estado_temp;
-- SELECT e_estado, e_estado_temp, COUNT(*) FROM monitors GROUP BY e_estado, e_estado_temp;

-- 4. Remover a coluna antiga e renomear a nova
ALTER TABLE cpus DROP COLUMN e_estado;
ALTER TABLE cpus CHANGE COLUMN e_estado_temp e_estado INTEGER NOT NULL;

ALTER TABLE monitors DROP COLUMN e_estado;
ALTER TABLE monitors CHANGE COLUMN e_estado_temp e_estado INTEGER NOT NULL;

-- 5. Recriar índices se necessário
DROP INDEX idx_cpus_estado;
DROP INDEX idx_monitors_estado;
CREATE INDEX idx_cpus_estado ON cpus(e_estado);
CREATE INDEX idx_monitors_estado ON monitors(e_estado);

-- 6. Verificação final
SELECT 'Migração concluída. Verificando dados:' as status;
SELECT 'CPUs por e_estado:' as info;
SELECT e_estado, COUNT(*) as count FROM cpus GROUP BY e_estado ORDER BY e_estado;
SELECT 'Monitores por e_estado:' as info;
SELECT e_estado, COUNT(*) as count FROM monitors GROUP BY e_estado ORDER BY e_estado;