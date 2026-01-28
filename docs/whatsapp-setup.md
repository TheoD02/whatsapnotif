# Configuration WhatsApp

Ce guide explique comment configurer WhatsApp pour envoyer des notifications.

## Options disponibles

| Option | Usage | Prérequis |
|--------|-------|-----------|
| **Mock** | Développement/Test | Aucun |
| **Baileys** | Développement | Node.js, compte WhatsApp personnel |
| **Cloud API** | Production | Compte Meta Business, numéro vérifié |

## Option 1 : Mock (Développement)

Mode simulation qui log les messages sans les envoyer.

```env
MESSAGING_CHANNEL=mock
```

Les messages apparaissent dans les logs Laravel.

## Option 2 : Baileys (Développement)

Utilise votre compte WhatsApp personnel via le service Baileys.

### Installation du service

```bash
cd whatsapp-service
npm install
npm start
```

### Configuration

```env
MESSAGING_CHANNEL=whatsapp_baileys
WHATSAPP_BAILEYS_URL=http://localhost:3001
```

### Connexion

1. Accédez à **Admin > WhatsApp**
2. Scannez le QR code avec WhatsApp sur votre téléphone
3. Le statut passe à "Connecté"

### Limitations

- Utilise votre numéro personnel
- Risque de ban si envoi massif
- Non recommandé pour la production

## Option 3 : Cloud API (Production)

L'API officielle de Meta pour WhatsApp Business.

### Prérequis

1. Compte Meta Business
2. Application Meta avec WhatsApp activé
3. Numéro de téléphone vérifié

### Étapes de configuration

#### 1. Créer une application Meta

1. Allez sur [developers.facebook.com](https://developers.facebook.com)
2. Créez une nouvelle application de type "Business"
3. Ajoutez le produit "WhatsApp"

#### 2. Configurer le numéro

1. Dans WhatsApp > Getting Started
2. Ajoutez un numéro de téléphone
3. Vérifiez-le par SMS/appel

#### 3. Obtenir les credentials

- **Phone Number ID** : WhatsApp > Getting Started > Phone Number ID
- **Access Token** : Générez un token permanent ou utilisez le token temporaire

#### 4. Configurer l'application

```env
MESSAGING_CHANNEL=whatsapp
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxx
```

### Templates de messages

Pour les messages marketing/notifications, vous devez créer des templates approuvés :

1. WhatsApp > Message Templates
2. Créez un template
3. Attendez l'approbation (24-48h)
4. Utilisez le template dans l'application

### Webhooks (optionnel)

Pour recevoir les statuts de livraison :

1. WhatsApp > Configuration > Webhook
2. URL : `https://votre-domaine.com/api/whatsapp/webhook`
3. Vérifiez avec le token configuré

## Comparaison des options

| Critère | Mock | Baileys | Cloud API |
|---------|------|---------|-----------|
| Coût | Gratuit | Gratuit | Payant |
| Setup | Instantané | 5 min | 1-2 jours |
| Fiabilité | N/A | Moyenne | Haute |
| Volume | N/A | Limité | Élevé |
| Production | Non | Non | Oui |

## Résolution des problèmes

### Baileys : QR code ne s'affiche pas

```bash
# Vérifiez que le service tourne
curl http://localhost:3001/status

# Redémarrez le service
cd whatsapp-service && npm start
```

### Baileys : Déconnexion fréquente

WhatsApp peut déconnecter si :
- Plusieurs sessions actives
- Envoi trop rapide
- Compte signalé

Solution : Espacer les envois, utiliser Cloud API pour la production.

### Cloud API : Message non délivré

Vérifiez :
- Le numéro est au format international (+33...)
- Le destinataire a WhatsApp
- Le template est approuvé (si applicable)
- Le token n'est pas expiré
