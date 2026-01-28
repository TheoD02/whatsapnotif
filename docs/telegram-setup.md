# Configuration Telegram

Ce guide explique comment configurer le canal Telegram pour envoyer des notifications.

## 1. Créer un bot Telegram

1. Ouvrez Telegram et cherchez **@BotFather**
2. Envoyez la commande `/newbot`
3. Donnez un **nom** à votre bot (ex: "Mon App Notifications")
4. Donnez un **username** unique finissant par `bot` (ex: `monapp_notif_bot`)
5. BotFather vous répond avec le token API :

```
Use this token to access the HTTP API:
7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 2. Configurer l'application

Ajoutez le token dans votre fichier `.env` :

```env
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 3. Obtenir le Chat ID d'un contact

Pour envoyer des messages via Telegram, vous avez besoin du `chat_id` de chaque destinataire.

### Prérequis important

Le destinataire **doit d'abord envoyer un message au bot**. C'est une restriction de sécurité Telegram : un bot ne peut pas contacter quelqu'un qui ne lui a jamais parlé.

### Méthode 1 : Via @userinfobot (la plus simple)

1. Le contact ouvre Telegram
2. Il cherche **@userinfobot**
3. Il envoie `/start`
4. Le bot répond avec son `Id` - c'est le chat_id à utiliser

### Méthode 2 : Via l'API getUpdates

1. Le contact envoie un message à votre bot (n'importe quel message ou `/start`)
2. Appelez l'API getUpdates :

```bash
curl "https://api.telegram.org/bot<VOTRE_TOKEN>/getUpdates"
```

3. La réponse contient les messages reçus :

```json
{
  "ok": true,
  "result": [
    {
      "update_id": 123456789,
      "message": {
        "message_id": 1,
        "from": {
          "id": 987654321,
          "first_name": "Jean",
          "username": "jean_dupont"
        },
        "chat": {
          "id": 987654321,
          "first_name": "Jean",
          "type": "private"
        },
        "text": "/start"
      }
    }
  ]
}
```

Le `chat.id` (ici `987654321`) est le chat_id à saisir dans le formulaire de contact.

### Méthode 3 : Via @RawDataBot

1. Le contact cherche **@RawDataBot** sur Telegram
2. Il envoie `/start`
3. Le bot répond avec toutes ses informations, dont le chat_id

## 4. Ajouter un contact Telegram

1. Allez dans **Admin > Contacts > Ajouter**
2. Sélectionnez **Telegram** comme canal de communication
3. Entrez le **Chat ID** obtenu précédemment
4. Enregistrez le contact

## 5. Tester l'envoi

1. Dans la liste des contacts, cliquez sur le menu **⋮** du contact
2. Sélectionnez **"Envoyer un test"**
3. Modifiez le message si nécessaire
4. Cliquez sur **Envoyer**

## Résolution des problèmes

### Erreur : "chat not found"

**Cause** : Le destinataire n'a jamais envoyé de message au bot.

**Solution** : Le destinataire doit ouvrir Telegram, chercher votre bot et lui envoyer `/start`.

### Erreur : "Telegram Bot non configuré"

**Cause** : Le token n'est pas configuré dans `.env`.

**Solution** : Vérifiez que `TELEGRAM_BOT_TOKEN` est bien défini dans votre fichier `.env` et redémarrez l'application.

### Erreur : "Chat ID Telegram invalide"

**Cause** : Le format du chat_id est incorrect.

**Solution** : Le chat_id doit être un nombre (positif pour les utilisateurs, négatif pour les groupes). Exemple : `987654321` ou `-1001234567890`.

## Envoyer à un groupe Telegram

Pour envoyer des notifications à un groupe :

1. Ajoutez votre bot au groupe Telegram
2. Envoyez un message dans le groupe
3. Récupérez le chat_id du groupe via l'API getUpdates (il commence par `-100`)
4. Créez un contact avec ce chat_id de groupe

## Informations techniques

- **API utilisée** : Bot API Telegram (https://api.telegram.org)
- **Méthode** : `sendMessage`
- **Limitation** : Un bot ne peut envoyer que 30 messages/seconde à des utilisateurs différents
- **Format supporté** : Texte brut (le markdown peut être activé via les options)
