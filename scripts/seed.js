require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, Category, Article, syncModels } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Début du seeding de la base de données...');
    
    // Synchroniser les modèles
    await syncModels();
    
    // Créer les catégories
    const categories = await Category.bulkCreate([
      { name: 'Actualités' },
      { name: 'Technologie' },
      { name: 'Sport' },
      { name: 'Culture' },
      { name: 'Économie' }
    ]);
    console.log('✅ Catégories créées:', categories.length);
    
    // Créer les utilisateurs
    const users = await User.bulkCreate([
      {
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN'
      },
      {
        username: 'editeur1',
        password: 'editeur123',
        role: 'EDITEUR'
      },
      {
        username: 'visiteur1',
        password: 'visiteur123',
        role: 'VISITEUR'
      }
    ]);
    console.log('✅ Utilisateurs créés:', users.length);
    
    // Créer les articles
    const articles = await Article.bulkCreate([
      {
        title: 'Nouvelle technologie révolutionnaire',
        content: 'Une nouvelle technologie prometteuse vient d\'être annoncée. Cette innovation pourrait changer la façon dont nous interagissons avec les ordinateurs.',
        categoryId: categories[1].id // Technologie
      },
      {
        title: 'Match de football spectaculaire',
        content: 'Hier soir, un match de football exceptionnel a eu lieu. Les deux équipes ont livré une performance remarquable.',
        categoryId: categories[2].id // Sport
      },
      {
        title: 'Exposition d\'art contemporain',
        content: 'Une nouvelle exposition d\'art contemporain ouvre ses portes ce week-end. Les artistes présentent des œuvres innovantes.',
        categoryId: categories[3].id // Culture
      },
      {
        title: 'Marché boursier en hausse',
        content: 'Le marché boursier connaît une hausse significative cette semaine. Les analystes sont optimistes pour les prochaines semaines.',
        categoryId: categories[4].id // Économie
      },
      {
        title: 'Élections municipales',
        content: 'Les élections municipales approchent. Les candidats présentent leurs programmes respectifs.',
        categoryId: categories[0].id // Actualités
      }
    ]);
    console.log('✅ Articles créés:', articles.length);
    
    console.log('🎉 Seeding terminé avec succès!');
    console.log('\n📋 Comptes de test créés:');
    console.log('   Admin: admin / admin123');
    console.log('   Éditeur: editeur1 / editeur123');
    console.log('   Visiteur: visiteur1 / visiteur123');
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

seedDatabase(); 