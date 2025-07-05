import express, { Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Récupérer toutes les catégories
router.get('/', async (req: Request, res: Response) => {
  try {
    const [categories] = await pool.execute(`
      SELECT c.*, COUNT(l.id) as nombre_livres
      FROM categories c
      LEFT JOIN livres l ON c.id = l.categorie_id
      GROUP BY c.id
      ORDER BY c.nom
    `);

    res.json(categories);

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter une nouvelle catégorie (Admin seulement)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { nom, description } = req.body;

    if (!nom || nom.trim().length === 0) {
      return res.status(400).json({ message: 'Le nom de la catégorie est requis' });
    }

    // Vérifier si la catégorie existe déjà
    const [existingCategories] = await pool.execute(
      'SELECT id FROM categories WHERE nom = ?',
      [nom.trim()]
    );

    if ((existingCategories as any[]).length > 0) {
      return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' });
    }

    const [result] = await pool.execute(
      'INSERT INTO categories (nom, description) VALUES (?, ?)',
      [nom.trim(), description || null]
    );

    const categorieId = (result as any).insertId;

    res.status(201).json({
      message: 'Catégorie créée avec succès',
      categorie: {
        id: categorieId,
        nom: nom.trim(),
        description,
        nombre_livres: 0
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier une catégorie (Admin seulement)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, description } = req.body;

    if (!nom || nom.trim().length === 0) {
      return res.status(400).json({ message: 'Le nom de la catégorie est requis' });
    }

    // Vérifier si la catégorie existe
    const [existingCategories] = await pool.execute(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    );

    if ((existingCategories as any[]).length === 0) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    // Vérifier si le nouveau nom n'est pas déjà utilisé par une autre catégorie
    const [duplicateCategories] = await pool.execute(
      'SELECT id FROM categories WHERE nom = ? AND id != ?',
      [nom.trim(), id]
    );

    if ((duplicateCategories as any[]).length > 0) {
      return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' });
    }

    await pool.execute(
      'UPDATE categories SET nom = ?, description = ? WHERE id = ?',
      [nom.trim(), description || null, id]
    );

    res.json({ message: 'Catégorie modifiée avec succès' });

  } catch (error) {
    console.error('Erreur lors de la modification de la catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer une catégorie (Admin seulement)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier s'il y a des livres dans cette catégorie
    const [livresInCategory] = await pool.execute(
      'SELECT COUNT(*) as count FROM livres WHERE categorie_id = ?',
      [id]
    );

    if ((livresInCategory as any[])[0].count > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer cette catégorie car elle contient des livres' 
      });
    }

    const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.json({ message: 'Catégorie supprimée avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
