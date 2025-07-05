#!/bin/bash

echo "🧪 Tests de l'API Plateforme de Gestion de Bibliothèque"
echo "=================================================="

API_URL="http://localhost:3001/api"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester une route
test_route() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local expected_status=$5
    
    echo -e "\n${YELLOW}Testing: $method $endpoint${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$API_URL$endpoint" $headers)
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$API_URL$endpoint" -H "Content-Type: application/json" $headers -d "$data")
    fi
    
    body=$(echo "$response" | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
    status=$(echo "$response" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ Status: $status (attendu: $expected_status)${NC}"
    else
        echo -e "${RED}❌ Status: $status (attendu: $expected_status)${NC}"
    fi
    
    echo "Response: $body" | jq . 2>/dev/null || echo "Response: $body"
}

echo -e "\n📊 Test de santé du serveur"
test_route "GET" "/health" "" "" "200"

echo -e "\n🔐 Test d'authentification"

# Test de connexion admin
echo -e "\n👤 Connexion admin"
login_response=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@bibliotheque.com","password":"admin123"}')

echo "Login response: $login_response"

# Extraire le token
token=$(echo "$login_response" | jq -r '.token' 2>/dev/null)

if [ "$token" != "null" ] && [ "$token" != "" ]; then
    echo -e "${GREEN}✅ Token obtenu: ${token:0:20}...${NC}"
    
    # Tests avec authentification
    echo -e "\n📚 Tests des livres"
    test_route "GET" "/livres" "" "" "200"
    
    echo -e "\n👥 Tests des utilisateurs (Admin)"
    test_route "GET" "/admin/users" "" "-H \"Authorization: Bearer $token\"" "200"
    
    echo -e "\n📊 Test des statistiques (Admin)"
    test_route "GET" "/admin/stats" "" "-H \"Authorization: Bearer $token\"" "200"
    
    echo -e "\n📋 Test des catégories"
    test_route "GET" "/categories" "" "" "200"
    
    echo -e "\n📖 Test des emprunts en attente (Admin)"
    test_route "GET" "/emprunts/admin/en-attente" "" "-H \"Authorization: Bearer $token\"" "200"
    
else
    echo -e "${RED}❌ Impossible d'obtenir le token d'authentification${NC}"
fi

echo -e "\n🎯 Tests d'inscription"
test_route "POST" "/auth/register" '{
    "nom": "Test",
    "prenom": "User",
    "email": "test@example.com",
    "password": "password123",
    "numero_etudiant": "TEST123",
    "role": "etudiant"
}' "" "201"

echo -e "\n📝 Test de connexion utilisateur"
test_route "POST" "/auth/login" '{
    "email": "test@example.com",
    "password": "password123"
}' "" "200"

echo -e "\n🔚 Tests terminés!"
