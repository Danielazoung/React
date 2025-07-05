export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  numero_etudiant?: string;
  role: 'etudiant' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Livre {
  id: number;
  titre: string;
  auteur: string;
  ISBN?: string;
  categorie_id?: number;
  description?: string;
  nombre_exemplaires: number;
  exemplaires_disponibles: number;
  image_url?: string;
  date_publication?: string;
  editeur?: string;
  note_moyenne?: number;
  nombre_notes?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Categorie {
  id: number;
  nom: string;
  description?: string;
  created_at?: string;
}

export interface Emprunt {
  id: number;
  user_id: number;
  livre_id: number;
  date_emprunt: string;
  date_retour_prevue: string;
  date_retour_effective?: string;
  statut: 'en_attente' | 'en_cours' | 'retour_demande' | 'retourne' | 'en_retard';
  created_at?: string;
  updated_at?: string;
  livre?: Livre;
  user?: User;
}
