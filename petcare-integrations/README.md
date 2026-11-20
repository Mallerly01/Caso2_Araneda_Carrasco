# PetCare — API de integraciones (PC2)

API propia desarrollada con Node.js y Express. Se ejecuta en el segundo equipo o en la misma red y es consumida por Spring Boot. No depende de APIs de terceros ni de claves de servicio.

## Requisitos

- Node.js 18 o superior.

## Instalación y ejecución

```bash
npm install
npm start
```

Para desarrollo con recarga automática:

```bash
npm run dev
```

El puerto por defecto es `3001` y se puede cambiar con la variable `PORT`.

## Verificación

```bash
curl http://localhost:3001/health
```

Respuesta esperada:

```json
{ "ok": true }
```

## Endpoints

### Consultar medicamentos

```http
GET /api/medicamentos?nombre=amox
```

Sin el parámetro `nombre` se devuelven todos los medicamentos. La búsqueda es por coincidencia parcial y no distingue mayúsculas de minúsculas.

```json
[
  {
    "id": "1",
    "nombre": "Amoxicilina",
    "principioActivo": "Amoxicilina",
    "dosis": "10mg/kg cada 12h"
  }
]
```

### Consultar ubicación de la clínica

```http
GET /api/clinica/ubicacion
```

```json
{
  "nombre": "PetCare Chillan",
  "lat": -36.6065,
  "lng": -72.1034,
  "direccion": "Av. Principal 123"
}
```

### Enviar una notificación

```http
POST /api/notificaciones
Content-Type: application/json
```

```json
{
  "destinatario": "cliente@mail.com",
  "tipoEvento": "CONFIRMADA",
  "mensaje": "Hora confirmada para el 21/11/2026 a las 10:00"
}
```

`tipoEvento` acepta `CONFIRMADA` o `CANCELADA`.

Respuesta:

```json
{ "ok": true, "id": "2" }
```

### Listar notificaciones registradas

```http
GET /api/notificaciones
```

```json
[
  {
    "id": "1",
    "destinatario": "cliente@mail.com",
    "tipoEvento": "CONFIRMADA",
    "mensaje": "Hora confirmada",
    "fecha": "2026-11-18T10:00:00Z"
  }
]
```

## Datos iniciales

Los medicamentos, la ubicación y el registro inicial de notificaciones se cargan desde `firestore.sample.json`. El archivo sirve como semilla si se conecta Firestore.

## Firestore

Firestore está autorizado para el proyecto. Para persistir los datos:

1. Agregar `firebase-admin` al proyecto.
2. Configurar `GOOGLE_APPLICATION_CREDENTIALS` con la ruta de la clave de servicio.
3. Mantener la clave fuera del repositorio.
4. Sembrar las colecciones `medicamentos`, `clinica` y `notificaciones_log` desde `firestore.sample.json`.

La entrega funciona sin Firestore: los datos viven en memoria y se reinician al detener el proceso.

## Red local

La API escucha en `0.0.0.0`, por lo que es accesible desde el otro equipo usando la IP del PC2:

```text
http://IP-PC2:3001/api/medicamentos
```

En Windows, habilitar el puerto en el firewall:

```powershell
New-NetFirewallRule -DisplayName "PetCare Node 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto HTTP de la API | `3001` |
