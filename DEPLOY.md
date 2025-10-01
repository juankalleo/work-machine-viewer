# Deploy em Produção - DER-SESUT Monitoramento

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Acesso ao servidor MySQL: `193.203.175.32`
- Credenciais do banco:
  - Host: `193.203.175.32`
  - Usuário: `u869274312_kalleo`
  - Senha: `Kalleo@123`
  - Database: `u869274312_kalleo`

## 🚀 Deploy com Docker

### 1. Clone e prepare o projeto
```bash
git clone <seu-repositorio>
cd work-machine-viewer
```

### 2. Build da aplicação
```bash
# Build da imagem Docker
docker-compose build

# Ou build manual
docker build -t der-sesut-monitor .
```

### 3. Execute a migração do banco (primeira vez)
```bash
# Conectar ao MySQL e executar o script de migração
mysql -h 193.203.175.32 -u u869274312_kalleo -p u869274312_kalleo < migrations/init.sql

# Se já tem dados antigos, execute a migração de e_estado
mysql -h 193.203.175.32 -u u869274312_kalleo -p u869274312_kalleo < migrations/migrate_e_estado_to_integer.sql
```

### 4. Iniciar a aplicação
```bash
# Usando Docker Compose (recomendado)
docker-compose up -d

# Ou usando Docker diretamente
docker run -d \
  --name der-sesut-monitor \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e MYSQL_HOST=193.203.175.32 \
  -e MYSQL_USER=u869274312_kalleo \
  -e MYSQL_PASSWORD=Kalleo@123 \
  -e MYSQL_DATABASE=u869274312_kalleo \
  der-sesut-monitor
```

## 🌐 Acesso

- **Frontend**: http://193.203.175.32:3001
- **API**: http://193.203.175.32:3001/api
- **Health Check**: http://193.203.175.32:3001/api/health

## 👥 Credenciais de Login

- **Usuário**: `admin`
- **Senha**: `admin123`

## 📊 Funcionalidades

- ✅ **Dashboard** com estatísticas em tempo real
- ✅ **Busca de equipamentos** com filtros
- ✅ **Edição de equipamentos** (admin)
- ✅ **Importação de Excel** (admin)
- ✅ **Exportação de dados** para Excel
- ✅ **Gerenciamento de CPUs e Monitores**
- ✅ **Sistema de autenticação**

## 🔧 Configurações de Produção

### Variáveis de Ambiente
```env
NODE_ENV=production
PORT=3001
MYSQL_HOST=193.203.175.32
MYSQL_USER=u869274312_kalleo
MYSQL_PASSWORD=Kalleo@123
MYSQL_DATABASE=u869274312_kalleo
```

### Nginx (Opcional)
Se usar um proxy reverso como Nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📝 Comandos Úteis

```bash
# Ver logs da aplicação
docker-compose logs -f web

# Parar a aplicação
docker-compose down

# Reiniciar a aplicação
docker-compose restart web

# Atualizar a aplicação
git pull
docker-compose build
docker-compose up -d

# Backup do banco (opcional)
mysqldump -h 193.203.175.32 -u u869274312_kalleo -p u869274312_kalleo > backup_$(date +%Y%m%d).sql

# Verificar status da aplicação
curl http://193.203.175.32:3001/api/health
```

## 🛠️ Troubleshooting

### Problema de conexão com MySQL
```bash
# Testar conectividade
mysql -h 193.203.175.32 -u u869274312_kalleo -p u869274312_kalleo -e "SHOW TABLES;"
```

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs web

# Verificar se a porta está em uso
netstat -tulpn | grep :3001
```

### Limpar cache do Docker
```bash
# Limpar imagens não utilizadas
docker system prune -a

# Rebuild completo
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📋 Schema do Banco

O sistema usa as seguintes tabelas:

- **`cpus`**: Dados das CPUs/computadores
- **`monitors`**: Dados dos monitores
- **`users`**: Usuários do sistema (opcional, admin é fixo)

### Campo E-estado
- **Tipo**: INTEGER
- **Valores**: Números de identificação (ex: 210000509, 210000510)
- **0**: Equipamento inativo
- **> 0**: Equipamento ativo com código específico

## 📞 Suporte

Para questões técnicas, consulte os logs da aplicação ou verifique a conectividade com o banco de dados MySQL.