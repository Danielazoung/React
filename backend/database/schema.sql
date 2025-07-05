-- Création de la base de données
CREATE DATABASE IF NOT EXISTS bibliotheque;
USE bibliotheque;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  numero_etudiant VARCHAR(50) NULL,
  role ENUM('etudiant', 'admin') DEFAULT 'etudiant',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des livres
CREATE TABLE IF NOT EXISTS livres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  auteur VARCHAR(255) NOT NULL,
  ISBN VARCHAR(20) UNIQUE,
  categorie_id INT,
  description TEXT,
  nombre_exemplaires INT DEFAULT 1,
  exemplaires_disponibles INT DEFAULT 1,
  image_url VARCHAR(500),
  date_publication DATE,
  editeur VARCHAR(255),
  note_moyenne DECIMAL(3,2) DEFAULT 0.00,
  nombre_notes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Table des emprunts
CREATE TABLE IF NOT EXISTS emprunts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  livre_id INT NOT NULL,
  date_emprunt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_retour_prevue DATE NOT NULL,
  date_retour_effective DATE NULL,
  statut ENUM('en_attente', 'en_cours', 'retour_demande', 'retourne', 'en_retard') DEFAULT 'en_attente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  livre_id INT NOT NULL,
  date_reservation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  statut ENUM('active', 'confirmee', 'annulee', 'expiree') DEFAULT 'active',
  date_expiration TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE
);

-- Table des évaluations
CREATE TABLE IF NOT EXISTS evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  livre_id INT NOT NULL,
  note INT CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_livre (user_id, livre_id)
);

-- Insertion des données de test
-- Insertion des catégories par défaut
INSERT IGNORE INTO categories (nom, description) VALUES
('Fiction', 'Romans et histoires imaginaires'),
('Science', 'Livres scientifiques et techniques'),
('Histoire', 'Livres d\'histoire et biographies'),
('Art', 'Livres sur l\'art et la culture'),
('Informatique', 'Livres de programmation et technologies'),
('Philosophie', 'Ouvrages philosophiques et réflexions'),
('Littérature', 'Classiques et œuvres littéraires');

-- Insertion de l'utilisateur admin par défaut
INSERT IGNORE INTO users (nom, prenom, email, password, role) VALUES
('Admin', 'Bibliothèque', 'admin@bibliotheque.com', '$2a$10$0X3NU5rMFIc7j7R2pEsuUOAmCdTLUfpkSFo04VQVTVPcqFVAvF0eq', 'admin');
-- Le mot de passe haché correspond à 'admin123'

-- Insertion de livres d'exemple
INSERT IGNORE INTO livres (titre, auteur, ISBN, categorie_id, description, nombre_exemplaires, exemplaires_disponibles) VALUES
('Le Petit Prince', 'Antoine de Saint-Exupéry', '978-2-07-040837-6', 1, 'Un conte poétique et philosophique', 3, 3),
('1984', 'George Orwell', '978-0-452-28423-4', 1, 'Un roman dystopique', 2, 2),
('Clean Code', 'Robert C. Martin', '978-0-13-235088-4', 5, 'Un guide pour écrire du code propre', 2, 2),
('Sapiens', 'Yuval Noah Harari', '978-0-06-231609-7', 3, 'Une brève histoire de l\'humanité', 2, 2);

-- Index pour améliorer les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_emprunts_user_id ON emprunts(user_id);
CREATE INDEX idx_emprunts_livre_id ON emprunts(livre_id);
CREATE INDEX idx_emprunts_statut ON emprunts(statut);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_livre_id ON reservations(livre_id);
CREATE INDEX idx_livres_categorie ON livres(categorie_id);
CREATE INDEX idx_livres_titre ON livres(titre);
