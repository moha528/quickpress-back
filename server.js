require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import des configurations
const { testConnection } = require('./config/database');
const { syncModels } = require('./models');

// Import des middlewares
const formatResponse = require('./middleware/responseFormat');

// Import des routes
const routes = require('./routes');

// Import du serveur SOAP
const { initSoapServer } = require('./services/soap/soapServer');

const app = express();

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middlewares de parsing
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de format de réponse (JSON/XML)
app.use(formatResponse);

// Routes API
app.use('/api', routes);

// Initialisation du serveur SOAP
initSoapServer(app);

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'QuickPress API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      articles: '/api/articles',
      categories: '/api/categories',
      health: '/api/health',
      soap: '/soap'
    },
    documentation: 'Consultez le README pour plus d\'informations'
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Middleware de gestion d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

const PORT = process.env.PORT || 3000;

// Initialisation de l'application
const startServer = async () => {
  try {
    // Test de connexion à la base de données
    await testConnection();
    
    // Synchronisation des modèles
    await syncModels();
    
    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log('🚀 Serveur QuickPress démarré');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`🔧 SOAP: http://localhost:${PORT}/soap`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();