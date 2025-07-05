export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  numero_etudiant?: string;
  role: 'etudiant' | 'admin';
  created_at?: Date;
  updated_at?: Date;
}

export interface Livre {
  id?: number;
  titre: string;
  auteur: string;
  ISBN?: string;
  categorie_id?: number;
  categorie_nom?: string;
  description?: string;
  nombre_exemplaires: number;
  exemplaires_disponibles: number;
  image_url?: string;
  date_publication?: Date;
  editeur?: string;
  note_moyenne?: number;
  nombre_notes?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Emprunt {
  id?: number;
  user_id: number;
  livre_id: number;
  date_emprunt: Date;
  date_retour_prevue: Date;
  date_retour_effective?: Date;
  statut: 'en_attente' | 'en_cours' | 'retour_demande' | 'retourne' | 'en_retard';
  created_at?: Date;
  updated_at?: Date;
  // Jointures
  livre_titre?: string;
  livre_auteur?: string;
  user_nom?: string;
  user_prenom?: string;
}

export interface Reservation {
  id?: number;
  user_id: number;
  livre_id: number;
  date_reservation: Date;
  statut: 'active' | 'confirmee' | 'annulee';
  created_at?: Date;
  // Jointures
  livre_titre?: string;
  livre_auteur?: string;
}

export interface Evaluation {
  id?: number;
  user_id: number;
  livre_id: number;
  note: number;
  commentaire?: string;
  created_at?: Date;
  updated_at?: Date;
  // Jointures
  user_nom?: string;
  user_prenom?: string;
}

export interface Categorie {
  id?: number;
  nom: string;
  description?: string;
  created_at?: Date;
}

export interface Notification {
  id?: number;
  user_id: number;
  type: 'retard' | 'rappel' | 'reservation' | 'nouveau_livre';
  message: string;
  lu: boolean;
  email_envoye: boolean;
  created_at?: Date;
}
