import express, { Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { Emprunt } from '../types/index';

const router = express.Router();

// Récupérer les emprunts de l'utilisateur connecté
router.get('/mes-emprunts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [emprunts] = await pool.execute(`
      SELECT e.*, l.titre as livre_titre, l.auteur as livre_auteur, l.image_url
      FROM emprunts e
      JOIN livres l ON e.livre_id = l.id
      WHERE e.user_id = ?
      ORDER BY e.created_at DESC
    `, [userId]);

    res.json(emprunts);

  } catch (error) {
    console.error('Erreur lors de la récupération des emprunts:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Emprunter un livre
router.post('/emprunter', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { livre_id } = req.body;
    const userId = req.user!.id;

    // Vérifier si le livre existe et est disponible
    const [livres] = await pool.execute(
      'SELECT * FROM livres WHERE id = ? AND exemplaires_disponibles > 0',
      [livre_id]
    );

    if ((livres as any[]).length === 0) {
      return res.status(400).json({ message: 'Livre non disponible' });
    }

    // Vérifier si l'utilisateur n'a pas déjà emprunté ce livre
    const [empruntsExistants] = await pool.execute(
      'SELECT * FROM emprunts WHERE user_id = ? AND livre_id = ? AND statut = "en_cours"',
      [userId, livre_id]
    );

    if ((empruntsExistants as any[]).length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà emprunté ce livre' });
    }

    // Vérifier le nombre d'emprunts en cours de l'utilisateur (limite à 5)
    const [empruntsEnCours] = await pool.execute(
      'SELECT COUNT(*) as count FROM emprunts WHERE user_id = ? AND statut = "en_cours"',
      [userId]
    );

    if ((empruntsEnCours as any[])[0].count >= 5) {
      return res.status(400).json({ message: 'Vous avez atteint la limite de 5 emprunts simultanés' });
    }

    const dateEmprunt = new Date();
    const dateRetourPrevue = new Date();
    dateRetourPrevue.setDate(dateEmprunt.getDate() + 14); // 2 semaines

    // Démarrer une transaction
    await pool.execute('START TRANSACTION');

    try {
      // Créer l'emprunt
      await pool.execute(`
        INSERT INTO emprunts (user_id, livre_id, date_emprunt, date_retour_prevue, statut)
        VALUES (?, ?, ?, ?, 'en_cours')
      `, [userId, livre_id, dateEmprunt, dateRetourPrevue]);

      // Décrémenter le nombre d'exemplaires disponibles
      await pool.execute(
        'UPDATE livres SET exemplaires_disponibles = exemplaires_disponibles - 1 WHERE id = ?',
        [livre_id]
      );

      // Supprimer la réservation si elle existe
      await pool.execute(
        'DELETE FROM reservations WHERE user_id = ? AND livre_id = ?',
        [userId, livre_id]
      );

      await pool.execute('COMMIT');

      res.status(201).json({
        message: 'Livre emprunté avec succès',
        date_retour_prevue: dateRetourPrevue
      });

    } catch (error) {
      await pool.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erreur lors de l\'emprunt:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Emprunter un livre (route alternative)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { livre_id } = req.body;
    const userId = req.user!.id;

    // Vérifier si le livre existe et est disponible
    const [livres] = await pool.execute(
      'SELECT * FROM livres WHERE id = ? AND exemplaires_disponibles > 0',
      [livre_id]
    );

    if ((livres as any[]).length === 0) {
      return res.status(400).json({ message: 'Livre non disponible' });
    }

    // Vérifier si l'utilisateur n'a pas déjà emprunté ce livre
    const [empruntsExistants] = await pool.execute(
      'SELECT * FROM emprunts WHERE user_id = ? AND livre_id = ? AND statut = "en_cours"',
      [userId, livre_id]
    );

    if ((empruntsExistants as any[]).length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà emprunté ce livre' });
    }

    // Vérifier le nombre d'emprunts en cours de l'utilisateur (limite à 5)
    const [empruntsEnCours] = await pool.execute(
      'SELECT COUNT(*) as count FROM emprunts WHERE user_id = ? AND statut = "en_cours"',
      [userId]
    );

    if ((empruntsEnCours as any[])[0].count >= 5) {
      return res.status(400).json({ message: 'Vous avez atteint la limite de 5 emprunts simultanés' });
    }

    const dateEmprunt = new Date();
    const dateRetourPrevue = new Date();
    dateRetourPrevue.setDate(dateEmprunt.getDate() + 14); // 2 semaines

    // Démarrer une transaction
    await pool.execute('START TRANSACTION');

    try {
      // Créer l'emprunt
      await pool.execute(`
        INSERT INTO emprunts (user_id, livre_id, date_emprunt, date_retour_prevue, statut)
        VALUES (?, ?, ?, ?, 'en_cours')
      `, [userId, livre_id, dateEmprunt, dateRetourPrevue]);

      // Décrémenter le nombre d'exemplaires disponibles
      await pool.execute(
        'UPDATE livres SET exemplaires_disponibles = exemplaires_disponibles - 1 WHERE id = ?',
        [livre_id]
      );

      // Supprimer la réservation si elle existe
      await pool.execute(
        'DELETE FROM reservations WHERE user_id = ? AND livre_id = ?',
        [userId, livre_id]
      );

      await pool.execute('COMMIT');

      res.status(201).json({
        message: 'Livre emprunté avec succès',
        date_retour_prevue: dateRetourPrevue
      });

    } catch (error) {
      await pool.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erreur lors de l\'emprunt:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Retourner un livre
router.post('/retourner', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { emprunt_id } = req.body;
    const userId = req.user!.id;

    // Vérifier que l'emprunt appartient à l'utilisateur
    const [emprunts] = await pool.execute(`
      SELECT e.*, l.titre FROM emprunts e
      JOIN livres l ON e.livre_id = l.id
      WHERE e.id = ? AND e.user_id = ? AND e.statut = 'en_cours'
    `, [emprunt_id, userId]);

    if ((emprunts as any[]).length === 0) {
      return res.status(404).json({ message: 'Emprunt non trouvé ou déjà retourné' });
    }

    const emprunt = (emprunts as Emprunt[])[0];
    const dateRetour = new Date();

    // Démarrer une transaction
    await pool.execute('START TRANSACTION');

    try {
      // Mettre à jour l'emprunt
      await pool.execute(`
        UPDATE emprunts SET 
          date_retour_effective = ?, 
          statut = 'retourne',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [dateRetour, emprunt_id]);

      // Incrémenter le nombre d'exemplaires disponibles
      await pool.execute(
        'UPDATE livres SET exemplaires_disponibles = exemplaires_disponibles + 1 WHERE id = ?',
        [emprunt.livre_id]
      );

      await pool.execute('COMMIT');

      res.json({ message: 'Livre retourné avec succès' });

    } catch (error) {
      await pool.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erreur lors du retour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer tous les emprunts (Admin seulement)
router.get('/admin/tous', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { statut, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT e.*, 
        l.titre as livre_titre, l.auteur as livre_auteur,
        u.nom as user_nom, u.prenom as user_prenom, u.email as user_email
      FROM emprunts e
      JOIN livres l ON e.livre_id = l.id
      JOIN users u ON e.user_id = u.id
    `;
    const params: any[] = [];

    if (statut) {
      query += ` WHERE e.statut = ?`;
      params.push(statut);
    }

    query += ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const [emprunts] = await pool.execute(query, params);

    res.json(emprunts);

  } catch (error) {
    console.error('Erreur lors de la récupération des emprunts:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Marquer un emprunt en retard (Admin seulement)
router.post('/admin/marquer-retard/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE emprunts SET statut = "en_retard" WHERE id = ? AND statut = "en_cours"',
      [id]
    );

    res.json({ message: 'Emprunt marqué en retard' });

  } catch (error) {
    console.error('Erreur lors du marquage en retard:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
