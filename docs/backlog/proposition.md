# Proposition d'import du backlog GitHub

## Statut du document

Ce document est un **dry-run**. Il présente les EPIC et les Issues qui seraient
créés, mais il ne déclenche aucune écriture dans GitHub Issues ou GitHub Projects.

Sources analysées :

- `docs/spec.md` pour les besoins fonctionnels ;
- `docs/spec_tech.md` pour le périmètre MVP et les contraintes techniques ;
- `docs/log.md` pour identifier le travail déjà livré ;
- le code actuel pour distinguer les fonctionnalités terminées et partielles.

Statuts proposés :

- `Done` : fonctionnalité utilisable ou chantier technique terminé ;
- `Todo` : une partie existe déjà et le travail restant est prêt à être planifié ;
- `Backlog` : aucune implémentation significative identifiée.

## EPIC proposés

| Identifiant          | Issue EPIC                              | Source              |
| -------------------- | --------------------------------------- | ------------------- |
| `EPIC-PROFILE`       | Gestion du profil utilisateur           | `spec.md` section 1 |
| `EPIC-CYCLE`         | Gestion du cycle et personnalisation    | `spec.md` section 2 |
| `EPIC-COMMUNITY`     | Communauté et modération                | `spec.md` section 3 |
| `EPIC-TRAINING`      | Entraînements et suivi des performances | `spec.md` section 4 |
| `EPIC-CONTENT`       | Contenu et éducation                    | `spec.md` section 5 |
| `EPIC-NOTIFICATIONS` | Engagement et notifications             | `spec.md` section 6 |

Les deux exigences de confidentialité présentes dans les sections 1.10 et 2.7
sont regroupées dans `US-PRIVACY-001`. Le second identifiant 2.7, consacré au
signalement et à la modération, est rattaché à l'EPIC Communauté.

## User Stories proposées

### EPIC Profil

| Identifiant          | Titre de l'Issue                                    | Priorité | Estimation | Statut  |
| -------------------- | --------------------------------------------------- | -------- | ---------: | ------- |
| `US-AUTH-001`        | US - Créer un compte                                | P0       |          5 | Done    |
| `US-AUTH-002`        | US - Se connecter                                   | P0       |          3 | Done    |
| `US-AUTH-003`        | US - Se déconnecter                                 | P0       |          2 | Done    |
| `US-PROFILE-001`     | US - Modifier son profil                            | P0       |          5 | Todo    |
| `US-PROFILE-002`     | US - Consulter son profil                           | P0       |          3 | Todo    |
| `US-AUTH-004`        | US - Réinitialiser son mot de passe                 | P1       |          5 | Backlog |
| `US-PREFERENCES-001` | US - Gérer ses préférences de notifications         | P1       |          3 | Todo    |
| `US-ONBOARDING-001`  | US - Découvrir Maïa lors de la première utilisation | P0       |          5 | Todo    |
| `US-ACCOUNT-001`     | US - Supprimer son compte et ses données            | P1       |          5 | Backlog |
| `US-PRIVACY-001`     | US - Contrôler la confidentialité de ses données    | P1       |          5 | Backlog |

### EPIC Cycle

| Identifiant            | Titre de l'Issue                                 | Priorité | Estimation | Statut  |
| ---------------------- | ------------------------------------------------ | -------- | ---------: | ------- |
| `US-CYCLE-001`         | US - Renseigner et mettre à jour son cycle       | P0       |          5 | Todo    |
| `US-CYCLE-002`         | US - Recevoir une recommandation personnalisée   | P0       |          8 | Todo    |
| `US-FEEDBACK-001`      | US - Indiquer son ressenti après une séance      | P0       |          5 | Todo    |
| `US-CYCLE-003`         | US - Visualiser les phases de son cycle          | P0       |          5 | Todo    |
| `US-WORKOUT-ADAPT-001` | US - Adapter manuellement une séance recommandée | P1       |          5 | Backlog |
| `US-SYMPTOMS-001`      | US - Renseigner ses symptômes                    | P1       |          5 | Backlog |

### EPIC Communauté

| Identifiant         | Titre de l'Issue                                     | Priorité | Estimation | Statut  |
| ------------------- | ---------------------------------------------------- | -------- | ---------: | ------- |
| `US-COMMUNITY-001`  | US - Accéder à l'espace Communauté                   | P2       |          5 | Backlog |
| `US-MESSAGING-001`  | US - Échanger par messagerie                         | P3       |          8 | Backlog |
| `US-COMMUNITY-002`  | US - Publier une course                              | P2       |          8 | Backlog |
| `US-COMMUNITY-003`  | US - Consulter le fil d'actualité                    | P2       |          8 | Backlog |
| `US-GROUP-001`      | US - Créer ou rejoindre un groupe de runneuses       | P3       |          8 | Backlog |
| `US-FOLLOW-001`     | US - Suivre une autre utilisatrice                   | P3       |          5 | Backlog |
| `US-MODERATION-001` | US - Signaler un contenu ou bloquer une utilisatrice | P2       |          8 | Backlog |

### EPIC Entraînement

| Identifiant         | Titre de l'Issue                                   | Priorité | Estimation | Statut  |
| ------------------- | -------------------------------------------------- | -------- | ---------: | ------- |
| `US-WORKOUT-001`    | US - Voir l'entraînement du jour                   | P0       |          5 | Todo    |
| `US-SESSION-001`    | US - Lancer, mettre en pause et arrêter une séance | P0       |          8 | Todo    |
| `US-SESSION-002`    | US - Marquer un entraînement comme terminé         | P0       |          3 | Todo    |
| `US-STATS-001`      | US - Consulter ses statistiques                    | P0       |          5 | Todo    |
| `US-HISTORY-001`    | US - Consulter l'historique des entraînements      | P0       |          5 | Todo    |
| `US-PLANNING-001`   | US - Planifier ses séances                         | P1       |          8 | Backlog |
| `US-SUMMARY-001`    | US - Recevoir un résumé après une séance           | P0       |          5 | Backlog |
| `US-GOAL-001`       | US - Définir un objectif hebdomadaire              | P1       |          5 | Backlog |
| `US-MOTIVATION-001` | US - Recevoir des encouragements personnalisés     | P1       |          3 | Backlog |

### EPIC Contenu

| Identifiant      | Titre de l'Issue                               | Priorité | Estimation | Statut  |
| ---------------- | ---------------------------------------------- | -------- | ---------: | ------- |
| `US-CONTENT-001` | US - Comprendre l'impact du cycle sur le sport | P1       |          8 | Backlog |

### EPIC Notifications

| Identifiant           | Titre de l'Issue                         | Priorité | Estimation | Statut  |
| --------------------- | ---------------------------------------- | -------- | ---------: | ------- |
| `US-NOTIFICATION-001` | US - Recevoir un rappel d'entraînement   | P1       |          5 | Backlog |
| `US-NOTIFICATION-002` | US - Recevoir des notifications sociales | P3       |          5 | Backlog |
| `US-NOTIFICATION-003` | US - Recevoir des conseils liés au cycle | P1       |          5 | Backlog |

## Issues techniques historiques proposées

Ces éléments de `docs/log.md` ne sont pas artificiellement transformés en besoins
utilisateur. Ils deviennent des Issues techniques fermées afin de conserver une
trace fidèle du travail déjà effectué.

| Identifiant         | Titre de l'Issue                                        | Domaine  | Statut |
| ------------------- | ------------------------------------------------------- | -------- | ------ |
| `TECH-PLATFORM-001` | TECH - Initialiser les socles mobile, API et PostgreSQL | platform | Done   |
| `TECH-DESIGN-001`   | TECH - Mettre en place le design system Maïa            | frontend | Done   |
| `TECH-INFRA-001`    | TECH - Conteneuriser la preview avec Docker et Nginx    | infra    | Done   |
| `TECH-QUALITY-001`  | TECH - Automatiser lint, tests et builds                | ci       | Done   |
| `TECH-QUALITY-002`  | TECH - Bloquer les PR avec le Quality Gate SonarCloud   | ci       | Done   |
| `TECH-SECURITY-001` | TECH - Retirer les configurations locales sensibles     | security | Done   |

## Labels proposés

Les champs Project portent la priorité et l'estimation; ils ne sont pas dupliqués
par des labels.

- Type : `type:user-story`, `type:epic`, `type:technical`.
- EPIC : `epic:profile`, `epic:cycle`, `epic:community`, `epic:training`,
  `epic:content`, `epic:notifications`.
- Domaine : `area:frontend`, `area:backend`, `area:infra`, `area:security`,
  `area:ci`.

## Project proposé

- Nom : `Maïa - Produit`.
- Statuts : `Backlog`, `Todo`, `In Progress`, `Review`, `Done`.
- Priorité : `P0`, `P1`, `P2`, `P3`.
- Estimation : champ numérique en points.
- Sprint : champ Iteration, cycles de deux semaines.
- Dates : `Start date` et `Target date`.
- Vues : `Backlog`, `Sprint` et `Roadmap`.

Les sprints et les dates ne seront calculés qu'après validation du catalogue et
choix de la capacité d'un sprint. Aucun élément ne sera planifié silencieusement.

## Déduplication proposée

Avant chaque création, l'automatisation chargera toutes les Issues ouvertes et
fermées avec `gh issue list`. Elle cherchera ensuite :

1. le marqueur exact `maia-us-id` ;
2. le titre normalisé ;
3. une correspondance déjà enregistrée dans le manifeste local.

Une correspondance provoquera une mise à jour contrôlée ou un skip, jamais la
création d'une seconde Issue.

## Étape suivante après validation

Après validation de ce document, un manifeste JSON et un script Node minimal
seront ajoutés. Le script affichera son plan par défaut et exigera explicitement
`--apply` pour créer les labels, EPIC, User Stories et éléments du Project.
