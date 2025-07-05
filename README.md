#  Plateforme de Gestion de Bibliothèque 2IE

**Projet étudiant 2IE/2025** - Application web pour la gestion d'une bibliothèque universitaire

[![Docker](https://img.shields.io/badge/Docker-Containerized-blue)](https://docker.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://mysql.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://typescriptlang.org)

##  Vue d'ensemble

Plateforme web moderne permettant aux étudiants de gérer leurs emprunts de livres avec une interface intuitive et un système d'administration complet.

###  Fonctionnalités principales

-  **Authentification sécurisée** avec JWT
-  **Catalogue de livres** avec recherche avancée
-  **Système d'emprunt** et de retour
-  **Gestion des utilisateurs** (étudiants/admin)
-  **Dashboard administrateur** avec statistiques
-  **Système de notation** et commentaires
-  **Interface responsive** mobile-first

##  Démarrage rapide

### Pour le professeur
```bash
# Démarrage automatique avec le script de démonstration
./demo_professeur.sh
```

### Démarrage manuel
```bash
# Cloner le repository
git clone [URL_REPO]
cd danie

# Démarrer avec Docker
docker-compose up -d --build

# Accéder à l'application
open http://localhost:3000
```

## 👤 Comptes de test

### Administrateur
- **Email :** `admin@bibliotheque.com`
- **Password :** `admin123`

### Étudiant
- **Email :** `etudiant@2ie.edu`
- **Password :** `student123`

## Technologies

### Backend
- Node.js + Express.js
- MySQL (base de données)
- JWT (authentification)
- bcryptjs (hachage des mots de passe)
- TypeScript

### Frontend
- Next.js 15 + React 19
- TypeScript
- Tailwind CSS
- Axios (client HTTP)
- React Query (gestion d'état)

## Installation et Configuration

### Prérequis
- Node.js (v18 ou plus récent)
- MySQL
- npm ou yarn

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd danie
```

### 2. Configuration du Backend

```bash
cd backend
npm install
```

Créer/modifier le fichier `.env` :
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=bibliotheque
JWT_SECRET=votre_secret_jwt_tres_securise
```

### 3. Configuration de la Base de Données

```bash
# Initialiser la base de données
npm run init-db

# Ajouter les catégories par défaut
npm run add-categories

# Ajouter des livres d'exemple
npm run add-books
```

### 4. Configuration du Frontend

```bash
cd ../frontend
npm install
```

Le fichier `.env.local` est déjà configuré pour pointer vers `http://localhost:3001/api`.

### 5. Lancer l'application

#### Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Le serveur backend sera disponible sur http://localhost:3001

#### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
L'application frontend sera disponible sur http://localhost:3000

## Comptes par défaut

### Administrateur
- **Email:** admin@bibliotheque.com
- **Mot de passe:** admin123

## Structure du Projet

```
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration base de données
│   │   ├── middleware/      # Middleware d'authentification
│   │   ├── routes/          # Routes API
│   │   ├── scripts/         # Scripts d'initialisation
│   │   ├── types/           # Types TypeScript
│   │   └── index.ts         # Point d'entrée
│   ├── database/
│   │   ├── schema.sql       # Schéma de la base de données
│   │   └── migrations/      # Migrations
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/             # Pages Next.js (App Router)
    │   ├── components/      # Composants réutilisables
    │   ├── contexts/        # Contextes React
    │   ├── lib/             # Utilitaires et configuration
    │   └── types/           # Types TypeScript
    └── package.json
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Livres
- `GET /api/livres` - Liste des livres (avec filtres)
- `GET /api/livres/:id` - Détails d'un livre

### Emprunts
- `GET /api/emprunts/mes-emprunts` - Emprunts de l'utilisateur
- `POST /api/emprunts/emprunter` - Demander un emprunt
- `POST /api/emprunts/retourner` - Retourner un livre

### Administration
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/stats` - Statistiques
- `GET /api/emprunts/admin/en-attente` - Emprunts en attente
- `POST /api/emprunts/admin/approuver/:id` - Approuver un emprunt
- `POST /api/emprunts/admin/rejeter/:id` - Rejeter un emprunt

## Scripts Disponibles

### Backend
- `npm run dev` - Lancer en mode développement
- `npm run build` - Compiler TypeScript
- `npm run start` - Lancer en production
- `npm run init-db` - Initialiser la base de données
- `npm run add-categories` - Ajouter les catégories
- `npm run add-books` - Ajouter des livres d'exemple

### Frontend
- `npm run dev` - Lancer en mode développement
- `npm run build` - Build de production
- `npm run start` - Lancer en production
- `npm run lint` - Vérification ESLint

## Troubleshooting

### Erreur de connexion à la base de données
1. Vérifiez que MySQL est démarré
2. Vérifiez les paramètres dans le fichier `.env`
3. Assurez-vous que la base de données `bibliotheque` existe

### Erreur CORS
Les origines autorisées sont configurées dans `backend/src/index.ts`. Ajoutez votre domaine si nécessaire.

### Erreurs de compilation TypeScript
Exécutez `npm run build` pour identifier les erreurs de types.

## Améliorations Futures
- Système de notifications en temps réel
- Upload d'images pour les livres
- Génération de rapports
- API de recherche avancée
- Interface mobile responsive améliorée
