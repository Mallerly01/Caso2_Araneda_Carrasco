# Caso2 Araneda Carrasco - PetCare (monorepo 2 carpetas)

Un repo, dos PCs en la misma red.

## Carpetas

- `petcare-api/` - Spring Boot (PC1, puerto 8080). Viene del proyecto original.
- `petcare-integrations/` - Node + Express (PC2, puerto 3001). Las 3 APIs externas.

## Como correrlo

PC1:
```bash
cd petcare-api
./gradlew bootRun
```

PC2:
```bash
cd petcare-integrations
npm install
npm run dev
```

Spring consume a Node con la env `INTEGRATIONS_BASE_URL` (ej: `http://192.168.1.10:3001`).
En la misma máquina usar `http://localhost:3001`.

## Falta (cuando suban el resto)

- Models + services en Spring (cliente, mascota, reserva, atencion).
- Conectar `firestore.sample.json` a Firestore real con firebase-admin (solo en Node).
