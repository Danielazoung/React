import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'bibliotheque';

async function initDatabase() {
  try {
    console.log('🔧 Initialisation de la base de données...');
    
    // Connexion sans spécifier de base de données
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD
    });

    // Créer la base de données
    console.log('🗄️ Création de la base de données...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    await connection.query(`USE ${DB_NAME}`);

    // Lire le fichier schema.sql et diviser en statements
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Diviser le script en statements individuels
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('CREATE DATABASE') && !stmt.startsWith('USE'));

    // Exécuter chaque statement individuellement
    console.log('📊 Création des tables et insertion des données...');
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (error: any) {
          // Ignorer les erreurs de table/données déjà existantes
          if (!error.message.includes('already exists') && !error.message.includes('Duplicate entry')) {
            throw error;
          }
        }
      }
    }

    console.log('✅ Base de données initialisée avec succès !');
    console.log(`📚 Base de données: ${DB_NAME}`);
    console.log('👤 Compte admin créé:');
    console.log('   Email: admin@bibliotheque.com');
    console.log('   Mot de passe: admin123');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  initDatabase();
}

export default initDatabase;
