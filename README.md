# Maia

Personalized training app based on menstrual cycle.

## Project Structure

This project consists of two main parts:

1. **Frontend**: React Native mobile app with Expo
2. **Backend**: Node.js API with Fastify

## Technologies

- **Frontend**: React Native with Expo
- **Backend**: Node.js with Fastify
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT and bcrypt
- **Notifications**: Firebase Cloud Messaging
- **Deployment**: Railway

## Setup

1. Install dependencies:

   ```bash
   npm run setup
   ```

2. Copy environment files:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Start PostgreSQL locally:

   ```bash
   npm run db:up
   ```

4. Generate and apply database migrations:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

## Run with Docker

Start PostgreSQL, the Fastify API, and the Expo Web app:

```bash
docker-compose up --build
```

Open the mobile layout in a browser at `http://localhost:8082`. The API health endpoint is
available through the preview gateway at `http://localhost:8082/health`, and PostgreSQL is exposed
on port `5432`. Compose applies the versioned Drizzle migrations before starting the API. The
one-shot `migrate` service showing `Exit 0` after startup is expected.

Useful Docker commands:

```bash
docker-compose ps
docker-compose logs -f frontend backend
docker-compose down
```

For Expo Go or a native emulator, keep PostgreSQL/backend in Docker and run Expo on the host:

```bash
docker-compose up -d postgres backend
cd frontend
npm run start
```

Scan the QR code with Expo Go. Press `a` for an Android emulator or `i` for the iOS Simulator
(macOS only). Android Emulator API calls must use `http://10.0.2.2:3000`; a physical phone must
use the computer's LAN IP instead of `localhost`.

## Folder Structure

- `/frontend` - React Native mobile application
- `/backend` - Node.js API server
- `/docs` - Project documentation

## Useful Checks

```bash
npm --prefix frontend exec expo-doctor
npm --prefix backend run db:generate
npm --prefix backend audit --omit=dev
npm --prefix frontend audit --omit=dev
```

## Tests frontend

Les tests frontend couvrent la logique unitaire et les interactions UI critiques (boutons,
navigation et retours d'erreur de l'API). Toute fonctionnalité modifiée doit adapter les deux
niveaux de tests concernés.

```bash
npm --prefix frontend test
npm --prefix frontend run test:ui
```
