# News Chronicle Online - Backend API

Backend Node.js Express avec authentification JWT, base de données MySQL (Sequelize), et services SOAP.

## 🚀 Fonctionnalités

- **Authentification JWT** avec rôles (VISITEUR, EDITEUR, ADMIN)
- **Base de données MySQL** avec Sequelize ORM
- **API REST** complète pour les articles, catégories et utilisateurs
- **Services SOAP** avec authentification
- **Format de réponse** JSON/XML selon l'en-tête Accept
- **Middleware de sécurité** et validation des rôles
- **Pagination** et filtres pour les articles

## 📋 Prérequis

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm ou yarn

## 🛠️ Installation

1. **Cloner le projet**
```bash
cd backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de la base de données**
   - Créer une base de données MySQL nommée `news_chronicle`
   - Copier `.env.example` vers `.env`
   - Modifier les paramètres de connexion dans `.env`

4. **Variables d'environnement**
```env
# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=news_chronicle
DB_USER=root
DB_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre_clé_secrète_jwt
JWT_EXPIRES_IN=24h

# Serveur
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. **Initialiser la base de données**
```bash
node scripts/seed.js
```

6. **Démarrer le serveur**
```bash
# Développement
npm run dev

# Production
npm start
```

## 📊 Structure de la base de données

### Tables

- **users**: Utilisateurs avec rôles
- **categories**: Catégories d'articles
- **articles**: Articles avec relations vers les catégories

### Relations

- Un article appartient à une catégorie
- Une catégorie peut avoir plusieurs articles

## 🔐 Authentification

### Rôles utilisateurs

- **VISITEUR**: Lecture des articles et catégories
- **EDITEUR**: Lecture + Création/Modification/Suppression d'articles et catégories
- **ADMIN**: Tous les droits + Gestion des utilisateurs

### JWT Token

Le token JWT contient :
```json
{
  "id": 1,
  "username": "admin",
  "role": "ADMIN",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## 🌐 API REST

### Base URL
```
http://localhost:3000/api
```

### Authentification

#### POST /auth/login
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### POST /auth/register
```json
{
  "username": "nouveau_user",
  "password": "password123",
  "role": "VISITEUR"
}
```

#### GET /auth/profile
```
Authorization: Bearer <token>
```

### Articles

#### GET /articles
- **Pagination**: `?page=1&limit=10`
- **Filtre par catégorie**: `?category=1`
- **Recherche**: `?search=technologie`
- **Format**: JSON ou XML selon `Accept` header

#### GET /articles/:id
#### GET /articles/category/:categoryId
#### POST /articles (EDITEUR+)
#### PUT /articles/:id (EDITEUR+)
#### DELETE /articles/:id (EDITEUR+)

### Catégories

#### GET /categories
#### GET /categories/:id
#### POST /categories (EDITEUR+)
#### PUT /categories/:id (EDITEUR+)
#### DELETE /categories/:id (EDITEUR+)

### Utilisateurs (ADMIN uniquement)

#### GET /users
#### GET /users/:id
#### POST /users
#### PUT /users/:id
#### DELETE /users/:id

## 🔧 Services SOAP

### Endpoint
```
http://localhost:3000/soap
```

### Méthodes disponibles

#### authenticateUser(username, password)
Authentifie un utilisateur et retourne son rôle et un token JWT.

#### listUsers(token)
Liste tous les utilisateurs (ADMIN uniquement).

#### addUser(token, username, password, role)
Ajoute un nouvel utilisateur (ADMIN uniquement).

#### deleteUser(token, userId)
Supprime un utilisateur (ADMIN uniquement).

### Exemple d'utilisation SOAP

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <authenticateUser>
      <username>admin</username>
      <password>admin123</password>
    </authenticateUser>
  </soap:Body>
</soap:Envelope>
```

## 📝 Format de réponse

### JSON (par défaut)
```json
{
  "success": true,
  "data": [...],
  "message": "Opération réussie"
}
```

### XML
```xml
<response>
  <success>true</success>
  <data>...</data>
  <message>Opération réussie</message>
</response>
```

Pour obtenir du XML, ajoutez l'en-tête :
```
Accept: application/xml
```

## 🛡️ Sécurité

- **CORS** configuré pour le frontend
- **Validation** des données d'entrée
- **Hashage** des mots de passe avec bcrypt
- **JWT** pour l'authentification
- **Middleware** de vérification des rôles
- **Limitation** de la taille des requêtes

## 📁 Structure du projet

```
backend/
├── config/
│   ├── database.js      # Configuration Sequelize
│   └── jwt.js          # Configuration JWT
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── articleController.js
│   └── categoryController.js
├── middleware/
│   ├── auth.js         # Authentification JWT
│   └── responseFormat.js # Format JSON/XML
├── models/
│   ├── User.js
│   ├── Category.js
│   ├── Article.js
│   └── index.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── articles.js
│   ├── categories.js
│   └── index.js
├── services/
│   └── soap/
│       └── soapServer.js
├── scripts/
│   └── seed.js         # Données de test
├── server.js           # Point d'entrée
└── package.json
```

## 🧪 Tests

### Comptes de test créés par le seed

- **Admin**: `admin` / `admin123`
- **Éditeur**: `editeur1` / `editeur123`
- **Visiteur**: `visiteur1` / `visiteur123`

### Endpoints de test

- **Health check**: `GET /api/health`
- **API info**: `GET /`

## 🚀 Déploiement

1. **Variables d'environnement de production**
```env
NODE_ENV=production
JWT_SECRET=clé_secrète_très_longue_et_complexe
DB_PASSWORD=mot_de_passe_sécurisé
```

2. **Base de données**
```bash
# Synchroniser les modèles
node -e "require('./models').syncModels()"
```

3. **Démarrer**
```bash
npm start
```

## 📞 Support

Pour toute question ou problème, consultez la documentation ou contactez l'équipe de développement. 