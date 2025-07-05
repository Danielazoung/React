#!/bin/bash

# Script d'initialisation de la base de données avec données de base
# Date: 2025-07-04

echo "🚀 Initialisation de la base de données pour Docker..."
echo "====================================================="

# Attendre que MySQL soit prêt
echo "⏳ Attente de MySQL..."
sleep 10

# Variables
DB_HOST=${DB_HOST:-mysql}
DB_USER=${DB_USER:-bibliotheque_user}
DB_PASSWORD=${DB_PASSWORD:-bibliotheque_password}
DB_NAME=${DB_NAME:-bibliotheque}

echo "📊 Insertion des données de base..."

# Insertion de l'administrateur par défaut
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME << EOF
-- Insertion de l'utilisateur admin par défaut
INSERT IGNORE INTO users (nom, prenom, email, password, role) 
VALUES ('Admin', 'Système', 'admin@bibliotheque.com', '\$2b\$10\$YourHashedPasswordHere', 'admin');

-- Insertion des catégories par défaut
INSERT IGNORE INTO categories (nom, description) VALUES
('Informatique', 'Livres sur la programmation et l''informatique'),
('Littérature', 'Romans et œuvres littéraires'),
('Sciences', 'Livres scientifiques et techniques'),
('Histoire', 'Livres d''histoire et de géographie'),
('Art', 'Livres sur l''art et la culture');

-- Insertion de quelques livres par défaut
INSERT IGNORE INTO livres (titre, auteur, ISBN, categorie_id, description, nombre_exemplaires, exemplaires_disponibles) VALUES
('Clean Code', 'Robert C. Martin', '978-0132350884', 1, 'Un guide pour écrire du code propre et maintenable', 3, 3),
('Le Petit Prince', 'Antoine de Saint-Exupéry', '978-2070408504', 2, 'Un conte philosophique et poétique', 2, 2),
('Une brève histoire du temps', 'Stephen Hawking', '978-2290016640', 3, 'Les mystères de l''univers expliqués simplement', 2, 2);

EOF

echo "✅ Données de base insérées avec succès!"
echo "🎉 Base de données prête pour utilisation!"
