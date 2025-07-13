const express = require('express');
const router = express.Router();
const { 
  getAllArticles, 
  getArticleById, 
  getArticlesByCategory,
  createArticle, 
  updateArticle, 
  deleteArticle 
} = require('../controllers/articleController');
const { authenticateToken, requireEditeur, requireVisiteur } = require('../middleware/auth');

// Routes publiques (lecture)
// GET /api/articles - Obtenir tous les articles
router.get('/', getAllArticles);

// GET /api/articles/:id - Obtenir un article par ID
router.get('/:id', getArticleById);

// GET /api/articles/category/:categoryId - Obtenir les articles par catégorie
router.get('/category/:categoryId', getArticlesByCategory);

// Routes protégées (écriture) - nécessitent authentification et rôle EDITEUR ou ADMIN
// POST /api/articles - Créer un nouvel article
router.post('/', authenticateToken, requireEditeur, createArticle);

// PUT /api/articles/:id - Mettre à jour un article
router.put('/:id', authenticateToken, requireEditeur, updateArticle);

// DELETE /api/articles/:id - Supprimer un article
router.delete('/:id', authenticateToken, requireEditeur, deleteArticle);

module.exports = router; 