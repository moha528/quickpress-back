const { verifyToken, extractToken } = require('../config/jwt');
const { User } = require('../models');

// Middleware d'authentification JWT
const authenticateToken = async (req, res, next) => {
  try {
    const token = extractToken(req);
    const decoded = verifyToken(token);
    
    // Vérifier que l'utilisateur existe toujours en base
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

// Middleware de vérification de rôle
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }
    
    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Accès refusé. Rôles autorisés: ' + allowedRoles.join(', ')
      });
    }
    
    next();
  };
};

// Middlewares spécifiques par rôle
const requireAdmin = requireRole('ADMIN');
const requireEditeur = requireRole(['ADMIN', 'EDITEUR']);
const requireVisiteur = requireRole(['ADMIN', 'EDITEUR', 'VISITEUR']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireEditeur,
  requireVisiteur
};
