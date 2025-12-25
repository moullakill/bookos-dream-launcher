# BookOS Backend Specifications

## Overview
Backend auto-hébergé sur la liseuse, accessible via `http://localhost:8080`

## API REST Endpoints

### État Global
```
GET  /api/state          - Récupère l'état complet (apps, books, settings, secrets)
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

### Secrets (Coffre-fort)
```
GET    /api/secrets      - Liste tous les secrets
POST   /api/secrets      - Crée un nouveau secret
PUT    /api/secrets/:id  - Met à jour un secret
DELETE /api/secrets/:id  - Supprime un secret
```

### Paramètres
```
GET  /api/settings       - Récupère les paramètres
PUT  /api/settings       - Met à jour les paramètres
POST /api/settings/lock  - Vérifie le code de verrouillage
```

### Ouverture de contenus (NOUVEAU)
```
POST /api/open           - Demande au backend d'ouvrir une URL ou un chemin
```
**Body:**
```json
{
  "type": "app" | "book" | "secret" | "url",
  "url": "string",
  "isPath": boolean
}
```
**Description:** Le backend reçoit cette requête et ouvre l'URL ou le chemin d'accès pour l'utilisateur sur la machine hôte. Si `isPath` est `true`, le backend ouvre le chemin local. Si `false`, il ouvre l'URL dans le navigateur par défaut.

### Exécution de commandes
```
POST /api/execute        - Exécute une commande shell
```
**Body:**
```json
{
  "command": "string"
}
```
**Response:**
```json
{
  "success": boolean,
  "output": "string",
  "error": "string"
}
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
  createdAt?: string;   // ISO date
  updatedAt?: string;   // ISO date
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
  genre?: string;       // Genre du livre
  tags?: string[];      // Tags
  rating?: number;      // 1-5
  isFavorite?: boolean; // Favori
}
```

### SecretItem (NOUVEAU)
```typescript
{
  id: string;           // UUID
  name: string;         // Nom affiché
  url: string;          // URL ou chemin d'accès
  type: 'link' | 'app'; // Type de secret
  iconType: 'emoji' | 'image'; // Type d'icône
  icon: string;         // Emoji ou URL d'image
}
```

### Settings
```typescript
{
  theme: string;            // 'paper' | 'dark' | 'sepia' | 'ocean'
  backgroundImage?: string; // URL de l'image de fond
  backgroundBlur: number;   // 0-20
  appIconSize: number;      // 48-96
  bookCardSize: number;     // 60-120
  lockCode?: string;        // Code PIN hashé (4 chiffres)
  isLocked: boolean;        // État du verrouillage
}
```

### BookOSState (État complet)
```typescript
{
  apps: App[];
  books: Book[];
  settings: Settings;
  secrets?: SecretItem[];
}
```

### ApiResponse (Réponse standard)
```typescript
{
  success: boolean;
  data?: T;
  error?: string;
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
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Stockage

### Base de données recommandée
- SQLite pour la simplicité (fichier unique)
- Tables: `apps`, `books`, `secrets`, `settings`

### Fichiers
- Stockage local dans `/data/uploads/`
- Nommage: `{uuid}.{extension}`

## Exemple d'implémentation (Node.js/Express)

```javascript
const express = require('express');
const sqlite3 = require('better-sqlite3');
const cors = require('cors');
const { exec } = require('child_process');
const open = require('open');

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
    addedAt TEXT,
    genre TEXT,
    tags TEXT,
    rating INTEGER,
    isFavorite INTEGER DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS secrets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'link',
    iconType TEXT DEFAULT 'emoji',
    icon TEXT
  );
  
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// ============= État Global =============

app.get('/api/state', (req, res) => {
  const apps = db.prepare('SELECT * FROM apps').all();
  const books = db.prepare('SELECT * FROM books').all();
  const secrets = db.prepare('SELECT * FROM secrets').all();
  const settingsRows = db.prepare('SELECT * FROM settings').all();
  const settings = Object.fromEntries(
    settingsRows.map(r => [r.key, JSON.parse(r.value)])
  );
  res.json({ apps, books, secrets, settings });
});

app.post('/api/state', (req, res) => {
  const { apps, books, secrets, settings } = req.body;
  
  // Clear and re-insert apps
  db.prepare('DELETE FROM apps').run();
  const insertApp = db.prepare('INSERT INTO apps VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  apps.forEach(app => {
    insertApp.run(app.id, app.name, app.url, app.icon, app.isPath ? 1 : 0, 
                  app.category, app.createdAt, app.updatedAt);
  });
  
  // Clear and re-insert books
  db.prepare('DELETE FROM books').run();
  const insertBook = db.prepare('INSERT INTO books VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  books.forEach(book => {
    insertBook.run(book.id, book.title, book.author, book.cover, book.openWith,
                   book.url, book.appId, book.progress, book.lastRead, book.addedAt,
                   book.genre, JSON.stringify(book.tags), book.rating, book.isFavorite ? 1 : 0);
  });
  
  // Clear and re-insert secrets
  db.prepare('DELETE FROM secrets').run();
  const insertSecret = db.prepare('INSERT INTO secrets VALUES (?, ?, ?, ?, ?, ?)');
  (secrets || []).forEach(secret => {
    insertSecret.run(secret.id, secret.name, secret.url, secret.type, secret.iconType, secret.icon);
  });
  
  // Update settings
  const insertSetting = db.prepare('INSERT OR REPLACE INTO settings VALUES (?, ?)');
  Object.entries(settings).forEach(([key, value]) => {
    insertSetting.run(key, JSON.stringify(value));
  });
  
  res.json({ success: true });
});

// ============= Ouverture de contenus =============

app.post('/api/open', async (req, res) => {
  const { type, url, isPath } = req.body;
  
  try {
    if (isPath) {
      // Ouvrir un chemin local
      exec(`xdg-open "${url}"`, (error) => {
        if (error) {
          res.json({ success: false, error: error.message });
        } else {
          res.json({ success: true });
        }
      });
    } else {
      // Ouvrir une URL
      await open(url);
      res.json({ success: true });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// ============= Exécution de commandes =============

app.post('/api/execute', (req, res) => {
  const { command } = req.body;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      res.json({ success: false, error: stderr || error.message });
    } else {
      res.json({ success: true, output: stdout });
    }
  });
});

// ============= Applications CRUD =============

app.get('/api/apps', (req, res) => {
  const apps = db.prepare('SELECT * FROM apps').all();
  res.json(apps);
});

app.post('/api/apps', (req, res) => {
  const app = req.body;
  const id = Date.now().toString();
  const now = new Date().toISOString();
  
  db.prepare('INSERT INTO apps VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, app.name, app.url, app.icon, app.isPath ? 1 : 0, 
    app.category, now, now
  );
  
  res.json({ ...app, id, createdAt: now, updatedAt: now });
});

app.put('/api/apps/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const now = new Date().toISOString();
  
  const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);
  
  db.prepare(`UPDATE apps SET ${fields}, updatedAt = ? WHERE id = ?`).run(...values, now, id);
  
  res.json({ success: true });
});

app.delete('/api/apps/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM apps WHERE id = ?').run(id);
  res.json({ success: true });
});

// ============= Livres CRUD =============

app.get('/api/books', (req, res) => {
  const books = db.prepare('SELECT * FROM books').all();
  res.json(books);
});

app.post('/api/books', (req, res) => {
  const book = req.body;
  const id = Date.now().toString();
  const now = new Date().toISOString();
  
  db.prepare('INSERT INTO books VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, book.title, book.author, book.cover, book.openWith,
    book.url, book.appId, book.progress || 0, null, now,
    book.genre, JSON.stringify(book.tags || []), book.rating, book.isFavorite ? 1 : 0
  );
  
  res.json({ ...book, id, addedAt: now });
});

app.put('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);
  
  db.prepare(`UPDATE books SET ${fields} WHERE id = ?`).run(...values, id);
  
  res.json({ success: true });
});

app.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM books WHERE id = ?').run(id);
  res.json({ success: true });
});

// ============= Secrets CRUD =============

app.get('/api/secrets', (req, res) => {
  const secrets = db.prepare('SELECT * FROM secrets').all();
  res.json(secrets);
});

app.post('/api/secrets', (req, res) => {
  const secret = req.body;
  const id = Date.now().toString();
  
  db.prepare('INSERT INTO secrets VALUES (?, ?, ?, ?, ?, ?)').run(
    id, secret.name, secret.url, secret.type, secret.iconType, secret.icon
  );
  
  res.json({ ...secret, id });
});

app.put('/api/secrets/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);
  
  db.prepare(`UPDATE secrets SET ${fields} WHERE id = ?`).run(...values, id);
  
  res.json({ success: true });
});

app.delete('/api/secrets/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM secrets WHERE id = ?').run(id);
  res.json({ success: true });
});

// ============= Paramètres =============

app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value)]));
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  const updates = req.body;
  const insert = db.prepare('INSERT OR REPLACE INTO settings VALUES (?, ?)');
  
  Object.entries(updates).forEach(([key, value]) => {
    insert.run(key, JSON.stringify(value));
  });
  
  res.json({ success: true });
});

app.post('/api/settings/lock', (req, res) => {
  const { code } = req.body;
  const row = db.prepare("SELECT value FROM settings WHERE key = 'lockCode'").get();
  
  if (row) {
    const storedCode = JSON.parse(row.value);
    // En production, utiliser bcrypt.compare
    if (code === storedCode) {
      res.json({ valid: true, token: 'session-token' });
    } else {
      res.json({ valid: false });
    }
  } else {
    res.json({ valid: false });
  }
});

// ============= Upload =============

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: '/data/uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ 
      success: true, 
      data: {
        id: req.file.filename,
        url: `/api/files/${req.file.filename}`
      }
    });
  } else {
    res.json({ success: false, error: 'No file uploaded' });
  }
});

app.get('/api/files/:id', (req, res) => {
  const filePath = path.join('/data/uploads/', req.params.id);
  res.sendFile(filePath);
});

// ============= Démarrage =============

app.listen(8080, () => {
  console.log('BookOS Backend running on http://localhost:8080');
});
```

## Notes d'implémentation

1. **Performance**: Utiliser des index sur `lastRead` pour le tri des livres
2. **Backup**: Implémenter un export JSON de toutes les données
3. **Migration**: Prévoir un système de versioning du schéma DB
4. **Logs**: Logger les erreurs dans `/data/logs/`
5. **Sécurité**: Valider toutes les entrées utilisateur
6. **Mode hors-ligne**: Le frontend supporte un mode hors-ligne avec localStorage comme fallback

## Dépendances Node.js recommandées

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.2.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.0",
    "open": "^9.1.0",
    "bcrypt": "^5.1.1"
  }
}
```
