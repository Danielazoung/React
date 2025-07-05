#!/bin/bash

echo "🚀 Démarrage de la Plateforme de Gestion de Bibliothèque"
echo "========================================================"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier si les dépendances sont installées
echo -e "\n📦 Vérification des dépendances..."

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances backend...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances frontend...${NC}"
    cd frontend && npm install && cd ..
fi

# Vérifier si la base de données est initialisée
echo -e "\n🗄️ Vérification de la base de données..."
cd backend
npm run init-db
cd ..

echo -e "\n🌟 Lancement des serveurs..."

# Fonction pour tuer les processus en arrière-plan à la fin
cleanup() {
    echo -e "\n🛑 Arrêt des serveurs..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT

# Lancer le backend
echo -e "${GREEN}🔧 Démarrage du serveur backend (http://localhost:3001)...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Attendre que le backend démarre
sleep 5

# Lancer le frontend
echo -e "${GREEN}🎨 Démarrage du serveur frontend (http://localhost:3000)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Affichage des informations
echo -e "\n✅ Application démarrée avec succès!"
echo -e "📱 Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "🔧 Backend: ${GREEN}http://localhost:3001${NC}"
echo -e "📖 API Documentation: ${GREEN}http://localhost:3001${NC}"
echo ""
echo -e "👤 Compte administrateur:"
echo -e "   Email: ${YELLOW}admin@bibliotheque.com${NC}"
echo -e "   Mot de passe: ${YELLOW}admin123${NC}"
echo ""
echo -e "⚠️  Appuyez sur ${RED}Ctrl+C${NC} pour arrêter les serveurs"

# Attendre que l'utilisateur arrête l'application
wait
