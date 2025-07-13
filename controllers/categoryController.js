const { Category, Article } = require('../models');

// Obtenir toutes les catégories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{
        model: Article,
        as: 'articles',
        attributes: ['id', 'title'],
        required: false
      }],
      order: [['name', 'ASC']]
    });
    
    res.sendFormatted({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Obtenir une catégorie par ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByPk(id, {
      include: [{
        model: Article,
        as: 'articles',
        attributes: ['id', 'title', 'createdAt'],
        required: false,
        order: [['createdAt', 'DESC']]
      }]
    });
    
    if (!category) {
      return res.status(404).sendFormatted({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }
    
    res.sendFormatted({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Créer une nouvelle catégorie
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validation des données
    if (!name || name.trim().length < 2) {
      return res.status(400).sendFormatted({
        success: false,
        error: 'Le nom de la catégorie doit contenir au moins 2 caractères'
      });
    }
    
    // Vérifier si la catégorie existe déjà
    const existingCategory = await Category.findOne({ 
      where: { name: name.trim() } 
    });
    if (existingCategory) {
      return res.status(400).sendFormatted({
        success: false,
        error: 'Cette catégorie existe déjà'
      });
    }
    
    // Créer la catégorie
    const category = await Category.create({
      name: name.trim()
    });
    
    res.status(201).sendFormatted({
      success: true,
      message: 'Catégorie créée avec succès',
      data: category
    });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Mettre à jour une catégorie
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).sendFormatted({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }
    
    // Validation des données
    if (!name || name.trim().length < 2) {
      return res.status(400).sendFormatted({
        success: false,
        error: 'Le nom de la catégorie doit contenir au moins 2 caractères'
      });
    }
    
    // Vérifier si le nouveau nom existe déjà
    const existingCategory = await Category.findOne({ 
      where: { 
        name: name.trim(),
        id: { [require('sequelize').Op.ne]: id }
      } 
    });
    if (existingCategory) {
      return res.status(400).sendFormatted({
        success: false,
        error: 'Cette catégorie existe déjà'
      });
    }
    
    // Mettre à jour la catégorie
    await category.update({
      name: name.trim()
    });
    
    res.sendFormatted({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: category
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Supprimer une catégorie
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).sendFormatted({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }
    
    // Vérifier s'il y a des articles dans cette catégorie
    const articleCount = await Article.count({ where: { categoryId: id } });
    if (articleCount > 0) {
      return res.status(400).sendFormatted({
        success: false,
        error: `Impossible de supprimer cette catégorie car elle contient ${articleCount} article(s)`
      });
    }
    
    await category.destroy();
    
    res.sendFormatted({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
}; 