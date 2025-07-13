const express = require('express');
const xml2js = require('xml2js');
const { User, SoapToken } = require('../../models');
const { generateToken, JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/jwt');
const jwt = require('jsonwebtoken');

// WSDL pour le service SOAP
const wsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions name="QuickPressService"
             targetNamespace="http://quickpress.com/soap"
             xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://quickpress.com/soap"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema">

  <message name="AuthenticateUserRequest">
    <part name="username" type="xsd:string"/>
    <part name="password" type="xsd:string"/>
  </message>

  <message name="AuthenticateUserResponse">
    <part name="role" type="xsd:string"/>
    <part name="token" type="xsd:string"/>
    <part name="success" type="xsd:boolean"/>
    <part name="message" type="xsd:string"/>
  </message>

  <message name="ListUsersRequest">
    <part name="token" type="xsd:string"/>
  </message>

  <message name="ListUsersResponse">
    <part name="users" type="xsd:string"/>
    <part name="success" type="xsd:boolean"/>
    <part name="message" type="xsd:string"/>
  </message>

  <message name="AddUserRequest">
    <part name="token" type="xsd:string"/>
    <part name="username" type="xsd:string"/>
    <part name="password" type="xsd:string"/>
    <part name="role" type="xsd:string"/>
  </message>

  <message name="AddUserResponse">
    <part name="success" type="xsd:boolean"/>
    <part name="message" type="xsd:string"/>
    <part name="userId" type="xsd:integer"/>
  </message>

  <message name="UpdateUserRequest">
    <part name="token" type="xsd:string"/>
    <part name="userId" type="xsd:integer"/>
    <part name="username" type="xsd:string"/>
    <part name="password" type="xsd:string"/>
    <part name="role" type="xsd:string"/>
  </message>

  <message name="UpdateUserResponse">
    <part name="success" type="xsd:boolean"/>
    <part name="message" type="xsd:string"/>
  </message>

  <message name="DeleteUserRequest">
    <part name="token" type="xsd:string"/>
    <part name="userId" type="xsd:integer"/>
  </message>

  <message name="DeleteUserResponse">
    <part name="success" type="xsd:boolean"/>
    <part name="message" type="xsd:string"/>
  </message>

  <portType name="QuickPressPortType">
    <operation name="authenticateUser">
      <input message="tns:AuthenticateUserRequest"/>
      <output message="tns:AuthenticateUserResponse"/>
    </operation>
    <operation name="listUsers">
      <input message="tns:ListUsersRequest"/>
      <output message="tns:ListUsersResponse"/>
    </operation>
    <operation name="addUser">
      <input message="tns:AddUserRequest"/>
      <output message="tns:AddUserResponse"/>
    </operation>
    <operation name="updateUser">
      <input message="tns:UpdateUserRequest"/>
      <output message="tns:UpdateUserResponse"/>
    </operation>
    <operation name="deleteUser">
      <input message="tns:DeleteUserRequest"/>
      <output message="tns:DeleteUserResponse"/>
    </operation>
  </portType>

  <binding name="QuickPressBinding" type="tns:QuickPressPortType">
    <soap:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="authenticateUser">
      <soap:operation soapAction="authenticateUser"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
    <operation name="listUsers">
      <soap:operation soapAction="listUsers"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
    <operation name="addUser">
      <soap:operation soapAction="addUser"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
    <operation name="updateUser">
      <soap:operation soapAction="updateUser"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
    <operation name="deleteUser">
      <soap:operation soapAction="deleteUser"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>

  <service name="QuickPressService">
    <port name="QuickPressPort" binding="tns:QuickPressBinding">
      <soap:address location="http://localhost:8000/soap"/>
    </port>
  </service>
</definitions>`;

// Fonction pour vérifier un token SOAP
const verifySoapToken = async (token) => {
  try {
    // Utiliser le système JWT existant
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Erreur lors de la vérification du token SOAP:', error);
    return null;
  }
};

// Fonction pour créer une réponse SOAP avec la bonne balise
const createSoapResponse = (operation, result) => {
  // Nom de la balise de réponse, ex: authenticateUserResponse
  const responseTag = `${operation}Response`;
  let bodyContent = '';
  // Générer le contenu selon les champs présents
  if (result.success !== undefined) bodyContent += `<success>${result.success}</success>`;
  if (result.message !== undefined) bodyContent += `<message>${result.message}</message>`;
  if (result.role !== undefined) bodyContent += `<role>${result.role}</role>`;
  if (result.token !== undefined) bodyContent += `<token>${result.token}</token>`;
  if (result.userId !== undefined) bodyContent += `<userId>${result.userId}</userId>`;
  if (result.users !== undefined) bodyContent += `<users>${result.users}</users>`;

  const response = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://quickpress.com/soap">
   <soapenv:Header/>
   <soapenv:Body>
      <${responseTag}>
        ${bodyContent}
      </${responseTag}>
   </soapenv:Body>
</soapenv:Envelope>`;
  return response;
};

// Initialiser le serveur SOAP
const initSoapServer = (app) => {
  // Route pour servir le WSDL
  app.get('/soap', (req, res) => {
    res.set('Content-Type', 'application/xml');
    res.send(wsdl);
  });

  // Route pour traiter les requêtes SOAP
  app.post('/soap', express.raw({ type: 'text/xml', limit: '10mb' }), async (req, res) => {
    try {
      const xmlData = req.body.toString();
      console.log('Requête SOAP reçue:', xmlData.substring(0, 200) + '...');

      // Parser le XML
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(xmlData);

      // Extraire l'opération et les paramètres
      const envelope = result['soapenv:Envelope'] || result['soap:Envelope'];
      const body = envelope['soapenv:Body'] || envelope['soap:Body'];
      
      let operation = null;
      let args = {};

      // Détecter l'opération (prendre en compte le namespace tns)
      const operations = {
        'tns:authenticateUser': 'authenticateUser',
        'tns:listUsers': 'listUsers',
        'tns:addUser': 'addUser',
        'tns:updateUser': 'updateUser',
        'tns:deleteUser': 'deleteUser'
      };

      const operationKey = Object.keys(body).find(key => operations[key]);
      if (operationKey) {
        operation = operations[operationKey];
        args = body[operationKey];
      }

      if (!operation) {
        throw new Error('Opération SOAP non reconnue');
      }

      console.log(`Opération SOAP: ${operation}`, args);

      // Exécuter l'opération
      let response;
      switch (operation) {
        case 'authenticateUser':
          response = await handleAuthenticateUser(args);
          break;
        case 'listUsers':
          response = await handleListUsers(args);
          break;
        case 'addUser':
          response = await handleAddUser(args);
          break;
        case 'updateUser':
          response = await handleUpdateUser(args);
          break;
        case 'deleteUser':
          response = await handleDeleteUser(args);
          break;
        default:
          response = { success: false, message: 'Opération non supportée' };
      }

      // Envoyer la réponse SOAP avec la bonne balise
      const soapResponse = createSoapResponse(operation, response);
      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.send(soapResponse);

    } catch (error) {
      console.error('Erreur lors du traitement SOAP:', error);
      // Réponse d'erreur générique
      const soapResponse = createSoapResponse('error', {
        success: false,
        message: 'Erreur interne du serveur: ' + error.message
      });
      res.set('Content-Type', 'text/xml; charset=utf-8');
      res.status(500).send(soapResponse);
    }
  });

  console.log('✅ Serveur SOAP initialisé sur /soap');
  console.log('📋 Méthodes disponibles:');
  console.log('   - authenticateUser(username, password)');
  console.log('   - listUsers(token) - ADMIN uniquement (token SOAP requis)');
  console.log('   - addUser(token, username, password, role) - ADMIN uniquement (token SOAP requis)');
  console.log('   - updateUser(token, userId, username, password, role) - ADMIN uniquement (token SOAP requis)');
  console.log('   - deleteUser(token, userId) - ADMIN uniquement (token SOAP requis)');
};

// Gestionnaires d'opérations SOAP
const handleAuthenticateUser = async (args) => {
  try {
    const { username, password } = args;
    
    if (!username || !password) {
      return {
        success: false,
        message: 'Nom d\'utilisateur et mot de passe requis',
        role: '',
        token: ''
      };
    }
    
    // Recherche de l'utilisateur
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return {
        success: false,
        message: 'Nom d\'utilisateur ou mot de passe incorrect',
        role: '',
        token: ''
      };
    }

    console.log('User found:', user);
    
    // Vérification du mot de passe

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return {
        success: false,
        message: 'Nom d\'utilisateur ou mot de passe incorrect',
        role: '',
        token: ''
      };
    }

    console.log('Password is valid:', isValidPassword);
    
    // Génération du token JWT
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });
    
    return {
      success: true,
      message: 'Authentification réussie',
      role: user.role,
      token: token
    };
  } catch (error) {
    console.error('Erreur SOAP authenticateUser:', error);
    return {
      success: false,
      message: 'Erreur interne du serveur',
      role: '',
      token: ''
    };
  }
};

const handleListUsers = async (args) => {
  try {
    const { token } = args;
    
    if (!token) {
      return {
        success: false,
        message: 'Token requis',
        users: ''
      };
    }
    
    // Vérifier le token SOAP
    const soapToken = await verifySoapToken(token);
    if (!soapToken) {
      return {
        success: false,
        message: 'Token invalide ou expiré',
        users: ''
      };
    }
    
    // Récupérer tous les utilisateurs
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'createdAt']
    });
    
    const usersJson = JSON.stringify(users.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    })));
    
    return {
      success: true,
      message: `${users.length} utilisateur(s) trouvé(s)`,
      users: usersJson
    };
  } catch (error) {
    console.error('Erreur SOAP listUsers:', error);
    return {
      success: false,
      message: 'Erreur interne du serveur',
      users: ''
    };
  }
};

const handleAddUser = async (args) => {
  try {
    const { token, username, password, role } = args;
    
    if (!token) {
      return {
        success: false,
        message: 'Token requis',
        userId: 0
      };
    }
    
    // Vérifier le token SOAP
    const soapToken = await verifySoapToken(token);
    if (!soapToken) {
      return {
        success: false,
        message: 'Token invalide ou expiré',
        userId: 0
      };
    }
    
    if (!username || !password) {
      return {
        success: false,
        message: 'Nom d\'utilisateur et mot de passe requis',
        userId: 0
      };
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return {
        success: false,
        message: 'Ce nom d\'utilisateur existe déjà',
        userId: 0
      };
    }
    
    // Créer l'utilisateur
    const user = await User.create({
      username,
      password,
      role: role || 'user'
    });
    
    return {
      success: true,
      message: 'Utilisateur créé avec succès',
      userId: user.id
    };
  } catch (error) {
    console.error('Erreur SOAP addUser:', error);
    return {
      success: false,
      message: 'Erreur interne du serveur',
      userId: 0
    };
  }
};

const handleUpdateUser = async (args) => {
  try {
    const { token, userId, username, password, role } = args;
    
    if (!token) {
      return {
        success: false,
        message: 'Token requis'
      };
    }
    
    // Vérifier le token SOAP
    const soapToken = await verifySoapToken(token);
    if (!soapToken) {
      return {
        success: false,
        message: 'Token invalide ou expiré'
      };
    }
    
    if (!userId) {
      return {
        success: false,
        message: 'ID utilisateur requis'
      };
    }
    
    // Rechercher l'utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      return {
        success: false,
        message: 'Utilisateur non trouvé'
      };
    }
    
    // Préparer les données de mise à jour
    const updateData = {};
    if (username) updateData.username = username;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    
    // Vérifier si le nouveau nom d'utilisateur existe déjà (sauf pour l'utilisateur actuel)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return {
          success: false,
          message: 'Ce nom d\'utilisateur existe déjà'
        };
      }
    }
    
    // Mettre à jour l'utilisateur
    await user.update(updateData);
    
    return {
      success: true,
      message: 'Utilisateur mis à jour avec succès'
    };
  } catch (error) {
    console.error('Erreur SOAP updateUser:', error);
    return {
      success: false,
      message: 'Erreur interne du serveur'
    };
  }
};

const handleDeleteUser = async (args) => {
  try {
    const { token, userId } = args;
    
    if (!token) {
      return {
        success: false,
        message: 'Token requis'
      };
    }
    
    // Vérifier le token SOAP
    const soapToken = await verifySoapToken(token);
    if (!soapToken) {
      return {
        success: false,
        message: 'Token invalide ou expiré'
      };
    }
    
    if (!userId) {
      return {
        success: false,
        message: 'ID utilisateur requis'
      };
    }
    
    // Rechercher et supprimer l'utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      return {
        success: false,
        message: 'Utilisateur non trouvé'
      };
    }
    
    await user.destroy();
    
    return {
      success: true,
      message: 'Utilisateur supprimé avec succès'
    };
  } catch (error) {
    console.error('Erreur SOAP deleteUser:', error);
    return {
      success: false,
      message: 'Erreur interne du serveur'
    };
  }
};

module.exports = { initSoapServer };