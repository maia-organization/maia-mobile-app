# Journal de bord du projet Maïa

Ce document raconte l'évolution du projet dans l'ordre chronologique. J'ai
reconstitué les premières entrées à partir de l'historique Git, des spécifications
fonctionnelles et des spécifications techniques. À partir du 11 septembre 2026,
je l'alimente au fil des changements apportés au dépôt.

## 21 mai 2026 - Initialisation du projet

### Fondation du produit

J'ai initialisé le workspace Maïa et posé les documents qui décrivent la mission,
le MVP, les parcours fonctionnels et les choix techniques. Le dépôt contient dès
le départ une structure commune, les scripts npm et les règles d'exclusion Git.

**Objectif :** disposer d'une base partagée pour construire une application de
running adaptée à la physiologie féminine.

**Commit :** `bd9f83a` (`chore: initialize project workspace`)

### Socle backend et base de données

J'ai créé le backend Fastify, configuré Drizzle et préparé le premier schéma
PostgreSQL. J'ai également ajouté JWT, CORS, le format commun des réponses API et
un environnement Docker local avec PostgreSQL.

**Fonctionnalités concernées :** socle API, authentification JWT, modèle de données
du MVP.

**Commit :** `8b72fcd` (`chore(backend): set up Fastify Drizzle environment`)

### Socle mobile

J'ai initialisé l'application React Native avec Expo, sa configuration et la
gestion de l'URL d'API. Cette première version fournit le point de départ mobile
du produit.

**Fonctionnalité concernée :** application mobile Maïa.

**Commit :** `89af9a5` (`chore(frontend): scaffold Expo mobile environment`)

### Première landing page

J'ai réalisé une première version de la page d'accueil et ajouté l'icône de
l'application. Cette étape a permis de tester rapidement l'identité visuelle et
la présentation du concept.

**Fonctionnalité concernée :** acquisition et découverte de Maïa.

**Commit :** `84636a4` (`feat: landing page test`)

## 11 juin 2026 - Identité visuelle, authentification et qualité

### Charte graphique

J'ai documenté les couleurs, les typographies, les principes visuels et les règles
d'utilisation de la marque Maïa. Cette charte devient la référence pour les écrans
mobiles et les composants partagés.

**Commit :** `3da17ac` (`docs: add Maia brand guidelines`)

### Fondation de l'interface mobile

J'ai restructuré l'interface autour d'un thème partagé, d'espacements cohérents,
de typographies de marque et d'un bouton réutilisable. La landing page a été
extraite dans un écran dédié.

**Fonctionnalités concernées :** design system mobile, landing page.

**Commits :** `d4d09a` (`chore(frontend): add branded UI foundation`) et
`9b1aee1` (`chore(frontend): refresh npm audit lockfile`).

### Premiers parcours d'authentification

J'ai ajouté la navigation d'onboarding, les écrans d'inscription et de connexion,
un layout commun et les champs de formulaire. J'ai ensuite affiné l'écran de
connexion et son alignement avec la maquette Figma.

**Fonctionnalité concernée :** EPIC 1, création de compte et connexion.

**Commits :** `ce7ce8d`, `84dce7c` et `1e9eb4f`.

### Outillage de qualité et preview web

J'ai installé ESLint, Prettier, Husky et une première GitHub Action. J'ai aussi
activé la preview Expo Web pour tester le parcours mobile depuis un navigateur.

**Chantiers concernés :** qualité du code, automatisation et environnement de
développement.

**Commits :** `7d08ca5` et `13122bb`.

## 12 juin 2026 - Exécution locale conteneurisée

### Dockerisation de la preview

J'ai ajouté les Dockerfiles du frontend et du backend ainsi que leur orchestration
dans Docker Compose. J'ai documenté le lancement local et ajouté la construction
des images Docker à la CI.

**Chantier concerné :** infrastructure locale et reproductibilité.

**Commits :** `0c172eb` et `ddc1336`.

### Compatibilité Expo Go

J'ai aligné le projet sur Expo SDK 54 pour garantir son exécution dans Expo Go sur
iOS, puis restauré les visuels d'authentification compatibles avec cette version.

**Fonctionnalité concernée :** expérience mobile et compatibilité iOS.

**Commits :** `ff1f2da` et `1e17900`.

## 10 septembre 2026 - Landing commerciale et authentification complète

### Landing page mobile et animation d'introduction

J'ai transformé l'accueil en landing mobile plus commerciale, plus aérée et plus
visuelle. J'ai ajouté une animation plein écran aux couleurs de Maïa : le logo
pulse au centre avant un fondu vers la landing page. Le CTA accompagne désormais
l'utilisatrice vers l'aventure Maïa.

**Fonctionnalité concernée :** découverte du produit et conversion vers
l'inscription.

**Commits :** `9b95de6` et `ead1c06`.

### Animations d'interface et pipeline initial

J'ai ajouté des retours animés sur les boutons et les transitions de navigation.
J'ai également posé un pipeline CI manuel pour commencer à contrôler le projet.

**Chantiers concernés :** UX mobile et qualité logicielle.

**Commit :** `23a47e8`.

### Authentification MVP de bout en bout

J'ai implémenté les routes backend d'inscription et de connexion, la génération
JWT, le stockage du token côté application et la restauration de session. Les
écrans mobiles appellent maintenant réellement l'API et redirigent vers le premier
écran connecté.

J'ai ensuite corrigé le parcours mobile, les soumissions par le clavier et les
messages d'erreur. J'ai adapté la résolution de l'URL API pour le navigateur et
fait transiter la preview par une gateway Nginx afin de relier correctement le
frontend, le backend et PostgreSQL dans Docker.

**Fonctionnalité concernée :** EPIC 1, inscription, connexion et session
authentifiée.

**Commits :** `1da0f8f`, `5fcdd83`, `3ce1c50` et `8d68b64`.

### Onboarding et profil utilisateur

J'ai enrichi l'inscription, ajouté la configuration du profil et créé les routes
utilisateur nécessaires. Le parcours connecté dispose d'un écran d'accueil et les
informations physiologiques utiles au MVP peuvent être renseignées.

**Fonctionnalité concernée :** EPIC 1, profil, niveau, objectif et données du
cycle.

**Commit :** `6ecb5d8`.

### Consolidation de la CI et de l'environnement

J'ai activé automatiquement les contrôles de qualité, remis en place les hooks et
les configurations de formatage, puis câblé le shell Expo de marque. J'ai mis à
jour les runtimes des conteneurs et fait fonctionner GitHub Actions avec Node 24.
J'ai enfin documenté la preview et ajouté la source de design Maïa.

**Chantiers concernés :** CI, infrastructure, frontend et documentation.

**Commits :** `d914b9c`, `e2dbe5b`, `a0bdf43`, `dafc34c` et `95c0357`.

### Validation et sécurité des formulaires

J'ai renforcé les validations côté backend et frontend : format de l'adresse
e-mail, politique de mot de passe, contraintes du profil et retours d'erreur. J'ai
ajouté une aide visuelle pour les exigences du mot de passe et amélioré le
contraste des interactions.

J'ai aussi restauré les accents et caractères français dans tous les textes de
l'application et dans les réponses de l'API.

**Fonctionnalité concernée :** EPIC 1, sécurité et accessibilité des formulaires.

**Commits :** `d5d9400`, `a9d0d49` et `93c2ec7`.

## 11 septembre 2026 - Backend métier et contrôle qualité

### Fiabilisation de PostgreSQL et de l'authentification

J'ai ajouté une étape de migration avant le démarrage de l'API pour éviter les
erreurs 500 provoquées par une base non initialisée. J'ai créé un test d'intégration
qui vérifie l'inscription contre une vraie instance PostgreSQL dans la CI.

**Fonctionnalité concernée :** EPIC 1, fiabilité de la création de compte.

**Commits :** `74904a6` et `79afdd4`.

### Cycle et recommandation quotidienne

J'ai développé les endpoints et services qui exposent la phase du cycle et la
séance recommandée du jour. J'ai couvert la logique métier avec des tests et ajouté
les routes correspondantes à la gateway Nginx.

**Fonctionnalités concernées :** EPIC 2, suivi du cycle, et EPIC 3,
recommandation d'entraînement quotidienne.

**Commits :** `ea630c7` et `fac36d4`.

### Suivi des séances et statistiques

J'ai fait évoluer le schéma pour garantir une seule séance active par
utilisatrice. J'ai ajouté les routes de démarrage et de fin de séance, les services
de tracking, les statistiques et leurs tests. La gateway expose maintenant ces
nouveaux endpoints.

**Fonctionnalités concernées :** EPIC 4, suivi de séance, et EPIC 5,
statistiques personnelles.

**Commits :** `079f071`, `e58ffae` et `7071d08`.

### Persistance des entraînements et adaptation par feedback

J'ai ajouté les tables nécessaires pour persister les entraînements et les retours
de fin de séance. La recommandation quotidienne peut désormais s'adapter au
feedback enregistré, avec des tests de service et un scénario d'intégration
étendu.

**Fonctionnalités concernées :** EPIC 3, entraînement adaptatif, et EPIC 4,
feedback de séance.

**Commits :** `315c50e` et `22f07bf`.

### Quality Gate SonarCloud

J'ai intégré SonarCloud à GitHub Actions avec la clé du projet de l'organisation
`maia-organization`. Le scanner attend le résultat du Quality Gate et la CI échoue
si Sonar remonte une issue ouverte sur une pull request. L'action tierce est
épinglée sur un SHA immuable.

J'ai limité cette analyse aux pull requests : elles sont contrôlées avant leur
merge, tandis que les pushes sur `develop` ne lancent pas une analyse de branche
secondaire incompatible avec la configuration SonarCloud actuelle.

**Chantier concerné :** sécurité, qualité et CI.

**Commits :** `61ce8ba` et `5b5c13e`.

### Retrait d'une configuration locale sensible

J'ai retiré `opencode.json` du dépôt afin de ne plus versionner une configuration
locale contenant des données sensibles. La suppression a été isolée dans une pull
request et validée par l'ensemble de la CI et par SonarCloud.

**Chantier concerné :** sécurité du dépôt.

**Commit :** `79c2909`.

### Mise en place du présent journal

J'ai créé ce journal rétroactif afin de rendre l'avancement produit et technique
lisible depuis le début du projet. J'ai également ajouté une consigne persistante
dans `AGENTS.md` : chaque future modification de code, d'infrastructure ou de CI
doit compléter ce fichier dans la même pull request.

**Chantier concerné :** documentation et suivi du projet.

### Préparation du backlog automatisé

J'ai défini quatre rôles de travail dans `AGENTS.md` : Product et Backlog,
Frontend Mobile, Backend et Infrastructure. Chaque rôle connaît les documents de
référence qu'il doit lire et les limites de son intervention.

J'ai également analysé les spécifications, le journal et le code existant pour
préparer un dry-run du futur backlog GitHub. La proposition regroupe les doublons,
normalise les identifiants et distingue les fonctionnalités terminées, partielles
et encore au backlog. Aucune Issue et aucun GitHub Project n'ont été créés pendant
cette étape.

**Chantier concerné :** organisation produit et automatisation du backlog.

## 1er octobre 2026 - Pilotage produit dans GitHub

### Automatisation du backlog et du Project

J'ai transformé les spécifications fonctionnelles et le journal historique en un
manifeste versionné comprenant 6 EPIC, 36 User Stories et 7 chantiers techniques.
J'ai créé une synchronisation idempotente qui contrôle les doublons, gère les
labels et alimente le Project GitHub avec les statuts, priorités, estimations,
sprints et dates.

J'ai initialisé le Project `Maïa - Produit` avec ses vues Kanban et Roadmap. Les
48 éléments issus de l'historique sont importés et une Issue technique suit cette
automatisation pendant sa revue. J'ai aussi formalisé dans `AGENTS.md` le cycle à
suivre avant chaque modification : retrouver le ticket, contrôler ses critères,
actualiser son statut et journaliser le travail dans la même pull request.

**Chantier concerné :** `TECH-PRODUCT-001`, organisation produit et suivi du
développement.

**Vérifications :** lint, formatage, dry-run sans doublon, 48 Issues et 48 cartes
GitHub contrôlées avant l'ajout du ticket de cette automatisation. J'ai ensuite
corrigé les deux alertes de sécurité et de performance signalées par SonarCloud
sur le script de synchronisation. Ce script d'orchestration reste analysé par
SonarCloud, mais il est exclu de la mesure de couverture applicative que le projet
ne collecte actuellement que pour le backend.

**Commits :** `d8227d8`, `5048134`, `85d78ec` et `8531088`, fusionnés par la
pull request `#61` (`acff9c9`).

### Finalisation de la modification du profil

J'ai terminé le parcours mobile de modification du profil. Les informations sont
rechargées à chaque ouverture, les changements de champs et d'options effacent
les anciens messages, et la confirmation de sauvegarde reste visible avant le
retour à l'accueil.

Côté API, j'ai regroupé la mise à jour du profil et du cycle dans une transaction
PostgreSQL afin d'éviter un enregistrement partiel. J'ai isolé la validation du
profil et ajouté des tests sur les valeurs autorisées, la protection JWT de la
route et le rejet des données invalides.

**Fonctionnalité concernée :** `US-PROFILE-001`, modification du profil.

**Vérifications :** lint, 30 tests Jest, smoke test avec PostgreSQL, reconstruction
Docker et parcours Playwright sur un viewport mobile de 390 x 844 pixels.

**Commits :** `dc5e41a` et `268b892`.

### Mesure de la couverture backend dans SonarCloud

J'ai complété le job SonarCloud pour qu'il exécute les tests Jest avec couverture
et transmette le rapport `lcov` au scanner. Le frontend reste temporairement hors
de cette mesure tant que le projet ne dispose pas d'un runner de tests React
Native ; il continue néanmoins d'être analysé par les autres règles Sonar.

**Chantier concerné :** qualité CI nécessaire à la revue de `US-PROFILE-001`.

## 1er octobre 2026 - Consultation du profil

### Écran profil en lecture seule

J'ai ajouté l'écran de consultation du profil. Il recharge les données de
l'utilisatrice à chaque ouverture via `GET /users/me` et les présente de façon
structurée : informations personnelles, profil sportif et cycle. Un état de
chargement, un message d'erreur et un accès à la modification du profil sont
prévus pour assurer un parcours lisible sur mobile.

**Fonctionnalité concernée :** `US-PROFILE-002`, consultation du profil.

**Vérifications :** lint et contrôle du statut `In Progress` de l'Issue #22 dans
le Project GitHub.

## 2 octobre 2026 - Préférences de notifications

### Gestion des rappels depuis le profil

J'ai ajouté les préférences de notifications dans le profil : l'utilisatrice peut
activer ou désactiver les rappels, puis choisir ceux liés aux entraînements, aux
conseils de cycle et à la communauté. Les choix sont enregistrés explicitement et
un retour de succès ou d'erreur est affiché dans l'écran.

Côté API, j'ai ajouté les routes JWT de lecture et de mise à jour des préférences.
La mise à jour du réglage global et des catégories est transactionnelle ; le schéma
`notification_settings` existant a été réutilisé, sans migration.

**Fonctionnalité concernée :** `US-PREFERENCES-001`, préférences de notifications.

**Vérifications :** lint, formatage et 38 tests Jest backend, dont les scénarios
JWT, validation, lecture et sauvegarde atomique des préférences.

## 2 octobre 2026 - Onboarding

### Découverte de Maïa à la première ouverture

J'ai ajouté un parcours d'onboarding mobile en quatre étapes pour présenter le
profil, les entraînements, le cycle et la communauté. Chaque étape peut être
passée et la fin du parcours est conservée localement afin qu'il ne soit plus
affiché lors des ouvertures suivantes.

**Fonctionnalité concernée :** `US-ONBOARDING-001`, première découverte de
Maïa.

**Vérifications :** lint, formatage et export Expo Web.

## 2 octobre 2026 - Gestion du cycle

### Consultation et mise à jour du cycle

J'ai ajouté l'écran Cycle, accessible depuis l'accueil et le profil. Il affiche le
jour et la phase actuelle, permet de corriger la date de début des dernières
règles et la durée moyenne du cycle, puis confirme la prise en compte de ces
informations par les prochaines recommandations.

J'ai réutilisé les routes protégées existantes afin de conserver la mise à jour
atomique des données de cycle et du profil. J'ai complété les tests API sur la
consultation, la validation et la sauvegarde du cycle.

**Fonctionnalité concernée :** `US-CYCLE-001`, gestion du cycle menstruel.

**Vérifications :** tests Jest backend, lint, formatage et export Expo Web.

**Commits :** `5698f9a`, `129653a`, `b0b2f73`, `8be2a68`, fusionnés dans
`develop` par la pull request `#68` (`80db991`).

## 2 octobre 2026 - Recommandation personnalisée

### Séance quotidienne adaptée

J'ai relié l'accueil à la recommandation quotidienne afin d'afficher une séance
de course personnalisée avec son titre, sa durée, son intensité et la phase de
cycle prise en compte. L'écran prévoit aussi les états de chargement et d'erreur
pour que la recommandation reste compréhensible lorsque l'API est indisponible.

J'ai ajouté les tests de la route protégée de recommandation pour vérifier le
retour de la séance sauvegardée et l'unicité de la création quotidienne.

**Fonctionnalité concernée :** `US-CYCLE-002`, recommandation d'entraînement
personnalisée.

**Vérifications :** tests Jest backend, lint et formatage.

## 2 octobre 2026 - Ressenti après une séance

### Saisie facultative du ressenti

J'ai relié le lancement d'une séance au parcours de fin de séance, puis ajouté un
écran de ressenti rapide. L'utilisatrice peut noter son énergie, sa fatigue, sa
douleur et sa motivation sur une échelle de 1 à 5, ou passer cette étape sans
culpabilisation. Les données sont envoyées aux routes protégées existantes et
servent déjà à alléger la recommandation suivante lorsque le dernier ressenti
indique un besoin de récupération.

**Fonctionnalité concernée :** `US-FEEDBACK-001`, ressenti post-séance.

**Vérifications :** tests Jest backend, lint et formatage.

## 2 octobre 2026 - Visualisation des phases du cycle

### Frise prévisionnelle du cycle

J'ai enrichi l'écran Cycle avec une frise proportionnelle des phases, la mise en
avant de la phase actuelle et les dates prévisionnelles associées. Les repères
des règles et de l'ovulation sont désormais lisibles immédiatement, afin d'aider
l'utilisatrice à anticiper son cycle sans modifier le contrat API existant.

J'ai également renforcé le test de la vue de cycle pour vérifier la présence des
projections menstruelle et ovulatoire utilisées par l'interface.

**Fonctionnalité concernée :** `US-CYCLE-003`, visualisation des phases du cycle.

**Vérifications :** tests Jest ciblés des services et routes Cycle, lint et
formatage.

**Commits :** `465c84b`, `c95e76a`, fusionnés dans `develop` par la pull request
`#71` (`935eb26`).

## 2 octobre 2026 - Entraînement du jour

### Consolidation de l'US-WORKOUT-001

J'ai validé que la séance quotidienne est déjà disponible depuis le tableau de
bord : elle affiche le type, la durée et l'intensité, et s'adapte à la phase du
cycle. Cette couverture a été livrée avec `US-CYCLE-002`; je l'ai rattachée à
`US-WORKOUT-001` pour conserver un suivi backlog fidèle sans dupliquer le code.

**Vérifications :** 44 tests Jest backend, lint et formatage.
