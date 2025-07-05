# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# Installer toutes les dépendances (y compris dev pour TypeScript)
RUN npm ci

# Copier le code source
COPY src/ ./src/
COPY database/ ./database/

# Construire l'application
RUN npm run build

# Supprimer les dépendances de développement après le build
RUN npm prune --production

# Exposer le port
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# Commande de démarrage
CMD ["npm", "start"]
