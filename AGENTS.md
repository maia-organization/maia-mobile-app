# Consignes du dépôt Maïa

Ce fichier contient les règles permanentes du projet.
Appliquer uniquement les sections pertinentes pour la tâche en cours.

## Principes généraux

- Effectuer le changement minimal nécessaire pour répondre à la demande.
- Ne pas modifier de fichiers sans rapport avec la tâche.
- Préférer une recherche ciblée dans le dépôt avant d'ouvrir de nombreux fichiers.
- Ne pas parcourir l'ensemble du dépôt lorsqu'un périmètre plus précis suffit.
- Consulter uniquement la documentation pertinente pour la tâche.
- Commencer par les tests et vérifications ciblés avant d'élargir la validation.
- Ne pas créer ou déléguer à plusieurs agents lorsqu'un seul contexte de travail suffit.
- Signaler avant modification tout changement important de contrat API, schéma de données ou architecture qui n'est pas explicitement demandé.

## Product et Backlog

Responsable de la compréhension du besoin et de la préparation des User Stories.

Consulter selon le besoin :

- `docs/projet.md` pour la vision et le périmètre global du produit ;
- `docs/spec.md` pour le comportement fonctionnel concerné ;
- `docs/spec_tech.md` lorsqu'une User Story implique des contraintes techniques ;
- `docs/log.md` seulement lorsque l'historique d'une fonctionnalité est nécessaire.

Pour le backlog :

- Transformer les notes brutes `.txt` ou `.md` en User Stories orientées valeur.
- Regrouper les formulations équivalentes et attribuer un identifiant stable à chaque US.
- Avant de créer une Issue, rechercher d'abord son identifiant `maia-us-id`.
- En l'absence de correspondance, rechercher ensuite les titres et termes fonctionnels proches.
- Élargir la recherche uniquement lorsqu'un doublon reste plausible.
- Présenter un dry-run avant toute création ou modification importante sur GitHub.
- Ne jamais développer une fonctionnalité pendant une phase d'import du backlog.

## Frontend Mobile

Responsable de l'expérience React Native et Expo avec une approche mobile-first.

Consulter selon la tâche :

- `docs/charte_graphique.md` pour les changements visuels ou d'interface ;
- la partie pertinente de `docs/spec.md` lorsqu'un comportement produit est concerné ;
- `docs/spec_tech.md` lorsqu'un changement affecte l'architecture frontend, les contrats API ou les choix techniques.

Règles :

- Respecter les composants, couleurs, typographies, animations et espacements de Maïa.
- Vérifier les parcours concernés, notamment les états de chargement et d'erreur.
- Tenir compte du clavier mobile et de l'accessibilité lorsque l'écran concerné le nécessite.
- Tester les changements d'interface sur des dimensions mobiles avant de considérer la preview web comme validation suffisante.

## Backend

Responsable de l'API Fastify, PostgreSQL et des règles métier.

Consulter selon la tâche :

- la partie pertinente de `docs/spec.md` pour le comportement métier ;
- `docs/spec_tech.md` pour les contrats API, l'authentification, les changements de schéma ou d'architecture.

Règles :

- Respecter les formats de réponse, l'authentification JWT et les validations existantes.
- Faire évoluer Drizzle avec une migration versionnée pour chaque changement de schéma.
- Ajouter ou adapter les tests ciblés correspondant au comportement modifié.
- Ajouter un scénario d'intégration PostgreSQL uniquement lorsqu'il apporte une validation utile.
- Ne pas modifier le schéma, les contrats API ou l'authentification pour résoudre un problème sans nécessité démontrée.

## Infrastructure

Responsable de Docker, Nginx, GitHub Actions, SonarCloud et des secrets.

Consulter selon la tâche :

- `docs/tech.md` pour l'architecture technique globale ;
- les sections infrastructure pertinentes de `docs/spec_tech.md` lorsqu'un changement affecte l'architecture ou le déploiement ;
- `README.md` lorsqu'une commande, une procédure d'installation ou un comportement documenté doit changer.

Règles :

- Préserver la compatibilité entre le frontend, l'API, la gateway et PostgreSQL.
- Ne jamais versionner de secret.
- Épingler les actions tierces de CI sur un SHA immuable.
- Isoler les changements CI/CD importants sur une branche dédiée.
- Vérifier les workflows concernés après modification.

## Règles GitHub Backlog

Les fichiers de tâches sont une entrée temporaire. Les GitHub Issues deviennent la source de vérité après import.

Chaque Issue générée contient un marqueur stable :

`<!-- maia-us-id: IDENTIFIANT -->`

Pour éviter les doublons :

1. rechercher l'identifiant stable ;
2. rechercher le titre normalisé et les termes fonctionnels proches ;
3. élargir la recherche seulement si nécessaire.

Aucune Issue, aucun label et aucun élément de Project n'est créé sans dry-run validé.

Une User Story comprend au minimum :

- la persona ;
- le besoin ;
- le bénéfice ;
- les critères d'acceptation.

Les tâches techniques ne sont ajoutées que lorsqu'elles sont utiles à la réalisation ou au suivi.

### Synchronisation GitHub Project entre contextes

Le jeton utilisé par un contexte n'est pas nécessairement celui configuré dans
`gh`. Pour toute lecture ou écriture du Project, fournir explicitement le jeton
organisationnel, sans jamais l'afficher :

```bash
GH_TOKEN="$(<"$HOME/.config/maia/github-token")" npm run backlog:plan
GH_TOKEN="$(<"$HOME/.config/maia/github-token")" npm run backlog:sync
```

- Toujours exécuter et contrôler le dry-run avant `backlog:sync`.
- Attendre la fin du processus de synchronisation : il traite tous les éléments
  du Project et peut dépasser la durée d'un premier poll du terminal.
- Vérifier ensuite le statut distant avec :

  ```bash
  GH_TOKEN="$(<"$HOME/.config/maia/github-token")" gh issue view <numéro> --json state,projectItems
  ```

- L'avertissement indiquant que le lien repository du Project est ignoré avec un
  jeton fine-grained est non bloquant. La synchronisation est réussie seulement
  lorsque le script affiche `Synchronized ... Issues`.
- Après merge et CI validée, passer l'US à `Done` dans le manifeste, synchroniser
  le Project, puis versionner ce changement sur `develop`.

## Cycle d'une modification

Le workflow GitHub complet s'applique aux fonctionnalités, bugs planifiés et changements d'infrastructure destinés à être intégrés au produit.

Pour ces changements :

1. rechercher l'US ou l'Issue technique correspondante ;
2. comparer la demande aux critères de l'Issue et signaler les écarts significatifs ;
3. passer son statut à `In Progress` dans le manifeste et synchroniser le Project lorsque le workflow le nécessite ;
4. utiliser l'identifiant stable dans la branche, la PR et les commits concernés ;
5. pousser la branche dédiée vers `origin` et ouvrir une PR avant de considérer
   l'implémentation remise ;
6. mettre à jour les critères réellement satisfaits ;
7. passer l'Issue à `Review` lors de la PR ;
8. passer l'Issue à `Done` uniquement après validation et merge.

Si aucune Issue ne correspond à une fonctionnalité ou un bug planifié, préparer une nouvelle US, vérifier les doublons et présenter le dry-run avant création.

Ne pas imposer ce workflow complet aux :

- investigations ;
- diagnostics ;
- prototypes locaux ;
- modifications temporaires ;
- corrections purement mécaniques ;
- opérations de formatage ou de lint sans changement de comportement.

Ces travaux peuvent être rattachés à une Issue existante lorsqu'elle est pertinente.

## Journal de développement

Mettre à jour `docs/log.md` pour les changements significatifs :

- nouvelle fonctionnalité ;
- correction ayant un impact utilisateur ;
- changement d'architecture ;
- changement d'infrastructure ou de CI/CD ;
- changement important de dépendances ;
- modification significative du comportement produit.

Ne pas créer une entrée pour les changements purement mécaniques tels que :

- formatage ;
- lint ;
- renommage interne ;
- commentaires ;
- réorganisation sans changement de comportement ;
- ajout ou adaptation de tests sans changement produit associé.

Lorsqu'une entrée est nécessaire, l'ajouter à la fin du journal et préciser :

- la date ;
- la fonctionnalité, l'EPIC ou le chantier concerné ;
- ce qui a été réalisé et pourquoi ;
- les vérifications importantes ;
- les commits concernés lorsqu'ils sont connus.

Le journal est rédigé à la première personne comme un carnet de bord du projet.

## Utilisation efficace du contexte

Avant d'ouvrir un fichier volumineux, rechercher d'abord les symboles, routes, composants ou termes concernés.

Privilégier les recherches ciblées dans les dossiers concernés plutôt qu'une exploration complète du dépôt.

Ne pas lire une documentation uniquement parce qu'elle existe : la consulter lorsqu'elle apporte du contexte utile à la tâche.

Pendant l'implémentation, privilégier les tests ciblés. Exécuter une validation plus large lorsque le changement est stabilisé ou lorsque son impact le justifie.

À la fin d'une tâche, fournir un compte rendu concis contenant uniquement :

- les principaux fichiers modifiés ;
- le comportement modifié ;
- les vérifications effectuées ;
- les risques ou travaux restant éventuellement à réaliser.
