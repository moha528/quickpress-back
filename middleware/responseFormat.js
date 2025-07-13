const xml2js = require('xml2js');

// Middleware pour gérer le format de réponse
const formatResponse = (req, res, next) => {
  const acceptHeader = req.headers.accept || '';
  
  // Méthode pour envoyer la réponse dans le bon format
  res.sendFormatted = (data, statusCode = 200) => {
    if (acceptHeader.includes('application/xml') || acceptHeader.includes('text/xml')) {
      // Convertir en XML
      const builder = new xml2js.Builder({
        rootName: 'response',
        headless: true,
        renderOpts: { pretty: true, indent: '  ' }
      });
      
      const xml = builder.buildObject(data);
      res.setHeader('Content-Type', 'application/xml');
      res.status(statusCode).send(xml);
    } else {
      // Par défaut, JSON
      res.setHeader('Content-Type', 'application/json');
      res.status(statusCode).json(data);
    }
  };
  
  next();
};

module.exports = formatResponse; 