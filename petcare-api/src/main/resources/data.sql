INSERT INTO clientes (nombre, telefono, email)
SELECT 'María González', '+56911111111', 'maria@example.com'
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE email = 'maria@example.com');

INSERT INTO clientes (nombre, telefono, email)
SELECT 'Pedro Muñoz', '+56922222222', 'pedro@example.com'
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE email = 'pedro@example.com');

INSERT INTO veterinarios (nombre, especialidad)
SELECT 'Dra. Camila Rojas', 'Medicina general'
WHERE NOT EXISTS (SELECT 1 FROM veterinarios WHERE nombre = 'Dra. Camila Rojas');

INSERT INTO veterinarios (nombre, especialidad)
SELECT 'Dr. Tomás Silva', 'Cirugía'
WHERE NOT EXISTS (SELECT 1 FROM veterinarios WHERE nombre = 'Dr. Tomás Silva');

INSERT INTO mascotas (cliente_id, nombre, especie, raza, fecha_nacimiento, peso)
SELECT c.id, 'Luna', 'Perro', 'Mestiza', DATE '2021-05-10', 12.5
FROM clientes c
WHERE c.email = 'maria@example.com'
AND NOT EXISTS (SELECT 1 FROM mascotas m WHERE m.cliente_id = c.id AND m.nombre = 'Luna');

INSERT INTO mascotas (cliente_id, nombre, especie, raza, fecha_nacimiento, peso)
SELECT c.id, 'Nala', 'Perro', 'Labrador', DATE '2020-01-15', 28.0
FROM clientes c
WHERE c.email = 'maria@example.com'
AND NOT EXISTS (SELECT 1 FROM mascotas m WHERE m.cliente_id = c.id AND m.nombre = 'Nala');

INSERT INTO mascotas (cliente_id, nombre, especie, raza, fecha_nacimiento, peso)
SELECT c.id, 'Milo', 'Gato', 'Siamés', DATE '2022-08-03', 4.2
FROM clientes c
WHERE c.email = 'pedro@example.com'
AND NOT EXISTS (SELECT 1 FROM mascotas m WHERE m.cliente_id = c.id AND m.nombre = 'Milo');

INSERT INTO reservas (mascota_id, veterinario_id, fecha, hora, estado)
SELECT m.id, v.id, DATE '2026-11-21', TIME '10:00:00', 'PENDIENTE'
FROM mascotas m, veterinarios v
WHERE m.nombre = 'Luna' AND v.nombre = 'Dra. Camila Rojas'
AND NOT EXISTS (SELECT 1 FROM reservas r WHERE r.mascota_id = m.id AND r.fecha = DATE '2026-11-21' AND r.hora = TIME '10:00:00');

INSERT INTO reservas (mascota_id, veterinario_id, fecha, hora, estado)
SELECT m.id, v.id, DATE '2026-11-22', TIME '11:30:00', 'CONFIRMADA'
FROM mascotas m, veterinarios v
WHERE m.nombre = 'Milo' AND v.nombre = 'Dr. Tomás Silva'
AND NOT EXISTS (SELECT 1 FROM reservas r WHERE r.mascota_id = m.id AND r.fecha = DATE '2026-11-22' AND r.hora = TIME '11:30:00');

INSERT INTO reservas (mascota_id, veterinario_id, fecha, hora, estado)
SELECT m.id, v.id, DATE '2026-11-18', TIME '09:00:00', 'ATENDIDA'
FROM mascotas m, veterinarios v
WHERE m.nombre = 'Luna' AND v.nombre = 'Dra. Camila Rojas'
AND NOT EXISTS (SELECT 1 FROM reservas r WHERE r.mascota_id = m.id AND r.fecha = DATE '2026-11-18' AND r.hora = TIME '09:00:00');

INSERT INTO atenciones (reserva_id, diagnostico, tratamiento, medicamentos, fecha_registro)
SELECT r.id, 'Dermatitis alérgica', 'Baño medicado y control en 15 días', 'Amoxicilina 10mg/kg cada 12h', TIMESTAMP '2026-11-18 09:30:00'
FROM reservas r
JOIN mascotas m ON m.id = r.mascota_id
WHERE m.nombre = 'Luna' AND r.fecha = DATE '2026-11-18' AND r.hora = TIME '09:00:00'
AND NOT EXISTS (SELECT 1 FROM atenciones a WHERE a.reserva_id = r.id);
