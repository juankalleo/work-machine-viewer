FROM node:18

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json (se existir) do root
COPY package*.json ./

# Instalar dependências do projeto (inclui concurrently)
RUN npm install

# Copiar todo o código do projeto
COPY . .

# Instalar dependências do frontend (se estiver em subdiretório, e.g., /frontend)
# Descomente se o frontend está em um diretório separado
# COPY frontend/package*.json ./frontend/
# RUN cd frontend && npm install

# Expor portas para backend (3001) e frontend (5173, padrão para Vite)
EXPOSE 3001 5173

# Comando para rodar backend e frontend simultaneamente
CMD ["npm", "run", "start"]