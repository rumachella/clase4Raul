const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.HISTORIAL_PORT;
const connection = require('./db');





app.use(express.json());

let historial = [];

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

  connection.query(query, [user, operation, result, timestamp], (err, resultDb) => {
    if (err) {
      console.error('Error al guardar en la base de datos:', err);
      return res.status(500).json({ error: 'Error al guardar en la base de datos' });
    }

    const registro = { user, operation, result, timestamp };
    historial.push(registro);

    res.json({ message: 'Operación guardada correctamente' });
  });
});

//*                                 GET /historial → Devuelve el contenido del historial (en memoria)
app.get('/historial', (req, res) => {
  



  //convierte el historial en formato JSON
  res.json(historial);
});

app.listen(PORT, () => {
  console.log(`Microservicio de historial corriendo en http://localhost:${PORT}`);
});
