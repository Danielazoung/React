#!/bin/bash

# Script de déploiement Docker - Plateforme de Gestion de Bibliothèque
# Date: 2025-07-04

echo "🚀 Déploiement Docker - Plateforme de Gestion de Bibliothèque"
echo "============================================================="

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

echo "✅ Docker et Docker Compose sont installés"

# Arrêter les containers existants
echo "🛑 Arrêt des containers existants..."
docker-compose down --remove-orphans

# Supprimer les images existantes pour forcer la reconstruction
echo "🗑️  Suppression des images existantes..."
docker-compose down --rmi all --volumes --remove-orphans

# Construire et démarrer les services
echo "🔨 Construction et démarrage des services..."
docker-compose up --build -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier le statut des services
echo "📊 Vérification du statut des services..."
docker-compose ps

# Tester les services
echo "🧪 Test des services..."

# Test MySQL
echo "🗄️  Test MySQL..."
if docker-compose exec mysql mysqladmin ping -h localhost --silent; then
    echo "✅ MySQL fonctionne"
else
    echo "❌ MySQL ne répond pas"
fi

# Test Backend
echo "🔧 Test Backend..."
sleep 5
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend fonctionne"
else
    echo "❌ Backend ne répond pas"
fi

# Test Frontend
echo "🌐 Test Frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend fonctionne"
else
    echo "❌ Frontend ne répond pas"
fi

echo ""
echo "🎉 Déploiement terminé !"
echo "======================"
echo ""
echo "🌐 Services disponibles :"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"
echo "- Admin Panel: http://localhost:3000/admin"
echo "- API Health: http://localhost:3001/health"
echo ""
echo "📊 Commandes utiles :"
echo "- Voir les logs: docker-compose logs -f [service]"
echo "- Arrêter: docker-compose down"
echo "- Redémarrer: docker-compose restart"
echo "- Rebuild: docker-compose up --build -d"
echo ""
echo "🔐 Connexion admin par défaut :"
echo "- Email: admin@bibliotheque.com"
echo "- Password: admin123"
