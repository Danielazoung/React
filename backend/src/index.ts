import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import des routes
import authRoutes from './routes/auth';
import livresRoutes from './routes/livres';
import empruntsRoutes from './routes/emprunts';
import categoriesRoutes from './routes/categories';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/livres', livresRoutes);
app.use('/api/emprunts', empruntsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/admin', adminRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Plateforme de Gestion de Bibliothèque - 2IE/2025',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      livres: '/api/livres',
      emprunts: '/api/emprunts',
      categories: '/api/categories',
      admin: '/api/admin'
    }
  });
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de gestion d'erreurs
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur interne est survenue' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📚 API Plateforme de Gestion de Bibliothèque`);
  console.log(`📖 Documentation: http://localhost:${PORT}`);
});
