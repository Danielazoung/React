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

    // Vérifier si l'utilisateur n'a pas déjà emprunté ce livre ou n'a pas une demande en attente
    const [empruntsExistants] = await pool.execute(
      'SELECT * FROM emprunts WHERE user_id = ? AND livre_id = ? AND statut IN ("en_cours", "en_attente")',
      [userId, livre_id]
    );

    if ((empruntsExistants as any[]).length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà emprunté ce livre ou avez une demande en attente' });
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
    await pool.query('START TRANSACTION');

    try {
      // Créer l'emprunt en attente
      await pool.execute(`
        INSERT INTO emprunts (user_id, livre_id, date_emprunt, date_retour_prevue, statut)
        VALUES (?, ?, ?, ?, 'en_attente')
      `, [userId, livre_id, dateEmprunt, dateRetourPrevue]);

      // NE PAS décrémenter les exemplaires pour un emprunt en attente
      // Cela sera fait lors de l'approbation par l'admin

      // Supprimer la réservation si elle existe
      await pool.execute(
        'DELETE FROM reservations WHERE user_id = ? AND livre_id = ?',
        [userId, livre_id]
      );

      await pool.query('COMMIT');

      res.status(201).json({
        message: 'Demande d\'emprunt soumise avec succès, en attente d\'approbation',
        date_retour_prevue: dateRetourPrevue,
        statut: 'en_attente'
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erreur lors de l\'emprunt:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Demander un retour de livre (marquer comme retour_demande)
router.post('/demander-retour', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { emprunt_id } = req.body;
    const userId = req.user!.id;

    // Vérifier que l'emprunt appartient à l'utilisateur et est en cours
    const [emprunts] = await pool.execute(`
      SELECT e.*, l.titre FROM emprunts e
      JOIN livres l ON e.livre_id = l.id
      WHERE e.id = ? AND e.user_id = ? AND e.statut = 'en_cours'
    `, [emprunt_id, userId]);

    if ((emprunts as any[]).length === 0) {
      return res.status(404).json({ message: 'Emprunt non trouvé ou non en cours' });
    }

    // Marquer comme demande de retour
    await pool.execute(`
      UPDATE emprunts SET 
        statut = 'retour_demande',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [emprunt_id]);

    res.json({ message: 'Demande de retour soumise avec succès. En attente de validation par l\'administrateur.' });

  } catch (error) {
    console.error('Erreur lors de la demande de retour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Retourner un livre (fonction existante pour l'admin)
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
    await pool.query('START TRANSACTION');

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

      await pool.query('COMMIT');

      res.json({ message: 'Livre retourné avec succès' });

    } catch (error) {
      await pool.query('ROLLBACK');
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

// Récupérer tous les emprunts avec statut en_attente (nouvelle route)
router.get('/admin/en-attente', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [emprunts] = await pool.execute(`
      SELECT e.*, 
        l.titre as livre_titre, l.auteur as livre_auteur,
        u.nom as user_nom, u.prenom as user_prenom, u.email as user_email
      FROM emprunts e
      JOIN livres l ON e.livre_id = l.id
      JOIN users u ON e.user_id = u.id
      WHERE e.statut = 'en_attente'
      ORDER BY e.created_at DESC
    `);

    res.json(emprunts);

  } catch (error) {
    console.error('Erreur lors de la récupération des emprunts en attente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Approuver un emprunt en attente
router.post('/admin/approuver/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier que l'emprunt existe et est en attente
    const [emprunts] = await pool.execute(
      'SELECT e.*, l.exemplaires_disponibles FROM emprunts e JOIN livres l ON e.livre_id = l.id WHERE e.id = ? AND e.statut = "en_attente"',
      [id]
    );

    if ((emprunts as any[]).length === 0) {
      return res.status(404).json({ message: 'Emprunt en attente non trouvé' });
    }

    const emprunt = (emprunts as any[])[0];

    // Vérifier que le livre est toujours disponible
    if (emprunt.exemplaires_disponibles <= 0) {
      return res.status(400).json({ message: 'Le livre n\'est plus disponible' });
    }

    // Démarrer une transaction
    await pool.query('START TRANSACTION');

    try {
      // Approuver l'emprunt et décrémenter les exemplaires
      await pool.execute(
        'UPDATE emprunts SET statut = "en_cours", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      await pool.execute(
        'UPDATE livres SET exemplaires_disponibles = exemplaires_disponibles - 1 WHERE id = ?',
        [emprunt.livre_id]
      );

      await pool.query('COMMIT');

      res.json({ message: 'Emprunt approuvé avec succès' });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erreur lors de l\'approbation de l\'emprunt:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Rejeter un emprunt en attente
router.post('/admin/rejeter/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier que l'emprunt existe et est en attente
    const [emprunts] = await pool.execute(
      'SELECT e.*, l.exemplaires_disponibles FROM emprunts e JOIN livres l ON e.livre_id = l.id WHERE e.id = ? AND e.statut = "en_attente"',
      [id]
    );

    if ((emprunts as any[]).length === 0) {
      return res.status(404).json({ message: 'Emprunt en attente non trouvé' });
    }

    const emprunt = (emprunts as any[])[0];

    // Démarrer une transaction
    await pool.query('START TRANSACTION');

    try {
      // Simplement supprimer l'emprunt en attente
      // Pas besoin de remettre les exemplaires car ils n'avaient pas été décrémentés
      await pool.execute('DELETE FROM emprunts WHERE id = ?', [id]);

      await pool.query('COMMIT');

      res.json({ message: 'Demande d\'emprunt rejetée avec succès' });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erreur lors du rejet de l\'emprunt:', error);
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

// Récupérer les demandes de retour en attente (Admin seulement)
router.get('/admin/retours-en-attente', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [emprunts] = await pool.execute(`
      SELECT e.*, 
        l.titre as livre_titre, l.auteur as livre_auteur,
        u.nom as user_nom, u.prenom as user_prenom, u.email as user_email
      FROM emprunts e
      JOIN livres l ON e.livre_id = l.id
      JOIN users u ON e.user_id = u.id
      WHERE e.statut = 'retour_demande'
      ORDER BY e.updated_at DESC
    `);

    res.json(emprunts);

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de retour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Valider un retour (Admin seulement)
router.post('/admin/valider-retour/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier que l'emprunt existe et est en demande de retour
    const [emprunts] = await pool.execute(
      'SELECT e.*, l.exemplaires_disponibles FROM emprunts e JOIN livres l ON e.livre_id = l.id WHERE e.id = ? AND e.statut = "retour_demande"',
      [id]
    );

    if ((emprunts as any[]).length === 0) {
      return res.status(404).json({ message: 'Demande de retour non trouvée' });
    }

    const emprunt = (emprunts as any[])[0];
    const dateRetour = new Date();

    // Démarrer une transaction
    await pool.query('START TRANSACTION');

    try {
      // Valider le retour
      await pool.execute(`
        UPDATE emprunts SET 
          date_retour_effective = ?, 
          statut = 'retourne',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [dateRetour, id]);

      // Remettre l'exemplaire disponible
      await pool.execute(
        'UPDATE livres SET exemplaires_disponibles = exemplaires_disponibles + 1 WHERE id = ?',
        [emprunt.livre_id]
      );

      await pool.query('COMMIT');

      res.json({ message: 'Retour validé avec succès' });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erreur lors de la validation du retour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Rejeter une demande de retour (Admin seulement)
router.post('/admin/rejeter-retour/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier que l'emprunt existe et est en demande de retour
    const [emprunts] = await pool.execute(
      'SELECT * FROM emprunts WHERE id = ? AND statut = "retour_demande"',
      [id]
    );

    if ((emprunts as any[]).length === 0) {
      return res.status(404).json({ message: 'Demande de retour non trouvée' });
    }

    // Remettre en cours
    await pool.execute(
      'UPDATE emprunts SET statut = "en_cours", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({ message: 'Demande de retour rejetée - emprunt remis en cours' });

  } catch (error) {
    console.error('Erreur lors du rejet de la demande de retour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de compatibilité pour l'ancienne URL de retour (éviter les 404)
router.post('/:id/retour', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Vérifier que l'emprunt appartient à l'utilisateur et est en cours
    const [emprunts] = await pool.execute(`
      SELECT e.*, l.titre FROM emprunts e
      JOIN livres l ON e.livre_id = l.id
      WHERE e.id = ? AND e.user_id = ? AND e.statut = 'en_cours'
    `, [id, userId]);

    if ((emprunts as any[]).length === 0) {
      return res.status(404).json({ message: 'Emprunt non trouvé ou non en cours' });
    }

    // Rediriger vers la nouvelle logique
    await pool.execute(`
      UPDATE emprunts SET 
        statut = 'retour_demande',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    res.json({ message: 'Demande de retour soumise avec succès. En attente de validation par l\'administrateur.' });

  } catch (error) {
    console.error('Erreur lors de la demande de retour (route de compatibilité):', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
