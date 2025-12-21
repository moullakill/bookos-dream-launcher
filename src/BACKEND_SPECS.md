# BookOS Backend Specifications

## Overview
Backend auto-hébergé sur la liseuse, accessible via `http://localhost:8080`

## API REST Endpoints

### État Global
```
GET  /api/state          - Récupère l'état complet (apps, books, settings)
POST /api/state          - Sauvegarde l'état complet
```

### Applications
```
GET    /api/apps         - Liste toutes les applications
POST   /api/apps         - Crée une nouvelle application
PUT    /api/apps/:id     - Met à jour une application
DELETE /api/apps/:id     - Supprime une application
```

### Livres
```
GET    /api/books        - Liste tous les livres
POST   /api/books        - Ajoute un nouveau livre
PUT    /api/books/:id    - Met à jour un livre (progression, etc.)
DELETE /api/books/:id    - Supprime un livre
```

### Paramètres
```
GET  /api/settings       - Récupère les paramètres
PUT  /api/settings       - Met à jour les paramètres
POST /api/settings/lock  - Vérifie le code de verrouillage
```

### Fichiers/Images
```
POST /api/upload         - Upload une image (couverture, fond, icône)
GET  /api/files/:id      - Récupère un fichier uploadé
```

## Modèles de Données

### App
```typescript
{
  id: string;           // UUID
  name: string;         // Nom affiché
  url: string;          // URL ou chemin local
  icon: string;         // Emoji ou URL d'image
  isPath: boolean;      // true = chemin local, false = URL web
  category?: string;    // Catégorie optionnelle
  createdAt: string;    // ISO date
  updatedAt: string;    // ISO date
}
```

### Book
```typescript
{
  id: string;           // UUID
  title: string;        // Titre du livre
  author: string;       // Auteur
  cover?: string;       // URL de la couverture
  openWith: 'url' | 'app';  // Méthode d'ouverture
  url?: string;         // URL si openWith='url'
  appId?: string;       // ID app si openWith='app'
  progress?: number;    // 0-100
  lastRead?: string;    // ISO date
  addedAt: string;      // ISO date
}
```

### Settings
```typescript
{
  theme: string;            // 'paper' | 'dark' | 'sepia' | 'ocean'
  backgroundImage?: string; // URL de l'image de fond
  lockCode?: string;        // Code PIN hashé (4 chiffres)
  isLocked: boolean;        // État du verrouillage
}
```

## Sécurité

### Code de Verrouillage
- Le code PIN est hashé côté backend (bcrypt recommandé)
- L'endpoint `/api/settings/lock` vérifie le code et retourne un token de session
- Le token expire après 24h d'inactivité

### Headers CORS
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Stockage

### Base de données recommandée
- SQLite pour la simplicité (fichier unique)
- Tables: `apps`, `books`, `settings`

### Fichiers
- Stockage local dans `/data/uploads/`
- Nommage: `{uuid}.{extension}`

## Exemple d'implémentation (Node.js/Express)

```javascript
const express = require('express');
const sqlite3 = require('better-sqlite3');
const cors = require('cors');

const app = express();
const db = sqlite3('bookos.db');

app.use(cors());
app.use(express.json());

// Initialisation des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    isPath INTEGER DEFAULT 0,
    category TEXT,
    createdAt TEXT,
    updatedAt TEXT
  );
  
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover TEXT,
    openWith TEXT,
    url TEXT,
    appId TEXT,
    progress INTEGER DEFAULT 0,
    lastRead TEXT,
    addedAt TEXT
  );
  
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Routes...
app.get('/api/state', (req, res) => {
  const apps = db.prepare('SELECT * FROM apps').all();
  const books = db.prepare('SELECT * FROM books').all();
  const settingsRows = db.prepare('SELECT * FROM settings').all();
  const settings = Object.fromEntries(
    settingsRows.map(r => [r.key, JSON.parse(r.value)])
  );
  res.json({ apps, books, settings });
});

app.listen(8080, () => {
  console.log('BookOS Backend running on http://localhost:8080');
});
```

## Notes d'implémentation

1. **Performance**: Utiliser des index sur `lastRead` pour le tri des livres
2. **Backup**: Implémenter un export JSON de toutes les données
3. **Migration**: Prévoir un système de versioning du schéma DB
4. **Logs**: Logger les erreurs dans `/data/logs/`
