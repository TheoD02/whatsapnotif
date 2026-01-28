# API Reference

Documentation de l'API REST de WhatsApp Hub.

## Authentification

Toutes les requêtes API nécessitent un token Bearer.

```bash
curl -H "Authorization: Bearer VOTRE_TOKEN" \
     https://votre-domaine.com/api/v1/...
```

### Obtenir un token

1. Connectez-vous en tant qu'admin
2. Allez dans **Admin > Tokens API**
3. Créez un nouveau token
4. Copiez le token (visible uniquement à la création)

## Endpoints

### Notifications

#### Envoyer une notification

```http
POST /api/v1/notifications/send
```

**Body :**

```json
{
  "content": "Bonjour {{nom}}, votre commande est prête !",
  "title": "Notification commande",
  "contact_ids": [1, 2, 3],
  "group_ids": [1],
  "template_id": 5
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `content` | string | Oui* | Contenu du message |
| `title` | string | Non | Titre (pour référence) |
| `contact_ids` | array | Non** | IDs des contacts |
| `group_ids` | array | Non** | IDs des groupes |
| `template_id` | integer | Non | ID du template à utiliser |

\* Requis si `template_id` non fourni
\** Au moins un des deux requis

**Variables disponibles :**
- `{{nom}}` / `{{name}}` : Nom du contact
- `{{phone}}` / `{{telephone}}` : Téléphone
- `{{clé}}` : Toute clé des métadonnées du contact

**Réponse :**

```json
{
  "success": true,
  "notification_id": 42,
  "recipients_count": 15,
  "message": "Notification envoyée à 15 destinataire(s)"
}
```

---

### Contacts

#### Lister les contacts

```http
GET /api/v1/contacts
```

**Paramètres query :**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Recherche par nom/téléphone |
| `group_id` | integer | Filtrer par groupe |
| `active` | boolean | Filtrer par statut |
| `page` | integer | Page (pagination) |

**Réponse :**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Jean Dupont",
      "phone": "+33612345678",
      "preferred_channel": "whatsapp",
      "telegram_chat_id": null,
      "is_active": true,
      "metadata": {
        "company": "ACME"
      },
      "groups": [
        {"id": 1, "name": "Clients VIP"}
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 100
  }
}
```

#### Créer un contact

```http
POST /api/v1/contacts
```

**Body :**

```json
{
  "name": "Jean Dupont",
  "phone": "+33612345678",
  "preferred_channel": "whatsapp",
  "metadata": {
    "company": "ACME",
    "city": "Paris"
  },
  "group_ids": [1, 2]
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `name` | string | Oui | Nom du contact |
| `phone` | string | Cond.* | Numéro WhatsApp |
| `preferred_channel` | string | Oui | `whatsapp` ou `telegram` |
| `telegram_chat_id` | string | Cond.* | Chat ID Telegram |
| `metadata` | object | Non | Données personnalisées |
| `group_ids` | array | Non | IDs des groupes |

\* `phone` requis si `preferred_channel` = whatsapp

**Réponse :**

```json
{
  "success": true,
  "contact": {
    "id": 42,
    "name": "Jean Dupont",
    "phone": "+33612345678",
    ...
  }
}
```

#### Voir un contact

```http
GET /api/v1/contacts/{id}
```

#### Modifier un contact

```http
PUT /api/v1/contacts/{id}
```

Même body que la création.

---

### Groupes

#### Lister les groupes

```http
GET /api/v1/groups
```

**Réponse :**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Clients VIP",
      "color": "#3b82f6",
      "contacts_count": 45
    }
  ]
}
```

---

### Templates

#### Lister les templates

```http
GET /api/v1/templates
```

**Réponse :**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Confirmation commande",
      "content": "Bonjour {{nom}}, votre commande #{{order_id}} est confirmée.",
      "variables": ["nom", "order_id"]
    }
  ]
}
```

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource non trouvée |
| 422 | Erreur de validation |
| 500 | Erreur serveur |

**Format d'erreur :**

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "content": ["Le champ content est requis."],
    "contact_ids": ["Aucun destinataire spécifié."]
  }
}
```

## Rate Limiting

- 60 requêtes par minute par token
- Header `X-RateLimit-Remaining` indique les requêtes restantes

## Exemples

### PHP (Guzzle)

```php
$client = new GuzzleHttp\Client();

$response = $client->post('https://votre-domaine.com/api/v1/notifications/send', [
    'headers' => [
        'Authorization' => 'Bearer ' . $token,
        'Accept' => 'application/json',
    ],
    'json' => [
        'content' => 'Bonjour {{nom}} !',
        'contact_ids' => [1, 2, 3],
    ],
]);

$data = json_decode($response->getBody(), true);
```

### JavaScript (fetch)

```javascript
const response = await fetch('https://votre-domaine.com/api/v1/notifications/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Bonjour {{nom}} !',
    contact_ids: [1, 2, 3],
  }),
});

const data = await response.json();
```

### cURL

```bash
curl -X POST https://votre-domaine.com/api/v1/notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test", "contact_ids": [1]}'
```
