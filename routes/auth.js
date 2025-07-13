const express = require('express');
const router = express.Router();
const { login, register, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Route de connexion
router.post('/login', login);

// Route d'inscription
router.post('/register', register);

// Route pour obtenir le profil de l'utilisateur connecté
router.get('/profile', authenticateToken, getProfile);

module.exports = router; 