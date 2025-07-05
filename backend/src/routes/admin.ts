import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { User } from '../types/index';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Toutes les routes nécessitent une authentification admin
router.use(authenticateToken);
router.use(requireAdmin);

// Obtenir tous les utilisateurs
router.get('/users', async (req: Request, res: Response) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, nom, prenom, email, numero_etudiant, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un nouvel utilisateur
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { nom, prenom, email, password, numero_etudiant, role = 'etudiant' } = req.body;
    
    // Validation des champs requis
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({ message: 'Nom, prénom, email et mot de passe sont requis' });
    }
    
    // Vérifier si l'email existe déjà
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if ((existingUsers as any[]).length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insérer le nouvel utilisateur
    const [result] = await pool.execute(
      'INSERT INTO users (nom, prenom, email, password, numero_etudiant, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, numero_etudiant || null, role]
    );
    
    const userId = (result as any).insertId;
    
    // Récupérer l'utilisateur créé
    const [newUsers] = await pool.execute(
      'SELECT id, nom, prenom, email, numero_etudiant, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    
    res.status(201).json((newUsers as User[])[0]);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir un utilisateur par ID
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [users] = await pool.execute(
      'SELECT id, nom, prenom, email, numero_etudiant, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    const userList = users as User[];
    if (userList.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json(userList[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour un utilisateur (PUT - remplacement complet)
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, password, numero_etudiant, role } = req.body;
    
    // Validation des champs requis
    if (!nom || !prenom || !email || !role) {
      return res.status(400).json({ message: 'Nom, prénom, email et rôle sont requis' });
    }
    
    // Vérifier que l'utilisateur existe
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if ((existingUsers as any[]).length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'email existe déjà (pour un autre utilisateur)
    const [emailCheck] = await pool.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if ((emailCheck as any[]).length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur' });
    }
    
    let updateQuery = 'UPDATE users SET nom = ?, prenom = ?, email = ?, numero_etudiant = ?, role = ?, updated_at = CURRENT_TIMESTAMP';
    let values = [nom, prenom, email, numero_etudiant || null, role];
    
    // Si un mot de passe est fourni, l'inclure dans la mise à jour
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      values.push(hashedPassword);
    }
    
    updateQuery += ' WHERE id = ?';
    values.push(id);
    
    await pool.execute(updateQuery, values);
    
    // Récupérer l'utilisateur mis à jour
    const [updatedUsers] = await pool.execute(
      'SELECT id, nom, prenom, email, numero_etudiant, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    res.json((updatedUsers as User[])[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour un utilisateur (PATCH - mise à jour partielle)
router.patch('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, numero_etudiant, role } = req.body;
    
    // Vérifier que l'utilisateur existe
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if ((existingUsers as any[]).length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Construire la requête de mise à jour dynamiquement
    const fieldsToUpdate = [];
    const values = [];
    
    if (nom !== undefined) {
      fieldsToUpdate.push('nom = ?');
      values.push(nom);
    }
    if (prenom !== undefined) {
      fieldsToUpdate.push('prenom = ?');
      values.push(prenom);
    }
    if (email !== undefined) {
      fieldsToUpdate.push('email = ?');
      values.push(email);
    }
    if (numero_etudiant !== undefined) {
      fieldsToUpdate.push('numero_etudiant = ?');
      values.push(numero_etudiant);
    }
    if (role !== undefined) {
      fieldsToUpdate.push('role = ?');
      values.push(role);
    }
    
    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
    }
    
    values.push(id);
    
    await pool.execute(
      `UPDATE users SET ${fieldsToUpdate.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    // Récupérer l'utilisateur mis à jour
    const [updatedUsers] = await pool.execute(
      'SELECT id, nom, prenom, email, numero_etudiant, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: (updatedUsers as User[])[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un utilisateur
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'utilisateur existe
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if ((existingUsers as any[]).length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Supprimer l'utilisateur (les emprunts seront supprimés en cascade)
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir les statistiques
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { period = 'mois' } = req.query;
    
    // Total des livres
    const [totalLivresResult] = await pool.execute('SELECT COUNT(*) as total FROM livres');
    const totalLivres = (totalLivresResult as any[])[0].total;
    
    // Total des utilisateurs
    const [totalUsersResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const totalUtilisateurs = (totalUsersResult as any[])[0].total;
    
    // Emprunts en cours
    const [empruntsEnCoursResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM emprunts WHERE statut = "en_cours"'
    );
    const empruntsEnCours = (empruntsEnCoursResult as any[])[0].total;
    
    // Retours ce mois
    const [retoursCeMoisResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM emprunts WHERE date_retour_effective IS NOT NULL AND MONTH(date_retour_effective) = MONTH(CURRENT_DATE) AND YEAR(date_retour_effective) = YEAR(CURRENT_DATE)'
    );
    const retoursCeMois = (retoursCeMoisResult as any[])[0].total;
    
    // Utilisateurs actifs (qui ont emprunté dans les 30 derniers jours)
    const [utilisateursActifsResult] = await pool.execute(
      'SELECT COUNT(DISTINCT user_id) as total FROM emprunts WHERE date_emprunt >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)'
    );
    const utilisateursActifs = (utilisateursActifsResult as any[])[0].total;
    
    // Retards en cours
    const [retardsResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM emprunts WHERE statut = "en_cours" AND date_retour_prevue < CURRENT_DATE'
    );
    const retardsEnCours = (retardsResult as any[])[0].total;
    
    // Livres populaires
    const [livresPopulaires] = await pool.execute(`
      SELECT l.id, l.titre, l.auteur, COUNT(e.id) as nombreEmprunts
      FROM livres l
      LEFT JOIN emprunts e ON l.id = e.livre_id
      GROUP BY l.id, l.titre, l.auteur
      ORDER BY nombreEmprunts DESC
      LIMIT 5
    `);
    
    // Emprunts par mois (6 derniers mois)
    const [empruntsParMois] = await pool.execute(`
      SELECT 
        DATE_FORMAT(date_emprunt, '%b') as mois,
        COUNT(*) as nombre
      FROM emprunts 
      WHERE date_emprunt >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
      GROUP BY YEAR(date_emprunt), MONTH(date_emprunt), DATE_FORMAT(date_emprunt, '%b')
      ORDER BY YEAR(date_emprunt), MONTH(date_emprunt)
    `);
    
    res.json({
      totalLivres,
      totalUtilisateurs,
      empruntsEnCours,
      retoursCeMois,
      utilisateursActifs,
      retardsEnCours,
      livresPopulaires,
      empruntsParMois
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
