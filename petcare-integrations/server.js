require('dotenv').config();
const express = require('express');
const cors = require('cors');
const seed = require('./firestore.sample.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const medicamentos = seed.medicamentos;
const clinica = seed.clinica.sede_central;
const notificaciones = seed.notificaciones_log.map((notificacion, indice) => ({
  id: String(indice + 1),
  ...notificacion
}));

app.get('/api/medicamentos', (req, res) => {
  const q = String(req.query.nombre || '').trim().toLowerCase();
  if (!q) return res.json(medicamentos);
  res.json(medicamentos.filter((medicamento) => medicamento.nombre.toLowerCase().includes(q)));
});

app.get('/api/clinica/ubicacion', (req, res) => {
  res.json(clinica);
});

app.get('/api/notificaciones', (req, res) => {
  res.json(notificaciones);
});

app.post('/api/notificaciones', (req, res) => {
  const { destinatario, tipoEvento, mensaje } = req.body || {};
  if (!destinatario || !tipoEvento || !mensaje) {
    return res.status(400).json({ error: 'Faltan destinatario, tipoEvento o mensaje' });
  }
  if (!['CONFIRMADA', 'CANCELADA'].includes(tipoEvento)) {
    return res.status(400).json({ error: 'tipoEvento debe ser CONFIRMADA o CANCELADA' });
  }
  const notificacion = {
    id: String(notificaciones.length + 1),
    destinatario,
    tipoEvento,
    mensaje,
    fecha: new Date().toISOString()
  };
  notificaciones.push(notificacion);
  console.log('Notificacion:', notificacion);
  res.json({ ok: true, id: notificacion.id });
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, '0.0.0.0', () => console.log('Integrations en puerto ' + PORT));
