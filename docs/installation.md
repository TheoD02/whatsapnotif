# Installation

Guide d'installation détaillé de WhatsApp Hub.

## Prérequis

- PHP 8.2+
- Composer
- Node.js 18+
- npm ou pnpm

## Installation

### 1. Cloner le projet

```bash
git clone <repo-url>
cd whats
```

### 2. Installer les dépendances

```bash
composer install
npm install
```

### 3. Configuration environnement

```bash
cp .env.example .env
php artisan key:generate
```

### 4. Base de données

Par défaut, l'application utilise SQLite :

```bash
touch database/database.sqlite
php artisan migrate
```

Pour MySQL/PostgreSQL, modifiez `.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=whatsapp_hub
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Créer un administrateur

```bash
php artisan tinker
```

```php
App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@example.com',
    'password' => bcrypt('votre_mot_de_passe'),
    'role' => 'admin',
    'status' => 'active',
]);
```

### 6. Lancer l'application

```bash
composer run dev
```

Cette commande lance simultanément :
- Serveur Laravel (port 8000)
- Queue worker
- Laravel Reverb (WebSocket, port 8085)
- Vite (hot reload)
- Pail (logs)

Accédez à `http://localhost:8000`

## Configuration des services

### Variables d'environnement principales

```env
# Application
APP_NAME="WhatsApp Hub"
APP_URL=http://localhost:8000

# Canal de messaging par défaut
MESSAGING_CHANNEL=mock  # mock | whatsapp | whatsapp_baileys

# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=

# WhatsApp Baileys (local)
WHATSAPP_BAILEYS_URL=http://localhost:3001

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=

# WebSocket (Reverb)
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
REVERB_HOST=localhost
REVERB_PORT=8085
REVERB_SERVER_PORT=8085
REVERB_SCHEME=http
```

## Déploiement en production

### 1. Build des assets

```bash
npm run build
```

### 2. Optimisation Laravel

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3. Queue worker

Utilisez Supervisor pour maintenir le worker actif :

```ini
[program:whatsapp-hub-worker]
command=php /var/www/whatsapp-hub/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=1
```

### 4. WebSocket (Reverb)

```ini
[program:whatsapp-hub-reverb]
command=php /var/www/whatsapp-hub/artisan reverb:start
autostart=true
autorestart=true
user=www-data
```

### 5. Scheduler (optionnel)

Ajoutez au crontab :

```cron
* * * * * cd /var/www/whatsapp-hub && php artisan schedule:run >> /dev/null 2>&1
```

## Mise à jour

```bash
git pull
composer install
npm install
npm run build
php artisan migrate
php artisan config:cache
php artisan route:cache
```
