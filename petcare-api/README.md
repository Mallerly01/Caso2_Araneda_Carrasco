# PetCare — Sistema principal (PC1)

Aplicación Spring Boot con arquitectura Controller-Service-Repository, base de datos H2, API REST y frontend web.

## Requisitos

- Java 17.
- Gradle Wrapper incluido en el proyecto.

## Ejecución

```powershell
.\gradlew.bat bootRun
```

En Linux o macOS:

```bash
./gradlew bootRun
```

- Frontend: `http://localhost:8080`
- API: `http://localhost:8080/api`
- Consola H2: `http://localhost:8080/h2-console`
- Base de datos: `./data/petcare`

## Integración con la API Node

La URL base se configura con `INTEGRATIONS_BASE_URL`:

```powershell
$env:INTEGRATIONS_BASE_URL="http://192.168.1.10:3001"
.\gradlew.bat bootRun
```

El valor por defecto es `http://localhost:3001`.

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clientes` | Listar clientes |
| POST | `/api/clientes` | Registrar cliente |
| GET | `/api/clientes/{id}` | Obtener cliente |
| PUT | `/api/clientes/{id}` | Modificar cliente |
| DELETE | `/api/clientes/{id}` | Eliminar cliente |
| GET | `/api/clientes/{id}/mascotas` | Listar mascotas del cliente |
| POST | `/api/clientes/{id}/mascotas` | Registrar mascota |
| GET | `/api/mascotas` | Listar mascotas |
| GET | `/api/mascotas/{id}` | Obtener mascota |
| PUT | `/api/mascotas/{id}` | Modificar mascota |
| DELETE | `/api/mascotas/{id}` | Eliminar mascota |
| GET | `/api/mascotas/{id}/atenciones` | Historial de la mascota |
| GET | `/api/veterinarios` | Listar veterinarios |
| GET | `/api/reservas` | Listar reservas con filtros opcionales |
| POST | `/api/reservas` | Solicitar reserva |
| GET | `/api/reservas/{id}` | Obtener reserva |
| PUT | `/api/reservas/{id}` | Modificar fecha, hora o veterinario |
| PATCH | `/api/reservas/{id}/estado` | Cambiar estado |
| GET | `/api/atenciones` | Listar atenciones |
| POST | `/api/atenciones` | Registrar atención |
| GET | `/api/integraciones/medicamentos` | Consultar medicamentos vía API Node |
| GET | `/api/integraciones/clinica` | Consultar ubicación vía API Node |
| GET | `/api/integraciones/notificaciones` | Listar notificaciones vía API Node |

## Reglas de negocio

- Una reserva duplicada se evalúa por veterinario, fecha y hora, considerando estados PENDIENTE y CONFIRMADA.
- Transiciones válidas por cambio de estado: PENDIENTE → CONFIRMADA o CANCELADA; CONFIRMADA → CANCELADA.
- Una atención solo se registra para una reserva CONFIRMADA y la deja en ATENDIDA.
- No se elimina un cliente con mascotas ni una mascota con reservas.
- Al confirmar o cancelar una reserva se envía una notificación a la API Node. Si la API no está disponible, el cambio de estado se completa y la falla queda en el log.

## Pruebas

```powershell
.\gradlew.bat test
```

## CSS del frontend

El CSS ya está compilado en `src/main/resources/static/app.css`. Si se modifican clases de Tailwind:

```powershell
npm install
npm run css
```
