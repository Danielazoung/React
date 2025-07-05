#!/bin/bash

# Script de test pour l'auto-rechargement après ajout livre/utilisateur
# Date: 2025-07-04

echo "🧪 Test auto-rechargement après ajout livre/utilisateur"
echo "======================================================="

# Variables
BACKEND_URL="http://localhost:3001/api"
ADMIN_TOKEN=""

# 1. Connexion Admin
echo "1. 🔐 Connexion administrateur..."
ADMIN_RESPONSE=$(curl -s -X POST $BACKEND_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bibliotheque.com","password":"admin123"}')
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')
echo "✅ Admin connecté : Token obtenu"

# 2. Vérifier le nombre de livres actuel
echo "2. 📚 Comptage des livres actuels..."
LIVRES_RESPONSE=$(curl -s -X GET $BACKEND_URL/livres \
  -H "Authorization: Bearer $ADMIN_TOKEN")
LIVRES_COUNT=$(echo $LIVRES_RESPONSE | jq -r '.livres | length')
echo "✅ Nombre de livres actuels: $LIVRES_COUNT"

# 3. Ajouter un nouveau livre
echo "3. ➕ Ajout d'un nouveau livre..."
NOUVEAU_LIVRE=$(curl -s -X POST $BACKEND_URL/livres \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "titre": "Test Auto-Refresh Livre",
    "auteur": "Auteur Test",
    "ISBN": "TEST-'$(date +%s)'",
    "description": "Livre de test pour vérifier auto-refresh",
    "categorie_id": 1,
    "nombre_exemplaires": 2
  }')
echo "✅ Livre ajouté"

# 4. Vérifier le nouveau comptage
echo "4. 🔍 Vérification du nouveau comptage..."
sleep 1
LIVRES_RESPONSE_NEW=$(curl -s -X GET $BACKEND_URL/livres \
  -H "Authorization: Bearer $ADMIN_TOKEN")
LIVRES_COUNT_NEW=$(echo $LIVRES_RESPONSE_NEW | jq -r '.livres | length')
echo "✅ Nouveau nombre de livres: $LIVRES_COUNT_NEW"

# 5. Vérifier le nombre d'utilisateurs actuel
echo "5. 👥 Comptage des utilisateurs actuels..."
USERS_RESPONSE=$(curl -s -X GET $BACKEND_URL/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN")
USERS_COUNT=$(echo $USERS_RESPONSE | jq -r 'length')
echo "✅ Nombre d'utilisateurs actuels: $USERS_COUNT"

# 6. Ajouter un nouvel utilisateur
echo "6. ➕ Ajout d'un nouvel utilisateur..."
NOUVEL_USER=$(curl -s -X POST $BACKEND_URL/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "nom": "TestRefresh",
    "prenom": "User",
    "email": "test.refresh.'$(date +%s)'@example.com",
    "password": "password123",
    "numero_etudiant": "TEST'$(date +%s)'",
    "role": "etudiant"
  }')
echo "✅ Utilisateur ajouté"

# 7. Vérifier le nouveau comptage d'utilisateurs
echo "7. 🔍 Vérification du nouveau comptage d'utilisateurs..."
sleep 1
USERS_RESPONSE_NEW=$(curl -s -X GET $BACKEND_URL/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN")
USERS_COUNT_NEW=$(echo $USERS_RESPONSE_NEW | jq -r 'length')
echo "✅ Nouveau nombre d'utilisateurs: $USERS_COUNT_NEW"

echo ""
echo "📊 Résumé des tests :"
echo "===================="
echo "- Livres avant: $LIVRES_COUNT"
echo "- Livres après: $LIVRES_COUNT_NEW"
echo "- Utilisateurs avant: $USERS_COUNT"
echo "- Utilisateurs après: $USERS_COUNT_NEW"

if [ $LIVRES_COUNT_NEW -gt $LIVRES_COUNT ]; then
  echo "✅ Test livre: RÉUSSI - Le comptage a augmenté"
else
  echo "❌ Test livre: ÉCHOUÉ - Le comptage n'a pas augmenté"
fi

if [ $USERS_COUNT_NEW -gt $USERS_COUNT ]; then
  echo "✅ Test utilisateur: RÉUSSI - Le comptage a augmenté"
else
  echo "❌ Test utilisateur: ÉCHOUÉ - Le comptage n'a pas augmenté"
fi

echo ""
echo "🌐 Instructions pour test manuel frontend :"
echo "=========================================="
echo "1. Ouvrir http://localhost:3000/admin/livres"
echo "2. Cliquer sur 'Ajouter un livre'"
echo "3. Remplir le formulaire et valider"
echo "4. ✅ Vérifier que le livre apparaît immédiatement dans la liste"
echo ""
echo "5. Ouvrir http://localhost:3000/admin/utilisateurs"
echo "6. Cliquer sur 'Ajouter un utilisateur'"
echo "7. Remplir le formulaire et valider"
echo "8. ✅ Vérifier que l'utilisateur apparaît immédiatement dans la liste"
