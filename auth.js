const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Mapeo de usuarios desde variables de entorno
const users = {
  [process.env.AUTH_USER1_USERNAME]: {
    password: process.env.AUTH_USER1_PASSWORD,
    role: process.env.AUTH_USER1_ROLE
  },
  [process.env.AUTH_USER2_USERNAME]: {
    password: process.env.AUTH_USER2_PASSWORD,
    role: process.env.AUTH_USER2_ROLE
  }
};

// Verifica token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.user = decoded;
    next();
  });
};

// Genera un token JWT 
const generateToken = (user) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1d' });
};

function generateRefreshToken(user) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' }); 
}

// Middleware de autenticación básica
const authenticateUser = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  const userData = users[username];

  if (userData && userData.password === password) {
    req.user = { username, role: userData.role };
    next();
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
};

// Middleware para verificar rol específico
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Acceso denegado: rol insuficiente' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  generateToken,
  generateRefreshToken,
  authenticateUser,
  requireRole
};
