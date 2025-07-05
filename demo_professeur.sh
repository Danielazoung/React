#!/bin/bash

echo " PROJET 2IE - PLATEFORME GESTION BIBLIOTHÈQUE"
echo " Développé par Daniela ZOUNGRANA - Promotion 2IE/2025"
echo ""
echo " DÉMARRAGE AUTOMATIQUE..."
echo ""

# Vérifications
echo " Vérification Docker..."
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo " Docker ou Docker Compose non installé"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo " Docker non démarré"
    exit 1
fi

echo " Docker OK"
echo ""

# Nettoyage ports
echo " Nettoyage des ports..."
for port in 3000 3001 3306; do
    sudo kill -9 $(lsof -t -i:$port) 2>/dev/null || true
done

# Nettoyage containers
docker-compose down --remove-orphans >/dev/null 2>&1 || true
echo " Nettoyage OK"
echo ""

# Démarrage
echo "  Construction et démarrage (3-5 min)..."
echo "    npm install + compilation automatique"
echo ""

if docker-compose up --build -d; then
    echo " Construction réussie !"
    echo ""
    
    # Attendre
    echo " Initialisation (30 sec)..."
    sleep 30
    
    # Tests
    echo " Tests de validation..."
    
    # Test frontend
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo "    Frontend: http://localhost:3000"
    else
        echo "     Frontend en cours de démarrage..."
    fi
    
    # Test backend
    if curl -s http://localhost:3001/health >/dev/null 2>&1; then
        echo "    Backend: http://localhost:3001"
    else
        echo "     Backend en cours de démarrage..."
    fi
    
    # Test auth
    response=$(curl -s -X POST http://localhost:3001/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email": "admin@bibliotheque.com", "password": "admin123"}' 2>/dev/null)
    
    if echo "$response" | grep -q "token"; then
        echo "    Authentification admin OK"
    else
        echo "     Authentification à tester manuellement"
    fi
    
    echo ""
    echo " PLATEFORME PRÊTE !"
    echo ""
    echo " ACCÈS :"
    echo "    Interface    : http://localhost:3000"
    echo "    Connexion    : http://localhost:3000/login"
    echo "    Admin        : http://localhost:3000/admin"
    echo ""
    echo " COMPTES TEST :"
    echo "    Admin     : admin@bibliotheque.com / admin123"
    echo "    Étudiant  : etudiant@2ie.edu / student123"
    echo ""
    echo " TESTS À FAIRE :"
    echo "   1. Ouvrir http://localhost:3000"
    echo "   2. Créer un compte étudiant"
    echo "   3. Explorer le catalogue"
    echo "   4. Emprunter un livre"
    echo "   5. Tester l'admin"
    echo ""
    echo " État des services :"
    docker-compose ps
    echo ""
    echo " Arrêter : docker-compose down"
    echo " Logs : docker-compose logs"
    echo ""
    echo " BONNE ÉVALUATION !"
    
else
    echo " ERREUR DE CONSTRUCTION"
    echo ""
    echo " Logs d'erreur :"
    docker-compose logs
    echo ""
    echo " Solutions :"
    echo "   1. Redémarrer Docker"
    echo "   2. Relancer le script"
fi
