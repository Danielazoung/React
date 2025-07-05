#!/bin/bash

# Script de développement Docker - Base de données seulement
# Date: 2025-07-04

echo "🛠️  Mode développement Docker - Base de données MySQL"
echo "===================================================="

# Démarrer seulement MySQL pour le développement
echo "🗄️  Démarrage de MySQL pour le développement..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Attente de MySQL..."
sleep 10

# Vérifier MySQL
if docker-compose -f docker-compose.dev.yml exec mysql-dev mysqladmin ping -h localhost --silent; then
    echo "✅ MySQL dev fonctionne sur port 3306"
else
    echo "❌ MySQL dev ne répond pas"
fi

echo ""
echo "🎯 Développement prêt !"
echo "======================"
echo ""
echo "🗄️  MySQL disponible sur localhost:3306"
echo "📋 Base de données: bibliotheque"
echo "👤 Utilisateur: root"
echo "🔑 Mot de passe: Aiman2003@"
echo ""
echo "💻 Pour développer :"
echo "1. cd backend && npm run dev"
echo "2. cd frontend && npm run dev"
echo ""
echo "🛑 Pour arrêter :"
echo "docker-compose -f docker-compose.dev.yml down"
