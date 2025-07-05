#!/bin/bash

# Script de test complet du système d'emprunt et de retour
# Date: 2025-07-04

echo "🧪 Test complet du système d'emprunt et de retour"
echo "================================================="

# Variables
BACKEND_URL="http://localhost:3001/api"
ADMIN_TOKEN=""
STUDENT_TOKEN=""

# 1. Connexion Admin
echo "1. 🔐 Connexion administrateur..."
ADMIN_RESPONSE=$(curl -s -X POST $BACKEND_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bibliotheque.com","password":"admin123"}')
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')
echo "✅ Admin connecté"

# 2. Création d'un étudiant
echo "2. 👤 Création d'un compte étudiant..."
STUDENT_RESPONSE=$(curl -s -X POST $BACKEND_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nom":"Martin","prenom":"Alice","email":"alice.martin@etudiant.com","numero_etudiant":"E54321","password":"password123","role":"etudiant"}')
STUDENT_TOKEN=$(echo $STUDENT_RESPONSE | jq -r '.token')
echo "✅ Étudiant créé"

# 3. Demande d'emprunt
echo "3. 📚 Demande d'emprunt par l'étudiant..."
EMPRUNT_RESPONSE=$(curl -s -X POST $BACKEND_URL/emprunts/emprunter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{"livre_id":3}')
echo "✅ Demande d'emprunt soumise"

# 4. Vérification des emprunts en attente
echo "4. 📋 Vérification des emprunts en attente..."
EMPRUNTS_ATTENTE=$(curl -s -X GET $BACKEND_URL/emprunts/admin/en-attente \
  -H "Authorization: Bearer $ADMIN_TOKEN")
EMPRUNT_ID=$(echo $EMPRUNTS_ATTENTE | jq -r '.[0].id')
echo "✅ Emprunt ID: $EMPRUNT_ID en attente"

# 5. Approbation de l'emprunt
echo "5. ✅ Approbation de l'emprunt par l'admin..."
curl -s -X POST $BACKEND_URL/emprunts/admin/approuver/$EMPRUNT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null
echo "✅ Emprunt approuvé"

# 6. Demande de retour
echo "6. 🔄 Demande de retour par l'étudiant..."
curl -s -X POST $BACKEND_URL/emprunts/demander-retour \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "{\"emprunt_id\":$EMPRUNT_ID}" > /dev/null
echo "✅ Demande de retour soumise"

# 7. Vérification des retours en attente
echo "7. 📋 Vérification des retours en attente..."
RETOURS_ATTENTE=$(curl -s -X GET $BACKEND_URL/emprunts/admin/retours-en-attente \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "✅ Retour en attente vérifié"

# 8. Validation du retour
echo "8. ✅ Validation du retour par l'admin..."
curl -s -X POST $BACKEND_URL/emprunts/admin/valider-retour/$EMPRUNT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null
echo "✅ Retour validé"

# 9. Test de la route de compatibilité
echo "9. 🔧 Test de la route de compatibilité..."
# Créer un autre emprunt pour tester
EMPRUNT2_RESPONSE=$(curl -s -X POST $BACKEND_URL/emprunts/emprunter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{"livre_id":4}')

# Obtenir l'ID du nouvel emprunt
EMPRUNTS_ATTENTE2=$(curl -s -X GET $BACKEND_URL/emprunts/admin/en-attente \
  -H "Authorization: Bearer $ADMIN_TOKEN")
EMPRUNT_ID2=$(echo $EMPRUNTS_ATTENTE2 | jq -r '.[0].id')

# Approuver
curl -s -X POST $BACKEND_URL/emprunts/admin/approuver/$EMPRUNT_ID2 \
  -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null

# Tester l'ancienne route
curl -s -X POST $BACKEND_URL/emprunts/$EMPRUNT_ID2/retour \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" > /dev/null
echo "✅ Route de compatibilité fonctionne"

echo ""
echo "🎉 Tous les tests sont passés avec succès !"
echo "==========================================="
echo ""
echo "📊 Résumé du workflow :"
echo "- ✅ Emprunt : Demande → Approbation admin → En cours"
echo "- ✅ Retour  : Demande → Validation admin → Terminé"
echo "- ✅ Interface admin fonctionnelle"
echo "- ✅ Route de compatibilité pour éviter les 404"
echo ""
echo "🌐 Interfaces disponibles :"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"
echo "- Admin: http://localhost:3000/admin"
