const express = require('express');
const router = express.Router();
const { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const { authenticateToken, requireEditeur } = require('../middleware/auth');

// Routes publiques (lecture)
// GET /api/categories - Obtenir toutes les catégories
router.get('/', getAllCategories);

// GET /api/categories/:id - Obtenir une catégorie par ID
router.get('/:id', getCategoryById);

// Routes protégées (écriture) - nécessitent authentification et rôle EDITEUR ou ADMIN
// POST /api/categories - Créer une nouvelle catégorie
router.post('/', authenticateToken, requireEditeur, createCategory);

// PUT /api/categories/:id - Mettre à jour une catégorie
router.put('/:id', authenticateToken, requireEditeur, updateCategory);

// DELETE /api/categories/:id - Supprimer une catégorie
router.delete('/:id', authenticateToken, requireEditeur, deleteCategory);

module.exports = router; 