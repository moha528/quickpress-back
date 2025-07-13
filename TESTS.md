# Tests d'API - News Chronicle Online

Ce document contient des exemples de tests pour toutes les fonctionnalités de l'API.

## 🧪 Tests avec cURL

### 1. Authentification

#### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

#### Inscription
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "role": "VISITEUR"
  }'
```

#### Profil utilisateur
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Articles

#### Obtenir tous les articles (JSON)
```bash
curl -X GET http://localhost:3000/api/articles \
  -H "Accept: application/json"
```

#### Obtenir tous les articles (XML)
```bash
curl -X GET http://localhost:3000/api/articles \
  -H "Accept: application/xml"
```

#### Obtenir un article par ID
```bash
curl -X GET http://localhost:3000/api/articles/1
```

#### Obtenir les articles par catégorie
```bash
curl -X GET http://localhost:3000/api/articles/category/1
```

#### Créer un article (nécessite authentification EDITEUR+)
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Nouvel article de test",
    "content": "Contenu de l'article de test",
    "categoryId": 1
  }'
```

#### Mettre à jour un article
```bash
curl -X PUT http://localhost:3000/api/articles/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Titre modifié",
    "content": "Contenu modifié"
  }'
```

#### Supprimer un article
```bash
curl -X DELETE http://localhost:3000/api/articles/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Catégories

#### Obtenir toutes les catégories
```bash
curl -X GET http://localhost:3000/api/categories
```

#### Obtenir une catégorie par ID
```bash
curl -X GET http://localhost:3000/api/categories/1
```

#### Créer une catégorie
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Nouvelle catégorie"
  }'
```

#### Mettre à jour une catégorie
```bash
curl -X PUT http://localhost:3000/api/categories/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Catégorie modifiée"
  }'
```

#### Supprimer une catégorie
```bash
curl -X DELETE http://localhost:3000/api/categories/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Utilisateurs (ADMIN uniquement)

#### Obtenir tous les utilisateurs
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Obtenir un utilisateur par ID
```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Créer un utilisateur
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "username": "nouveau_user",
    "password": "password123",
    "role": "EDITEUR"
  }'
```

#### Mettre à jour un utilisateur
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "role": "ADMIN"
  }'
```

#### Supprimer un utilisateur
```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## 🔧 Tests SOAP

### Authentification SOAP
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

### Lister les utilisateurs SOAP
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <listUsers>
      <token>YOUR_JWT_TOKEN</token>
    </listUsers>
  </soap:Body>
</soap:Envelope>
```

### Ajouter un utilisateur SOAP
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <addUser>
      <token>YOUR_JWT_TOKEN</token>
      <username>soap_user</username>
      <password>password123</password>
      <role>VISITEUR</role>
    </addUser>
  </soap:Body>
</soap:Envelope>
```

### Supprimer un utilisateur SOAP
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <deleteUser>
      <token>YOUR_JWT_TOKEN</token>
      <userId>1</userId>
    </deleteUser>
  </soap:Body>
</soap:Envelope>
```

## 📋 Tests avec Postman

### Collection Postman

Vous pouvez importer cette collection dans Postman :

```json
{
  "info": {
    "name": "News Chronicle API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"admin123\"\n}"
            },
            "url": {
              "raw": "http://localhost:3000/api/auth/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    }
  ]
}
```

## 🧪 Tests automatisés

### Script de test simple

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  try {
    // Test de connexion
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    
    // Test des articles
    const articlesResponse = await axios.get(`${API_BASE}/articles`);
    console.log('✅ Articles récupérés:', articlesResponse.data.data.length);
    
    // Test des catégories
    const categoriesResponse = await axios.get(`${API_BASE}/categories`);
    console.log('✅ Catégories récupérées:', categoriesResponse.data.data.length);
    
  } catch (error) {
    console.error('❌ Erreur de test:', error.response?.data || error.message);
  }
}

testAPI();
```

## 📊 Endpoints de test

### Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

### Informations API
```bash
curl -X GET http://localhost:3000/
```

### WSDL SOAP
```bash
curl -X GET http://localhost:3000/soap?wsdl
```

## 🔍 Validation des réponses

### Format JSON attendu
```json
{
  "success": true,
  "data": [...],
  "message": "Opération réussie"
}
```

### Format XML attendu
```xml
<response>
  <success>true</success>
  <data>...</data>
  <message>Opération réussie</message>
</response>
```

## ⚠️ Codes d'erreur

- `400`: Données invalides
- `401`: Non authentifié
- `403`: Accès refusé (rôle insuffisant)
- `404`: Ressource non trouvée
- `500`: Erreur interne du serveur 