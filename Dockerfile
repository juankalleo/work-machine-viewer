# Multi-stage build para otimização
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build da aplicação frontend
RUN npm run build

# Estágio de produção
FROM node:18-alpine AS production

# Instalar dependências do sistema necessárias para MySQL
RUN apk add --no-cache mysql-client

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar dependências do backend
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Voltar para o diretório principal
WORKDIR /app

# Copiar arquivos buildados do frontend
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Copiar código do servidor
COPY --chown=nextjs:nodejs server/ ./server/

# Copiar arquivos de configuração e migração
COPY --chown=nextjs:nodejs migrations/ ./migrations/

# Usar usuário não-root
USER nextjs

# Expor apenas a porta do backend (3001)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "http.get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar apenas o servidor (frontend será servido como arquivos estáticos)
CMD ["node", "server/server.js"]
