# Automatisation du backlog Maïa

GitHub Issues est la source de vérité du backlog. Le manifeste versionné conserve
les identifiants stables et les champs nécessaires pour synchroniser le Project.

## Fichiers

- `manifest.json` : EPIC, US, priorités, estimations et état de planification.
- `proposition.md` : dry-run lisible qui a précédé le premier import.
- `scripts/backlog/sync.mjs` : synchronisation idempotente avec GitHub.

## Sécurité

Le token finement configuré pour `maia-organization` reste hors du dépôt. Pour une
commande locale :

```bash
export GH_TOKEN="$(<"$HOME/.config/maia/github-token")"
```

Ne jamais afficher, commiter ou copier ce token dans une Issue.

## Prévisualiser

La commande par défaut analyse le manifeste, calcule les sprints et recherche les
doublons sans modifier GitHub :

```bash
npm run backlog:plan
```

## Synchroniser

Après revue du plan :

```bash
npm run backlog:sync
```

La synchronisation :

- crée les labels absents ;
- crée ou retrouve les EPIC, US et Issues techniques ;
- ferme les éléments marqués `Done` et conserve les autres ouverts ;
- crée ou retrouve le Project `Maïa - Produit` ;
- configure statuts, priorités, estimations, sprints et dates ;
- ajoute les vues `Kanban` et `Roadmap` ;
- ajoute chaque Issue au Project sans doublon.

## Travailler sur une US

1. Retrouver l'Issue par son marqueur `maia-us-id`.
2. Vérifier ses critères d'acceptation avant de coder.
3. Mettre son statut à `In Progress` dans `manifest.json`, puis synchroniser.
4. Utiliser l'identifiant dans le nom de branche et les commits, par exemple
   `feat/US-PROFILE-001-edit-profile`.
5. Ajouter `Refs #NUMERO` au corps de la PR.
6. Mettre à jour `docs/log.md` dans la même PR.
7. Passer à `Review`, puis à `Done` après validation et merge.

Les descriptions d'Issues déjà importées ne sont pas remplacées automatiquement,
afin de préserver les décisions et échanges faits directement dans GitHub.
