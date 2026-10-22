Spécifications techniques MVP

1. Conventions globales
   Authentification JWT
   Toutes les routes marquées 🔒 requièrent un token JWT valide.
   Middleware : authMiddleware
   Vérification du header : Authorization: Bearer <token>
   Vérification de la signature JWT
   Vérification de l'expiration du token
   Durée de validité : 7 jours
   401 si token absent ou invalide
   Gestion côté mobile
   Stockage : Secure Storage (iOS Keychain / Android Keystore)
   Suppression automatique à la déconnexion
   Format de réponse API (toutes les routes)
   Succès
   {
   "success": true,
   "data": {}
   }

Erreur
{
"success": false,
"error": {
"code": "ERROR_CODE",
"message": "Human readable message"
}
}

Codes HTTP utilisés
Code
Signification
400
Validation error
401
Unauthorized
404
Not found
500
Server error

Validation des données
Validation systématique des entrées backend. Rejet 400 si non conforme.
Champ
Règle
email
Format email valide
password
Min. 8 caractères
cycle_length
Entre 21 et 40 jours
weight

> 0
> height
> 0

Navigation mobile
Voir UX/UI

Performance et cache
Cache local des données utilisateur (profil)
Refresh des stats après fin de session
Requêtes API minimisées
Modèle de données complet
Table user
Champ
Type
Notes
id
UUID
PK
email
string
Unique
password_hash
string
bcrypt
name
string

birthdate
date

weight
float

> 0
> height
> float
> 0
> level
> string

goal
string

cycle_start_date
date

cycle_length
int
21–40 jours
refresh_token
string
Optionnel
notification_enabled
boolean

created_at
timestamp

Table session
Champ
Type
Notes
id
UUID
PK
user_id
UUID
FK → user
start_time
timestamp

end_time
timestamp

distance
float
en km
duration
int
en secondes
average_pace
float
min/km
status
enum
active / completed

Table cycle
Champ
Type
Notes
user_id
UUID
FK → user
cycle_start_date
date

cycle_length
int

last_updated
timestamp

Table notification_settings
Champ
Type
Notes
user_id
UUID
FK → user
workout_notifications
boolean

cycle_notifications
boolean

social_notifications
boolean

preferred_time
int
Heure (0–23), défaut : 18

Table planned_workouts
Champ
Type
Notes
id
UUID
PK
user_id
UUID
FK → user
planned_date
date
Une séance par jour et par utilisatrice
type
string
Douce, progressive ou dynamique
duration
int
En minutes
intensity
string
Adaptée à la phase du cycle
phase
string
Phase calculée au moment de la planification

Planning hebdomadaire
Endpoints : GET /planning?week_start=YYYY-MM-DD, POST /planning, PUT /planning/:id, DELETE /planning/:id 🔒
Le GET retourne du lundi au dimanche les séances enregistrées, avec la phase recalculée pour la date prévue.
Le POST accepte planned_date et type ; le backend calcule durée, intensité et adaptation selon le profil et le cycle.
Le PUT déplace une séance sur une date à venir. Une seule séance est autorisée par jour.

Règles métier
Une seule session active par utilisateur
Recalcul automatique du cycle après modification de cycle_start_date ou cycle_length
Une recommandation d'entraînement par jour maximum
Historique paginé - 50 dernières sessions par défaut
EPIC 1 - Gestion du profil utilisateur
1.1 Création de compte
Endpoint : POST /auth/register (public)
Payload
{
"email": "",
"password": "",
"name": "",
"birthdate": "",
"weight": null,
"height": null,
"level": "",
"goal": "",
"cycle_start_date": "",
"cycle_length": 28
}

Traitements backend
Validation des champs (voir règles globales)
Vérification unicité email -> 400 si déjà utilisé
Hash du mot de passe (bcrypt)
Création utilisateur en base
Génération token JWT (7 jours)
Réponse succès
{
"success": true,
"data": {
"token": "jwt_token",
"user": { "id": "uuid" }
}
}

Frontend mobile
Écran d'inscription multi-formulaire (AuthStack → Register)
Validation des champs côté client
Blocage soumission si champs obligatoires incomplets
Stockage du token en Secure Storage
Redirection vers MainTabNavigator après création
1.2 Connexion
Endpoint : POST /auth/login (public)
Payload
{
"email": "",
"password": ""
}

Traitements backend
Validation format email et longueur password
Recherche utilisateur par email → 401 si non trouvé
Comparaison hash bcrypt → 401 si incorrect
Génération JWT (7 jours)
Réponse succès
{
"success": true,
"data": {
"token": "jwt_token",
"user": { "id": "uuid" }
}
}

Frontend mobile
Écran de connexion (AuthStack → Login)
Stockage du token en Secure Storage
Gestion des erreurs d'authentification (message utilisateur)
Redirection vers MainTabNavigator après connexion
1.3 Modification du profil
Endpoint : PUT /users/me 🔒
Payload
{
"weight": null,
"height": null,
"level": "",
"goal": "",
"cycle_start_date": "",
"cycle_length": 28
}

Traitements backend
Authentification JWT obligatoire
Validation des champs modifiés
Mise à jour des champs utilisateur
Si cycle_start_date ou cycle_length modifiés → recalcul automatique du cycle
Frontend mobile
Écran profil éditable (MainTabNavigator → Profile)
Pré-remplissage des champs depuis le cache local
Invalidation du cache profil après sauvegarde
1.4 Consultation du profil
Endpoint : GET /users/me 🔒
Réponse : données complètes utilisateur (format standard)
Frontend mobile
Écran profil en lecture seule
Données chargées depuis le cache local (rafraîchissement si nécessaire)
Affichage structuré des données
EPIC 2 - Gestion du cycle et personnalisation
2.1 Gestion du cycle menstruel
Endpoint : PUT /cycle 🔒
Payload
{
"cycle_start_date": "",
"cycle_length": 28
}

Validation : cycle_length entre 21 et 40 jours
Logique backend
Calcul du jour dans le cycle : (date_actuelle - cycle_start_date) % cycle_length
Détermination de la phase courante
Si table cycle séparée → mise à jour de last_updated
Frontend mobile
Écran cycle (MainTabNavigator → Cycle)
Sélection date début
Modification durée du cycle
Affichage état actuel du cycle
2.2 Recommandation d'entraînement personnalisé
Endpoint : GET /workouts/today 🔒
Entrées (calculées depuis le profil) : level, goal, phase du cycle
Logique métier
Phase
Intensité
Menstruelle
Faible
Folliculaire
Progression
Ovulation
Élevée
Lutéale
Modérée

Règle : une recommandation par jour maximum
Réponse
{
"success": true,
"data": {
"type": "run",
"duration": 30,
"intensity": "low"
}
}

Frontend mobile
Carte principale sur l'écran d'accueil (WorkoutStack → WorkoutToday)
Bouton de lancement de séance
2.3 Visualisation du cycle
Endpoint : GET /cycle/view 🔒
Réponse
{
"success": true,
"data": {
"cycle_start_date": "",
"cycle_length": 28,
"current_phase": "",
"phase_projections": []
}
}

Frontend mobile
Vue calendrier ou timeline (MainTabNavigator → Cycle)
Indication visuelle de la phase actuelle
Code couleur par phase
EPIC 4 - Entraînement et suivi des performances
4.1 Voir l'entraînement du jour
Voir section 2.2 — même endpoint GET /workouts/today
Frontend mobile
Carte principale sur l'écran d'accueil
Bouton démarrer séance → navigation vers WorkoutStack → RunningSession
4.2 Lancer une séance de running
Endpoints : POST /sessions/start 🔒 · POST /sessions/stop 🔒
Démarrage — POST /sessions/start
{
"success": true,
"data": { "session_id": "uuid" }
}

Vérification préalable : aucune session avec status = active pour cet utilisateur → 400 si déjà active.
Arrêt — POST /sessions/stop
Payload : liste de coordonnées GPS collectées côté mobile
{
"session_id": "uuid",
"coordinates": [
{ "lat": 48.1, "lng": -1.7, "timestamp": "..." },
...
]
}

Traitements backend
Calcul distance via formule Haversine (ou service externe)
Calcul durée et allure moyenne
Mise à jour status → completed
Enregistrement final uniquement en fin de session
Tracking GPS mobile
Update de position toutes les 2 à 5 secondes (expo-location / Core Location)
Perte GPS → pause du tracking distance, reprise automatique
Timer local en temps réel (durée affichée sans appel API)
Distance mise à jour en live côté mobile
Frontend mobile (WorkoutStack → RunningSession)
Affichage durée et distance en temps réel
Boutons pause et stop
Navigation vers SessionSummary à la fin
4.3 Marquer un entraînement comme terminé
Endpoint : PUT /sessions/{id}/complete 🔒
Traitements
Mise à jour status → completed
Calcul des statistiques finales
Frontend mobile
Écran SessionSummary avec récapitulatif
Bouton de validation fin de séance
Refresh des stats après validation (invalidation du cache stats)
4.4 Consultation des statistiques
Endpoint : GET /stats/me 🔒
Réponse
{
"success": true,
"data": {
"total_sessions": 0,
"total_distance": 0,
"average_distance": 0
}
}

Frontend mobile (MainTabNavigator → Stats)
Dashboard avec KPI sous forme de cartes
Rafraîchissement après chaque session terminée
4.5 Historique des entraînements
Endpoint : GET /sessions?user_id=me&limit=50&offset=0 🔒
Pagination : 50 sessions par page (défaut)
Réponse : liste des sessions avec date, durée, distance, statut
Frontend mobile (MainTabNavigator → Stats)
Liste scrollable
Détail par session au tap
EPIC 5 - Notifications
5.1 Notifications d'entraînement
Service : Firebase Cloud Messaging (FCM)
Cron job
Fréquence : 1 fois par jour
Heure configurable (défaut : 18h, via notification_settings.preferred_time)
Logique backend
Récupérer les utilisateurs actifs avec notification_enabled = true
Récupérer la séance du jour (GET /workouts/today)
Envoyer la notification push
Si aucune séance disponible → notification générique motivationnelle
Payload notification
{
"title": "Entraînement du jour",
"body": "30 minutes de footing aujourd'hui",
"screen": "WorkoutToday"
}

Deep linking (navigation depuis notification)
WorkoutToday → WorkoutStack → WorkoutToday
SessionDetail → WorkoutStack → SessionSummary
Gestion des préférences (table notification_settings)
Endpoint : PUT /notifications/settings 🔒
{
"workout_notifications": true,
"cycle_notifications": false,
"social_notifications": false,
"preferred_time": 18
}

Frontend mobile
Gestion des permissions notifications au premier lancement
Activation/désactivation dans les paramètres du profil
Redirection vers l'écran concerné au tap sur la notification
