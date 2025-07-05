import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { Livre } from '../types/index';

const router = express.Router();

// Récupérer tous les livres avec filtres
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, categorie, auteur, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT l.*, c.nom as categorie_nom 
      FROM livres l 
      LEFT JOIN categories c ON l.categorie_id = c.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (l.titre LIKE ? OR l.auteur LIKE ? OR l.description LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (categorie) {
      query += ` AND l.categorie_id = ?`;
      params.push(categorie);
    }

    if (auteur) {
      query += ` AND l.auteur LIKE ?`;
      params.push(`%${auteur}%`);
    }

    query += ` ORDER BY l.created_at DESC`;

    // Exécuter la requête principale
    const [allLivres] = await pool.execute(query, params) as any[];
    
    // Appliquer la pagination en JavaScript
    const limitNum = parseInt(limit as string) || 10;
    const offsetNum = (parseInt(page as string) - 1) * limitNum || 0;
    const livres = allLivres.slice(offsetNum, offsetNum + limitNum);

    // Utiliser le nombre total d'éléments récupérés pour la pagination
    const total = allLivres.length;

    res.json({
      livres,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer un livre par ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [livres] = await pool.execute(`
      SELECT l.*, c.nom as categorie_nom 
      FROM livres l 
      LEFT JOIN categories c ON l.categorie_id = c.id 
      WHERE l.id = ?
    `, [id]);

    const livreList = livres as Livre[];
    if (livreList.length === 0) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Récupérer les évaluations du livre
    const [evaluations] = await pool.execute(`
      SELECT e.*, u.nom, u.prenom 
      FROM evaluations e 
      JOIN users u ON e.user_id = u.id 
      WHERE e.livre_id = ? 
      ORDER BY e.created_at DESC
    `, [id]);

    res.json({
      livre: livreList[0],
      evaluations
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un nouveau livre (Admin seulement)
router.post('/', authenticateToken, requireAdmin, [
  body('titre').trim().isLength({ min: 1 }).withMessage('Le titre est requis'),
  body('auteur').trim().isLength({ min: 1 }).withMessage('L\'auteur est requis'),
  body('nombre_exemplaires').isInt({ min: 1 }).withMessage('Le nombre d\'exemplaires doit être au moins 1')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      titre,
      auteur,
      ISBN,
      categorie_id,
      description,
      nombre_exemplaires,
      image_url,
      date_publication,
      editeur
    } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO livres (
        titre, auteur, ISBN, categorie_id, description, 
        nombre_exemplaires, exemplaires_disponibles, 
        image_url, date_publication, editeur
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      titre, auteur, ISBN || null, categorie_id || null, description || null,
      nombre_exemplaires, nombre_exemplaires,
      image_url || null, date_publication || null, editeur || null
    ]);

    const livreId = (result as any).insertId;

    res.status(201).json({
      message: 'Livre ajouté avec succès',
      livre: {
        id: livreId,
        titre,
        auteur,
        ISBN,
        categorie_id,
        description,
        nombre_exemplaires,
        exemplaires_disponibles: nombre_exemplaires,
        image_url,
        date_publication,
        editeur
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un livre (Admin seulement)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      titre,
      auteur,
      ISBN,
      categorie_id,
      description,
      nombre_exemplaires,
      image_url,
      date_publication,
      editeur
    } = req.body;

    // Vérifier si le livre existe
    const [existingLivres] = await pool.execute('SELECT * FROM livres WHERE id = ?', [id]);
    if ((existingLivres as any[]).length === 0) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    const livre = (existingLivres as Livre[])[0];
    const difference = nombre_exemplaires - livre.nombre_exemplaires;
    const nouveaux_disponibles = Math.max(0, livre.exemplaires_disponibles + difference);

    await pool.execute(`
      UPDATE livres SET 
        titre = ?, auteur = ?, ISBN = ?, categorie_id = ?, 
        description = ?, nombre_exemplaires = ?, exemplaires_disponibles = ?,
        image_url = ?, date_publication = ?, editeur = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      titre, auteur, ISBN || null, categorie_id || null,
      description || null, nombre_exemplaires, nouveaux_disponibles,
      image_url || null, date_publication || null, editeur || null, id
    ]);

    res.json({ message: 'Livre modifié avec succès' });

  } catch (error) {
    console.error('Erreur lors de la modification du livre:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un livre (Admin seulement)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier s'il y a des emprunts en cours
    const [empruntsEnCours] = await pool.execute(
      'SELECT COUNT(*) as count FROM emprunts WHERE livre_id = ? AND statut = "en_cours"',
      [id]
    );

    if ((empruntsEnCours as any[])[0].count > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer ce livre car il y a des emprunts en cours' 
      });
    }

    await pool.execute('DELETE FROM livres WHERE id = ?', [id]);

    res.json({ message: 'Livre supprimé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
