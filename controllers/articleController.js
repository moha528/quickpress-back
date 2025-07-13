const { Article, Category } = require('../models');
const { Op } = require('sequelize');

// Obtenir tous les articles avec pagination et filtres
const getAllArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const offset = (page - 1) * limit;
    
    // Construire les conditions de recherche
    const where = {};
    if (category) {
      where.categoryId = category;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const articles = await Article.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.sendFormatted({
      success: true,
      data: articles.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: articles.count,
        totalPages: Math.ceil(articles.count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Obtenir un article par ID
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });
    
    if (!article) {
      return res.status(404).sendFormatted({
        success: false,
        error: 'Article non trouvé'
      });
    }
    
    res.sendFormatted({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Obtenir les articles par catégorie
const getArticlesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Vérifier que la catégorie existe
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).sendFormatted({
        success: false,
        error: 'Catégorie non trouvée'
      });
    }
    
    const articles = await Article.findAndCountAll({
      where: { categoryId },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.sendFormatted({
      success: true,
      data: articles.rows,
      category: {
        id: category.id,
        name: category.name
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: articles.count,
        totalPages: Math.ceil(articles.count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles par catégorie:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Créer un nouvel article
const createArticle = async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;
    
    // Validation des données
    if (!title || !content || !categoryId) {
      return res.status(400).sendFormatted({
        success: false,
        error: 'Titre, contenu et catégorie requis'
      });
    }
    
    // Vérifier que la catégorie existe
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).sendFormatted({
        success: false,
        error: 'Catégorie invalide'
      });
    }
    
    // Créer l'article
    const article = await Article.create({
      title,
      content,
      categoryId
    });
    
    // Récupérer l'article avec sa catégorie
    const newArticle = await Article.findByPk(article.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });
    
    res.status(201).sendFormatted({
      success: true,
      message: 'Article créé avec succès',
      data: newArticle
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Mettre à jour un article
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId } = req.body;
    
    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).sendFormatted({
        success: false,
        error: 'Article non trouvé'
      });
    }
    
    // Vérifier que la catégorie existe si elle est fournie
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).sendFormatted({
          success: false,
          error: 'Catégorie invalide'
        });
      }
    }
    
    // Mettre à jour l'article
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (categoryId) updateData.categoryId = categoryId;
    
    await article.update(updateData);
    
    // Récupérer l'article mis à jour avec sa catégorie
    const updatedArticle = await Article.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });
    
    res.sendFormatted({
      success: true,
      message: 'Article mis à jour avec succès',
      data: updatedArticle
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Supprimer un article
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).sendFormatted({
        success: false,
        error: 'Article non trouvé'
      });
    }
    
    await article.destroy();
    
    res.sendFormatted({
      success: true,
      message: 'Article supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  getArticlesByCategory,
  createArticle,
  updateArticle,
  deleteArticle
}; 