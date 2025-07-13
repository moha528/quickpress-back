const { User } = require('../models');

// Obtenir tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'createdAt', 'updatedAt']
    });
    
    res.sendFormatted({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Obtenir un utilisateur par ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'role', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      return res.status(404).sendFormatted({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    res.sendFormatted({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Créer un nouvel utilisateur
const createUser = async (req, res) => {
  try {
    const { username, password, role = 'VISITEUR' } = req.body;
    
    // Validation des données
    if (!username || !password) {
      return res.status(400).sendFormatted({
        success: false,
        error: 'Nom d\'utilisateur et mot de passe requis'
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).sendFormatted({
        success: false,
        error: 'Ce nom d\'utilisateur existe déjà'
      });
    }
    
    // Créer l'utilisateur
    const user = await User.create({
      username,
      password,
      role
    });
    
    res.status(201).sendFormatted({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Mettre à jour un utilisateur
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).sendFormatted({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier si le nouveau nom d'utilisateur existe déjà
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).sendFormatted({
          success: false,
          error: 'Ce nom d\'utilisateur existe déjà'
        });
      }
    }
    
    // Mettre à jour l'utilisateur
    const updateData = {};
    if (username) updateData.username = username;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    
    await user.update(updateData);
    
    res.sendFormatted({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).sendFormatted({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    await user.destroy();
    
    res.sendFormatted({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).sendFormatted({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}; 