const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.HISTORIAL_PORT;
const connection = require('./db');
app.use(express.json());


//*                                         POST /guardar → Recibe y guarda una operación en el historial
app.post('/guardar', (req, res) => {
  const { user, operation, result, timestamp } = req.body;

  if (!user || !operation || !result || !timestamp) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const query = `
    INSERT INTO operaciones (usuario, operacion, resultado, fecha)
    VALUES (?, ?, ?, ?)
  `;
    console.log('BODY RECIBIDO:', req.body);

  connection.query(query, [user, operation, result, timestamp], (err, resultDb) => {
    if (err) {
      console.error('Error al guardar en la base de datos:', err);
      return res.status(500).json({ error: 'Error al guardar en la base de datos' });
    }

    // const registro = { user, operation, result, timestamp };

    res.json({ message: 'Operación guardada correctamente' });
  });
});

//*                                 GET /historial → Devuelve el contenido del historial en la bd
//?                                 Solo el admin puede consultar el historial

const { verifyToken, requireRole } = require('./auth.js');
app.get('/historial', verifyToken, requireRole('admin'), (req, res) => {
  const query = 'SELECT * FROM operaciones ORDER BY fecha DESC'; 

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener historial:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No hay historial disponible' });
    }

    res.json(results);
  });
});


app.listen(PORT, () => {
  console.log(`Microservicio de historial corriendo en http://localhost:${PORT}`);
});
