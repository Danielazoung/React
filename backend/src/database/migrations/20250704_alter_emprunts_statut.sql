-- Migration pour ajouter le statut 'en_attente' aux emprunts
ALTER TABLE emprunts MODIFY statut ENUM('en_attente', 'en_cours', 'retourne', 'en_retard') DEFAULT 'en_attente';