const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification et des droits d'admin
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/users - Obtenir tous les utilisateurs
router.get('/', getAllUsers);

// GET /api/users/:id - Obtenir un utilisateur par ID
router.get('/:id', getUserById);

// POST /api/users - Créer un nouvel utilisateur
router.post('/', createUser);

// PUT /api/users/:id - Mettre à jour un utilisateur
router.put('/:id', updateUser);

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete('/:id', deleteUser);

module.exports = router; 