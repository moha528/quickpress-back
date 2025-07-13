const User = require('./User');
const Category = require('./Category');
const Article = require('./Article');

// Définition des relations
Category.hasMany(Article, {
  foreignKey: 'categoryId',
  as: 'articles'
});

Article.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

// Synchronisation des modèles avec la base de données
const syncModels = async () => {
  try {
    await User.sync({ alter: true });
    await Category.sync({ alter: true });
    await Article.sync({ alter: true });
    console.log('✅ Modèles synchronisés avec la base de données');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des modèles:', error);
  }
};

module.exports = {
  User,
  Category,
  Article,
  syncModels
}; 