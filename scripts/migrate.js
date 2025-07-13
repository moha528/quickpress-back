const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration de la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME || 'news_chronicle',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

async function migrate() {
  try {
    console.log('🔄 Début de la migration...');
    
    // Test de connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie.');
    
    // Synchronisation des modèles
    await sequelize.sync({ force: false });
    console.log('✅ Modèles synchronisés avec la base de données.');
    
    console.log('🎉 Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate(); 