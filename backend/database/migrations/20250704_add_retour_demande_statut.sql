-- Migration pour ajouter le statut 'retour_demande' aux emprunts
-- Date: 2025-07-04

-- Modifier la colonne statut pour inclure 'retour_demande'
ALTER TABLE emprunts MODIFY COLUMN statut ENUM('en_attente', 'en_cours', 'retour_demande', 'retourne', 'en_retard') DEFAULT 'en_attente';
