-- Migration pour ajouter le statut 'en_attente' aux emprunts
-- Date: 2025-07-04

-- Modifier la colonne statut pour inclure 'en_attente'
ALTER TABLE emprunts MODIFY COLUMN statut ENUM('en_attente', 'en_cours', 'retourne', 'en_retard') DEFAULT 'en_attente';

-- Mettre à jour les emprunts existants qui sont 'en_cours' pour rester 'en_cours'
UPDATE emprunts SET statut = 'en_cours' WHERE statut = 'en_cours';
