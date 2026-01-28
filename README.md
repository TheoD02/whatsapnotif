# WhatsApp Hub

Plateforme de notifications multi-canal (WhatsApp & Telegram) avec interface d'administration.

## Fonctionnalités

- **Multi-canal** : Envoi de notifications via WhatsApp et Telegram
- **Gestion des contacts** : Import CSV, groupes, métadonnées personnalisées
- **Templates** : Messages réutilisables avec variables dynamiques
- **Interface Admin** : Gestion complète des utilisateurs, contacts, groupes
- **Interface Opérateur** : Envoi de notifications, historique
- **Temps réel** : Suivi du statut d'envoi en direct (WebSocket)
- **API REST** : Intégration avec vos applications

## Stack technique

- **Backend** : Laravel 12, PHP 8.2+
- **Frontend** : React, TypeScript, Inertia.js, Tailwind CSS, shadcn/ui
- **Base de données** : SQLite (dev) / MySQL / PostgreSQL
- **WebSocket** : Laravel Reverb
- **Messaging** : WhatsApp Cloud API / Baileys, Telegram Bot API

## Installation rapide

```bash
# Cloner et installer
git clone <repo-url>
cd whats
composer install
npm install

# Configuration
cp .env.example .env
php artisan key:generate
php artisan migrate

# Créer un admin
php artisan tinker
> App\Models\User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => bcrypt('password'), 'role' => 'admin', 'status' => 'active']);

# Lancer l'application
composer run dev
```

L'application sera disponible sur `http://localhost:8000`

## Configuration des canaux

### WhatsApp

Deux options disponibles :

1. **WhatsApp Cloud API** (Production) - Voir [docs/whatsapp-setup.md](docs/whatsapp-setup.md)
2. **Baileys** (Développement) - Service Node.js local

### Telegram

Configuration du bot et liaison automatique des contacts via QR code.

Voir [docs/telegram-setup.md](docs/telegram-setup.md)

## Architecture

```
app/
├── Http/Controllers/
│   ├── Admin/          # Contrôleurs admin (users, contacts, groups...)
│   ├── Operator/       # Contrôleurs opérateur (notifications, history)
│   └── Api/            # API REST
├── Models/             # Eloquent models
├── Services/
│   ├── Messaging/      # Canaux (WhatsApp, Telegram, Mock)
│   └── NotificationService.php
└── Events/             # Broadcasting events

resources/js/
├── components/         # Composants React réutilisables
├── layouts/            # Layouts (Admin, Operator)
├── pages/              # Pages Inertia
└── types/              # Types TypeScript
```

## API

L'API permet d'envoyer des notifications depuis vos applications.

```bash
# Créer un token API dans Admin > Tokens API

# Envoyer une notification
curl -X POST https://votre-domaine.com/api/v1/notifications/send \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Bonjour {{nom}} !",
    "contact_ids": [1, 2, 3]
  }'
```

Voir [docs/api.md](docs/api.md) pour la documentation complète.

## Scripts

```bash
composer run dev      # Lancer tous les services (server, queue, reverb, vite)
composer run test     # Lancer les tests
npm run build         # Build production
```

## Documentation

- [Installation détaillée](docs/installation.md)
- [Configuration WhatsApp](docs/whatsapp-setup.md)
- [Configuration Telegram](docs/telegram-setup.md)
- [API Reference](docs/api.md)

## Licence

MIT
