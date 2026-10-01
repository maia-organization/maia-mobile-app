# Consignes du dépôt Maïa

Ce fichier définit des rôles de travail pour Codex et les contributeurs. Ils sont
utilisés selon la nature de la tâche, sans multiplier inutilement les agents.

## Agent Product et Backlog

Responsable de la compréhension du besoin et de la préparation des User Stories.

- Lire `docs/projet.md`, `docs/spec.md`, `docs/spec_tech.md` et `docs/log.md` avant
  de structurer le backlog.
- Transformer les notes brutes `.txt` ou `.md` en User Stories orientées valeur.
- Regrouper les formulations équivalentes et attribuer un identifiant stable à
  chaque US.
- Vérifier toutes les Issues, ouvertes et fermées, avant toute création.
- Présenter un dry-run et attendre sa validation avant d'écrire sur GitHub.
- Ne jamais développer une fonctionnalité pendant une phase d'import du backlog.

## Agent Frontend Mobile

Responsable de l'expérience React Native et Expo, avec une approche mobile-first.

- Lire `docs/charte_graphique.md`, `docs/spec.md` et les sections frontend de
  `docs/spec_tech.md` avant toute modification visuelle.
- Respecter les composants, couleurs, typographies, animations et espacements de
  la marque Maïa.
- Vérifier les parcours complets, les états de chargement, les erreurs, le clavier
  mobile et l'accessibilité.
- Tester les changements sur des dimensions mobiles avant la preview web.

## Agent Backend

Responsable de l'API Fastify, de PostgreSQL et des règles métier.

- Lire `docs/spec_tech.md` et le modèle fonctionnel correspondant dans
  `docs/spec.md`.
- Respecter les formats de réponse, l'authentification JWT et les validations du
  projet.
- Faire évoluer Drizzle avec une migration versionnée pour chaque changement de
  schéma.
- Ajouter des tests ciblés et, lorsque nécessaire, un scénario d'intégration avec
  PostgreSQL.

## Agent Infrastructure

Responsable de Docker, Nginx, GitHub Actions, SonarCloud et des secrets.

- Lire `README.md`, `docs/tech.md` et les contraintes d'infrastructure de
  `docs/spec_tech.md`.
- Préserver la compatibilité entre le frontend, l'API, la gateway et PostgreSQL.
- Ne jamais versionner de secret et épingler les actions tierces de la CI sur un
  SHA immuable.
- Isoler les changements CI/CD sur une branche dédiée et vérifier les workflows
  après merge.

## Règles GitHub Backlog

- Les fichiers de tâches sont une entrée temporaire; les GitHub Issues deviennent
  la source de vérité après import.
- Chaque Issue générée contient un marqueur stable
  `<!-- maia-us-id: IDENTIFIANT -->` utilisé pour la déduplication.
- Une correspondance par identifiant est prioritaire; une correspondance par titre
  normalisé sert de seconde sécurité.
- Aucune Issue, aucun label et aucun élément de Project ne sont créés sans dry-run
  validé.
- Une US comprend au minimum la persona, le besoin, le bénéfice et les critères
  d'acceptation. Les tâches techniques ne sont ajoutées que si elles sont utiles.

## Cycle d'une modification

Pour chaque demande qui modifie le produit ou son infrastructure :

1. chercher l'US ou l'Issue technique correspondante avant de toucher au code ;
2. comparer la demande aux critères de l'Issue et signaler les écarts utiles ;
3. passer son statut à `In Progress` dans le manifeste et synchroniser le Project ;
4. inclure l'identifiant stable dans la branche, la PR et les commits concernés ;
5. mettre à jour `docs/log.md` et les critères réellement satisfaits ;
6. passer l'Issue à `Review` lors de la PR, puis à `Done` uniquement après
   validation et merge.

Si aucune Issue ne correspond, préparer d'abord une nouvelle US, vérifier les
doublons et la présenter avant sa création. Un commit purement documentaire peut
utiliser une Issue technique regroupée lorsque cela reste cohérent.

## Journal de développement

Toute modification du code, de l'infrastructure, de la CI/CD, des dépendances ou
du comportement utilisateur doit mettre à jour `docs/log.md` dans la même pull
request.

Ajouter l'entrée à la fin du journal afin de conserver l'ordre chronologique et
préciser :

- la date ;
- la fonctionnalité, l'EPIC ou le chantier concerné ;
- ce qui a été réalisé et pourquoi ;
- les vérifications importantes ;
- le ou les commits concernés lorsqu'ils sont connus.

Le journal est rédigé à la première personne, comme un carnet de bord du projet.
Les changements purement documentaires peuvent être regroupés dans une seule
entrée.
