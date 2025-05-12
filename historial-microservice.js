const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.HISTORIAL_PORT;

app.use(express.json());

let historial = [];

//*                                         POST /guardar → Recibe y guarda una operación en el historial
app.post('/guardar', (req, res) => {
  const { user, operation, result, timestamp } = req.body;

  if (!user || !operation || !result || !timestamp) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  //objeto de registro
  const registro = {
    user,
    operation,
    result,
    timestamp
  };

  //agregamos el registro
  historial.push(registro);

  res.json({ message: 'Historial guardado correctamente' });
});

//*                                 GET /historial → Devuelve el contenido del historial (en memoria)
app.get('/historial', (req, res) => {
  if (historial.length === 0) {
    return res.status(404).json({ error: 'No hay historial disponible' });
  }

  //convierte el historial en formato JSON
  res.json(historial);
});

app.listen(PORT, () => {
  console.log(`Microservicio de historial corriendo en http://localhost:${PORT}`);
});
