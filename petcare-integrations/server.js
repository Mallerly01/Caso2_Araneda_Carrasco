require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const medicamentos = [
  { id: '1', nombre: 'Amoxicilina', principioActivo: 'Amoxicilina', dosis: '10mg/kg cada 12h' },
  { id: '2', nombre: 'Carprofeno', principioActivo: 'Carprofeno', dosis: '2mg/kg cada 12h' },
  { id: '3', nombre: 'Fipronil', principioActivo: 'Fipronil', dosis: '1 pipeta mensual' }
];

const clinica = { nombre: 'PetCare Chillan', lat: -36.6065, lng: -72.1034, direccion: 'Av. Principal 123' };
const notificaciones = [];

app.get('/api/medicamentos', (req, res) => {
  const q = (req.query.nombre || '').toLowerCase();
  if (!q) return res.json(medicamentos);
  res.json(medicamentos.filter((m) => m.nombre.toLowerCase().includes(q)));
});

app.get('/api/clinica/ubicacion', (req, res) => {
  res.json(clinica);
});

app.post('/api/notificaciones', (req, res) => {
  const { destinatario, tipoEvento, mensaje } = req.body || {};
  if (!destinatario || !tipoEvento || !mensaje) {
    return res.status(400).json({ error: 'Faltan destinatario, tipoEvento o mensaje' });
  }
  const n = { id: String(notificaciones.length + 1), destinatario, tipoEvento, mensaje, fecha: new Date().toISOString() };
  notificaciones.push(n);
  console.log('Notificacion:', n);
  res.json({ ok: true, id: n.id });
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, '0.0.0.0', () => console.log('Integrations en puerto ' + PORT));
