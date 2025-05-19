const express = require('express');
const axios = require('axios');
require('dotenv').config();

const { verifyToken, generateToken,generateRefreshToken, authenticateUser, requireRole } = require('./auth');

const app = express();
const PORT = process.env.PORT || 6000;
const NUM_SERVICE_URL = process.env.NUM_SERVICE_URL;

// Middleware
app.use(express.json());

// Middleware de registro (logging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Rutas
app.post('/login', authenticateUser, (req, res) => {
  try {
    const accesToken = generateToken({ 
      username: req.user.username, 
      role: req.user.role 
    });
    const refreshToken = generateRefreshToken({ 
      username: req.user.username, 
      role: req.user.role 
    });

    res.json({ 
      mainMessage: "LOGIN EXITOSO CHAVALIN",
      accesToken,
      accesMessage: 'acces token',
      AccesexpiresIn: '1h', 
      refreshToken,
      refresMessage: 'refresh token',
      RefreshExpiresIn: '1d'
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al generar el token' });
  }
});

app.get('/sum', verifyToken, async (req, res) => {
  try {
    // Realizar solicitud al microservicio de números
    const response = await axios.get(NUM_SERVICE_URL);
    const { num1, num2 } = response.data;
    
    const suma = num1 + num2;
    
    res.json({ 
      result: suma,
      operation: `${num1} + ${num2}`,
      user: req.user.username,
      timestamp: new Date().toISOString()
    });

    //?                                   hacemos la solicitud POST a la url de historial para guardar
    await axios.post(`${process.env.HISTORIAL_SERVICE_URL}/guardar`, {
      user: req.user.username,
      operation: `${num1} + ${num2}`,
      result: suma,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error al obtener números aleatorios:', error);
    res.status(500).json({ error: 'Error al realizar la operación de suma' });
  }
});

app.get('/refresh', verifyToken, (req, res) => {
  const newAccessToken = generateRefreshToken({ username: req.user.username, role: req.user.role });
  res.json({
    accessToken: newAccessToken,
    message: 'Nuevo Access Token(REFRESH) generado',
    expiresIn: '1d'
  });
});


// Endpoint de información
app.get('/info', verifyToken,requireRole('admin'), (req, res) => {
  res.json({
    service: 'API de suma con autenticación JWT',
    user: req.user.username,
    endpoints: [
      { path: '/login', method: 'POST', description: 'Autenticación de usuario y generación de token' },
      { path: '/sum', method: 'GET', description: 'Obtiene dos números aleatorios y devuelve su suma' },
      { path: '/info', method: 'GET', description: 'Información sobre la API' }
    ]
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});