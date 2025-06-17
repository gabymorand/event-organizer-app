# 🎉 Event Organizer App

Une application web Google Apps Script pour organiser des soirées, voter pour les meilleurs bars/karaoké et coordonner des activités afterwork.

## 📋 Fonctionnalités

### 📅 Calendrier des Soirées
- Créer et organiser des événements
- Système de vote (Oui/Non/Peut-être) 
- Intégration Google Calendar automatique
- Gestion des participants avec affichage détaillé
- Suppression d'événements (créateur uniquement)

### 🍻 Meilleurs Bars
- Ajouter des recommandations de bars
- Système de vote (👍/👎)
- Descriptions et localisation

### 🎤 Karaoké
- Liste des meilleurs spots karaoké
- Système de vote communautaire
- Informations détaillées sur chaque lieu

### 🎯 Activités Afterwork
- Prison break, escape games, etc.
- Durée et nombre de joueurs max
- Vote pour les activités préférées

## 🚀 Installation

### Prérequis
- Compte Google
- Node.js (pour clasp)
- Accès à Google Apps Script
- Permissions Google Calendar

### 🔧 Setup avec clasp (Développement)

#### 1. Installation de clasp
```bash
# Installer clasp globalement
npm install -g @google/clasp

# Login Google
clasp login
```

#### 2. Cloner le projet existant
```bash
# Cloner depuis Apps Script (remplace par ton SCRIPT_ID)
clasp clone 1xLCDQvekEjjel2oN4c5D4scxtZ18C6yhxkB8zD6_POgyMHScj-JpjgsM

# Ou créer un nouveau projet
clasp create --type webapp --title "Event Organizer"
```

#### 3. Activer l'API Google Apps Script
**⚠️ OBLIGATOIRE pour utiliser clasp :**

1. Va sur : https://script.google.com/home/usersettings
2. Active **"Google Apps Script API"** ✅
3. Attends 2-3 minutes pour la propagation
4. Retry `clasp push`

#### 4. Structure du projet après clone
```
event-organizer-app/
├── .clasp.json              # Config clasp avec SCRIPT_ID
├── appsscript.json          # Manifest Apps Script
├── Code.gs                  # Point d'entrée principal
├── DataService.gs           # Gestion Google Sheets
├── EventService.gs          # Logique événements
├── CalendarService.gs       # Intégration Google Calendar
├── VotingService.gs         # Système de votes
├── index.html               # Interface principale
├── styles.html              # CSS
├── client.html              # JavaScript côté client
└── README.md
```

### 🔄 Workflow de développement avec clasp

#### Développement quotidien
```bash
# 1. Faire tes modifications dans VSCode
# 2. Synchroniser vers Apps Script
clasp push

# 3. Tester dans l'app web (URL de dev)
# F5 pour rafraîchir

# 4. Pour déployer une nouvelle version stable
clasp deploy
```

#### URLs importantes
- **Dev/Test** : `https://script.google.com/.../dev` (mise à jour automatique après `clasp push`)
- **Production** : `https://script.google.com/.../exec` (mise à jour après `clasp deploy`)

### 🐛 Résolution d'erreurs clasp

#### ❌ "Apps Script API not enabled"
```bash
# Erreur complète :
# User has not enabled the Apps Script API. Enable it by visiting 
# https://script.google.com/home/usersettings then retry.
```
**Solution :**
1. Va sur https://script.google.com/home/usersettings
2. Active "Google Apps Script API"
3. Attends 2-3 minutes
4. `clasp push`

#### ❌ "A file with this name already exists"
```bash
# Tu as des fichiers en double (.gs ET .js)
ls -la *.gs *.js

# Solution : supprimer les .js (garde les .gs)
rm *.js
clasp push
```

#### ❌ "Login required"
```bash
# Re-login Google
clasp login

# Vérifier le login
clasp whoami
```

#### ❌ "Script not found"
```bash
# Vérifier le SCRIPT_ID dans .clasp.json
cat .clasp.json

# Ou re-cloner avec le bon ID
clasp clone TON_SCRIPT_ID
```

### 🔧 Commandes clasp utiles

```bash
# Statut de synchronisation
clasp status

# Ouvrir le projet dans Apps Script
clasp open

# Voir les logs d'exécution
clasp logs

# Lister les déploiements
clasp deployments

# Voir les versions
clasp versions

# Pull (Apps Script → local)
clasp pull

# Push (local → Apps Script)
clasp push

# Force push (écrase les conflits)
clasp push --force
```

## 🏗️ Architecture

### Backend (Google Apps Script)

#### Services principaux
- **`Code.gs`** - Point d'entrée principal, routing et fonctions exposées
- **`DataService.gs`** - Gestion des données Google Sheets
- **`EventService.gs`** - Logique métier événements et participants
- **`CalendarService.gs`** - Intégration Google Calendar
- **`VotingService.gs`** - Système de votes avec déduplication

#### Stockage des données
L'app utilise Google Sheets avec 5 feuilles :
- **Events** : `ID | Title | Date | Author | Description | Status | CalendarEventId`
- **Bars** : `ID | Name | Location | Description | AddedBy`
- **Karaoke** : `ID | Name | Location | Description | AddedBy`
- **Activities** : `ID | Name | Location | Duration | MaxPlayers | AddedBy`
- **Votes** : `ItemType | ItemID | VoteType | Timestamp | UserEmail`

### Frontend

#### Interface utilisateur
- **`index.html`** - Page principale avec navigation
- **`styles.html`** - CSS avec design moderne et responsive
- **`client.html`** - JavaScript côté client avec gestion async

#### Fonctionnalités UI
- Navigation par sections
- Chargement asynchrone avec animations de chats 🐱
- Anti-spam sur les boutons
- Affichage des participants pliable/dépliable
- Formulaires de création/ajout dynamiques

## 🔧 Configuration

### Initialisation automatique
Au premier lancement, l'app :
1. Crée automatiquement un Google Sheet
2. Configure les 5 feuilles nécessaires
3. Stocke l'ID du spreadsheet dans les propriétés

### Configuration manuelle
```javascript
// Dans Code.gs - Configuration du Spreadsheet
function setSpreadsheetId() {
  const ss = SpreadsheetApp.create('Event Organizer Data');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  return ss.getUrl();
}
```

### Fonctions utiles pour le debug
```javascript
// Test de l'app
function test() {
  Logger.log('App is working!');
}

// Debug du spreadsheet
function debugSpreadsheet() {
  const ss = getSpreadsheet();
  Logger.log('Spreadsheet URL: ' + ss.getUrl());
  
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    Logger.log(`Sheet: ${sheet.getName()} - Rows: ${sheet.getLastRow()}`);
  });
}

// Test permissions Calendar
function testCalendarPermissions() {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    Logger.log('Calendar access OK: ' + calendar.getName());
  } catch (error) {
    Logger.log('Calendar error: ' + error.toString());
  }
}
```

## 📱 Utilisation

### Créer un événement
1. Aller dans "📅 Calendrier"
2. Cliquer "+ Organiser une soirée"
3. Remplir le formulaire (titre, date, description)
4. L'événement est automatiquement ajouté à Google Calendar

### Voter pour un événement
- **👍 Oui** : Participant confirmé, ajouté au Calendar de l'utilisateur
- **👎 Non** : Décliné mais visible dans les statistiques
- **🤔 Peut-être** : En attente de confirmation

### Voir les participants
1. Cliquer "👥 Participants" sur un événement
2. Affichage par catégorie :
   - ✅ Participants confirmés
   - 🤔 Peut-être
   - ❌ Ne viennent pas

### Ajouter un bar/karaoké/activité
1. Aller dans la section appropriée
2. Cliquer le bouton "+"
3. Remplir les informations
4. Voter avec 👍/👎

## 🔒 Sécurité et Permissions

### Permissions Google Apps Script
Le fichier [`appsscript.json`](appsscript.json) configure :
```json
{
  "timeZone": "Europe/Paris",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/script.external_request"
  ],
  "webapp": {
    "executeAs": "USER_ACCESSING",
    "access": "DOMAIN"
  }
}
```

### Règles de sécurité
- Seul le créateur peut supprimer ses événements
- Un vote par utilisateur par item (le dernier compte)
- Authentification Google obligatoire
- Accès limité au domaine (configuré dans webapp.access)

### Données
- Stockage sécurisé dans Google Sheets
- Pas d'exposition d'API externes
- Logs détaillés pour debugging
- Gestion des erreurs avec fallbacks

## 🎨 Personnalisation

### Images de chargement
L'app utilise l'API [CATAAS](https://cataas.com) pour des GIFs de chats :
```javascript
// Exemple dans client.html
<img src="https://cataas.com/cat/gif/says/Loading...?filter=mono&fontColor=orange&fontSize=20&type=square" />
```

### Personnaliser les styles
Modifier [`styles.html`](styles.html) pour :
- **Couleurs** : Variables CSS en début de fichier
- **Animations** : Transitions et transformations
- **Responsive** : Media queries pour mobile

```css
/* Variables couleurs principales */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}
```

## 📊 Monitoring et Debug

### Logs disponibles
```javascript
// Côté serveur (Apps Script)
Logger.log('Message de debug');

// Côté client (navigateur)
console.log('Debug client');
```

### Types de logs trackés
- Temps de chargement des sections
- Erreurs de votes et création
- Intégration Google Calendar
- Sérialisation des données
- Gestion des participants

### Debug dans la console
```javascript
// Dans la console navigateur
console.log('Event Organizer App initialized with cats! 🐱');

// Variables globales disponibles
console.log(currentSection); // Section active
console.log(currentData);    // Données chargées
console.log(isLoading);      // État de chargement
```

### Monitoring serveur
```bash
# Voir les logs Apps Script
clasp logs

# Logs en temps réel
clasp logs --watch
```

## 🤝 Contribution et Développement

### Structure du code
- **Backend** : Fichiers `.gs` pour la logique serveur
- **Frontend** : Fichiers `.html` pour l'interface
- **Config** : `.clasp.json` et `appsscript.json`

### Workflow de contribution
1. **Clone le projet** : `clasp clone SCRIPT_ID`
2. **Crée une branche** : `git checkout -b feature/ma-feature`
3. **Développe** : modifications dans VSCode
4. **Test** : `clasp push` + test dans l'app
5. **Commit** : `git commit -m "Add feature"`
6. **Deploy** : `clasp deploy` pour nouvelle version

### Ajouter une fonctionnalité

#### Backend (nouveau service)
```javascript
// Nouveau fichier ServiceName.gs
function nouvelleFunction() {
  try {
    // Logique métier
    return { success: true, data: result };
  } catch (error) {
    Logger.log('Erreur nouvelleFunction: ' + error.toString());
    throw new Error(error.message);
  }
}
```

#### Frontend (nouvelle section)
```javascript
// Dans client.html
function showNouvelleSection() {
  currentSection = 'nouvelle';
  // Interface + appel google.script.run.nouvelleFunction()
}
```

#### Navigation
```html
<!-- Dans index.html -->
<button class="nav-btn" onclick="showNouvelleSection()">🆕 Nouvelle</button>
```

## 📋 Roadmap / TODO

### Fonctionnalités prioritaires
- [ ] **Notifications email** pour nouveaux événements
- [ ] **Export des événements** (CSV, iCal)
- [ ] **Système de commentaires** sur les événements
- [ ] **Intégration Maps** pour localiser les lieux

### Améliorations UX
- [ ] **Mode sombre** avec toggle
- [ ] **PWA** (Progressive Web App) pour installation
- [ ] **Notifications push** navigateur
- [ ] **Recherche** et filtres avancés

### Optimisations techniques
- [ ] **Cache des données** côté client
- [ ] **Lazy loading** des sections
- [ ] **Compression** des images de chargement
- [ ] **Tests automatisés** avec clasp

### Analytics
- [ ] **Dashboard** statistiques d'utilisation
- [ ] **Métriques** de participation aux événements
- [ ] **Rapports** mensuels automatiques

## 🐛 Dépannage Avancé

### Problèmes courants

#### Spreadsheet introuvable
```javascript
// Code.gs - Réinitialiser le spreadsheet
function resetSpreadsheet() {
  const ss = SpreadsheetApp.create('Event Organizer Data - ' + new Date().getTime());
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  initializeSheets();
  return { success: true, url: ss.getUrl() };
}
```

#### Permissions Google Calendar
```javascript
// Tester les permissions
function testCalendarPermissions() {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    Logger.log('✅ Calendar OK: ' + calendar.getName());
    return true;
  } catch (error) {
    Logger.log('❌ Calendar error: ' + error.toString());
    return false;
  }
}
```

#### Votes non comptabilisés
```javascript
// Debug des votes
function debugVotes(itemType, itemId) {
  const ss = getSpreadsheet();
  const votesSheet = ss.getSheetByName('Votes');
  const data = votesSheet.getDataRange().getValues();
  
  const itemVotes = data.filter(row => 
    row[0] === itemType && String(row[1]) === String(itemId)
  );
  
  Logger.log(`Debug votes for ${itemType}/${itemId}:`);
  itemVotes.forEach(vote => Logger.log(`${vote[4]}: ${vote[2]} at ${vote[3]}`));
  
  return itemVotes;
}
```

#### Erreurs de sérialisation
```javascript
// EventService.gs - Fix sérialisation des dates
function getEventParticipants(eventId) {
  // ... logique ...
  
  // Conversion explicite pour éviter erreurs de sérialisation
  const result = participants.map(p => ({
    email: String(p.email),
    vote: String(p.vote),
    timestamp: String(p.timestamp) // ← Important !
  }));
  
  return result;
}
```

### Performance

#### Optimisation des requêtes
```javascript
// Utiliser getDataRange() une seule fois
const data = sheet.getDataRange().getValues();
// Puis filtrer en mémoire au lieu de multiples getRange()
```

#### Cache côté client
```javascript
// client.html - Cache simple
let dataCache = {};
let cacheExpiry = {};

function getCachedData(key, fetchFunction, expiration = 300000) { // 5 min
  if (dataCache[key] && Date.now() < cacheExpiry[key]) {
    return Promise.resolve(dataCache[key]);
  }
  
  return fetchFunction().then(data => {
    dataCache[key] = data;
    cacheExpiry[key] = Date.now() + expiration;
    return data;
  });
}
```

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

## 👨‍💻 Auteur

**Gabriel Morand**  
*"L'alternant incompris de la DSI"* 😄

Créé avec ❤️ pour organiser les meilleures soirées !

## 🙏 Remerciements

- **Google Apps Script** pour la plateforme
- **CATAAS** pour les GIFs de chats de loading
- **La team Arkea** pour les tests et retours

---

*"Parce que la vie est trop courte pour des soirées ennuyantes"* 🎉

## 📞 Support

En cas de problème :
1. **Vérifier** ce README pour les solutions courantes
2. **Consulter** les logs : `clasp logs`
3. **Tester** les fonctions de debug dans Apps Script
4. **Ouvrir** une issue GitHub si besoin

**Happy coding! 🚀**