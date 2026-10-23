Epic & User Stories
MVP // BONUS // V2

1 : Gestion du Profil Utilisateur
1.1 : Création de compte
Permettre à une nouvelle utilisatrice de créer un compte complet pour personnaliser son expérience.

En tant que nouvelle utilisatrice
Je veux m’inscrire en fournissant des informations personnelles et sportives de base
Afin de recevoir des entraînements adaptés à mon profil et à mon cycle menstruel

Informations typiques à renseigner
Nom et prénom : pour personnaliser l’expérience et les notifications
Email et mot de passe : pour sécuriser le compte et permettre la connexion
Date de naissance : pour adapter les recommandations à l’âge
Poids et taille : pour calculer des indicateurs fitness si besoin
Niveau sportif (débutante, intermédiaire, avancée) : pour ajuster l’intensité des séances
Objectifs sportifs (perte de poids, endurance, performance) : pour proposer des entraînements adaptés
Cycle menstruel : date de début des règles et durée moyenne du cycle, afin d’adapter les séances selon la phase
Préférences de notifications : pour envoyer des rappels personnalisés
Critères d’acceptation :
L’utilisatrice peut remplir tous les champs facilement
Les champs obligatoires sont signalés et validés avant l’inscription
Une fois le compte créé, l’utilisatrice est redirigée vers son tableau de bord
Les données renseignées sont utilisées pour personnaliser les premières séances et conseils
1.2 : Se Connecter
Permettre à une nouvelle utilisatrice de pouvoir se connecter à son compte sur n’importe quel appareil.

En tant que utilisatrice
Je veux me connecter à mon compte de n’importe où
Afin de accéder à mes données, mes entraînements et mon suivi personnalisé
Critères d’acceptation :
L’utilisatrice peut saisir son email et mot de passe
La connexion fonctionne avec des identifiants valides
Un message d’erreur clair est affiché en cas d’identifiants incorrects
L’utilisatrice reste connectée pour éviter de se reconnecter à chaque ouverture
1.3 : Se déconnecter
Permettre à l’utilisatrice de sécuriser son compte.
En tant que utilisatrice
Je veux pouvoir me déconnecter de mon compte
Afin de protéger mes données personnelles
Critères d’acceptation :
Un bouton de déconnexion est accessible depuis le profil
L’utilisatrice est redirigée vers l’écran de connexion après déconnexion
Les données ne sont plus accessibles sans reconnexion
1.4 : Modifier son profil
Permettre à l’utilisatrice de mettre à jour ses informations.
En tant que utilisatrice
Je veux modifier mes informations personnelles et sportives
Afin de garder un profil à jour et des recommandations adaptées
Critères d’acceptation :
L’utilisatrice peut modifier ses informations (poids, niveau, objectifs, cycle, etc.)
Les modifications sont enregistrées immédiatement
Un message confirme la mise à jour
1.5 : Consulter son profil
Permettre à l’utilisatrice de voir ses informations.
En tant que utilisatrice
Je veux consulter mon profil
Afin de vérifier mes informations personnelles et sportives
Critères d’acceptation :
Toutes les informations du profil sont visibles clairement
Les données affichées correspondent aux dernières mises à jour
1.6 : Réinitialiser son mot de passe
Permettre à l’utilisatrice de récupérer l’accès à son compte.
En tant que utilisatrice
Je veux pouvoir réinitialiser mon mot de passe
Afin de récupérer l’accès à mon compte en cas d’oubli
Critères d’acceptation :
Un lien “mot de passe oublié” est accessible
L’utilisatrice peut recevoir un email de réinitialisation
Elle peut définir un nouveau mot de passe
1.7 : Gérer les préférences de notifications
Permettre à l’utilisatrice de contrôler ses rappels.
En tant que utilisatrice
Je veux activer ou désactiver les notifications
Afin de recevoir uniquement les rappels qui m’intéressent
Critères d’acceptation :
L’utilisatrice peut activer/désactiver les notifications
Elle peut choisir les types de notifications (entraînement, conseils, communauté)
Les préférences sont sauvegardées
1.8 : Onboarding UI
Guider l’utilisatrice lors de sa première visite de l’application.
En tant que nouvelle utilisatrice
Je veux être guidée lors de ma première utilisation
Afin de comprendre comment utiliser l’application
Critères d’acceptation :
Un parcours d’onboarding est proposé lors de la première ouverture
Les fonctionnalités clés sont présentées (profil, entraînement, cycle, communauté)
L’utilisatrice peut passer l’onboarding à tout moment
L’onboarding ne s’affiche plus après la première utilisation
Le contenu est clair, visuel et rapide à parcourir

1.9 : Suppression de compte
Permettre à l’utilisatrice de supprimer son compte ainsi que ses données à tout moment.
En tant que utilisatrice
Je veux supprimer mon compte
Afin de ne plus utiliser l’application et supprimer mes données personnelles
Critères d’acceptation :
Une option de suppression est accessible depuis le profil
Une confirmation est demandée avant suppression
Toutes les données personnelles sont supprimées
L’utilisatrice est déconnectée après suppression
Un message confirme la suppression du compte

1.10 : Confidentialité des données
Permettre à l’utilisatrice de contrôler la visibilité de ses données.
En tant que utilisatrice
Je veux gérer la confidentialité de mes données
Afin de choisir ce que je partage avec les autres utilisatrices
Critères d’acceptation :
L’utilisatrice peut choisir si son profil est public ou privé
Elle peut contrôler la visibilité de ses publications (publique / abonnés / privé)
Les données sensibles (cycle, stats) peuvent être masquées
Les paramètres sont facilement accessibles
Les préférences sont enregistrées immédiatement

2 : Gestion du Cycle et Personnalisation
2.1 : Gestion du cycle menstruel
Permettre à l’utilisatrice de saisir, suivre et ajuster ses informations sur son cycle pour personnaliser les entraînements et conseils.
En tant que utilisatrice
Je veux pouvoir renseigner mes dates de règles, la durée de mon cycle et ajuster ces informations au fil du temps
Afin de recevoir des entraînements et conseils adaptés à ma phase du cycle, optimiser mes performances et mon bien-être

Critères d’acceptation :
L’utilisatrice peut saisir la date de début et la durée moyenne de son cycle
L’application mémorise ces informations pour générer les séances quotidiennes
L’utilisatrice peut modifier ces informations à tout moment
La phase actuelle du cycle est prise en compte dans les recommandations
2.2 : Recommandation d'entraînement personnalisé
Proposer automatiquement des séances de running adaptées au profil de l’utilisatrice et à son état physiologique.

En tant que utilisatrice de l’application
Je veux recevoir des entraînements personnalisés en fonction de mon niveau, de mes objectifs et de mon cycle menstruel
Afin d'optimiser mes performances, rester régulière dans ma pratique et m’entraîner en respectant mon corps

Critères d’acceptation :
L’application propose automatiquement une séance (durée, type, intensité)
Les recommandations prennent en compte : niveau, objectifs et cycle menstruel
Les séances évoluent dans le temps selon les données utilisateur
L’utilisatrice peut indiquer son ressenti pour ajuster les prochaines séances
2.3 : Gestion du ressenti
Permettre à l’utilisatrice d’exprimer son état physique et mental après une séance.
En tant que utilisatrice
Je veux indiquer mon état (fatigue, énergie, douleur) après une séance
Afin de adapter les futurs entraînements
Critères d’acceptation :
L’utilisatrice peut renseigner son ressenti après une séance
Des options simples sont proposées (fatigue, énergie, douleur, motivation)
Le ressenti est enregistré dans l’historique
Les données influencent les prochaines recommandations
L’ajout du ressenti est rapide et facultatif
2.4 : Visualiser son cycle
Permettre à l’utilisatrice de visualiser simplement son cycle.
En tant que utilisatrice
Je veux voir mon cycle sous forme de calendrier ou de timeline
Afin de comprendre où j’en suis et anticiper mes phases
Critères d’acceptation :
Le cycle est affiché de manière visuelle (calendrier ou frise)
La phase actuelle est clairement indiquée
Les phases futures sont visibles (prévisions)
Les règles et ovulation sont identifiables facilement
2.5 : Adapter manuellement une recommandation
Permettre à l’utilisatrice d’ajuster une séance proposée.
En tant que utilisatrice
Je veux modifier une séance recommandée
Afin de l’adapter à mon état du moment
Critères d’acceptation :
L’utilisatrice peut réduire ou augmenter l’intensité
Elle peut changer le type de séance (ex : footing → marche)
La modification est prise en compte dans le suivi
Les prochaines recommandations s’adaptent
2.6 : Prendre en compte les symptômes
Permettre d’affiner la personnalisation avec les symptômes.
En tant que utilisatrice
Je veux indiquer mes symptômes (douleurs, fatigue, humeur…)
Afin de recevoir des recommandations encore plus adaptées
Critères d’acceptation :
L’utilisatrice peut sélectionner des symptômes simples
Ces données influencent les séances proposées
L’ajout est rapide et non obligatoire
Les symptômes sont visibles dans l’historique
2.7 : Gérer la confidentialité
Permettre à l’utilisatrice de contrôler la visibilité de ses données et de ses activités.
En tant que utilisatrice
Je veux gérer la confidentialité de mon profil et de mes publications
Afin de protéger mes données personnelles et choisir ce que je partage avec la communauté
Critères d’acceptation :
L’utilisatrice peut accéder facilement aux paramètres de confidentialité
Elle peut choisir la visibilité de son profil
Elle peut définir la visibilité de chaque course partagée
Les informations sensibles peuvent être masquées
Les paramètres sont appliqués immédiatement
Les autres utilisatrices voient uniquement les données autorisées
L’utilisatrice peut modifier ses choix à tout moment
2.7 : Signaler / modérer
Permettre de garantir un environnement sûr et respectueux dans la communauté.
En tant que utilisatrice
Je veux pouvoir signaler un contenu ou bloquer une personne
Afin de me sentir en sécurité et éviter les comportements inappropriés

Critères d’acceptation :
Un bouton “Signaler” est accessible sur chaque contenu
L’utilisatrice peut choisir le motif du signalement
Le signalement est envoyé et pris en compte
L’utilisatrice peut bloquer une autre utilisatrice
Le contenu bloqué n’est plus visible
Une confirmation est affichée après signalement
Le système garantit la confidentialité du signalement

3 : Communauté
3.1 : Accéder à l’onglet Communauté
Permettre à l’utilisatrice d’accéder facilement à un espace d’échange entre runneuses.

En tant que utilisatrice
Je veux accéder à un onglet Communauté
Afin de voir les activités et échanger avec d’autres femmes qui pratiquent le running

Critères d’acceptation :
Un onglet “Communauté” est visible dans la navigation principale
L’utilisatrice peut y accéder en un clic
Le fil d’actualité s’affiche correctement
Les contenus sont actualisés automatiquement
L’expérience est fluide et rapide

3.2 : Envoyer un message
Permettre à l’utilisatrice d’échanger avec d’autres membres.

En tant que utilisatrice
Je veux envoyer un message à une autre utilisatrice
Afin de discuter, partager des conseils ou me motiver

Critères d’acceptation :
L’utilisatrice peut accéder à une messagerie
Elle peut sélectionner une personne ou une conversation
Elle peut envoyer un message texte
Le message est reçu instantanément par l’autre utilisatrice
Une notification est envoyée à la réception
L’historique des messages est conservé

3.3 : Publier sa course
Permettre à l’utilisatrice de partager ses performances.

En tant que utilisatrice
Je veux publier ma course dans la communauté
Afin de partager mes progrès et motiver les autres

Critères d’acceptation :
L’utilisatrice peut partager une course après l’avoir terminée
Les données (distance, durée, allure) sont automatiquement ajoutées
Elle peut ajouter un commentaire ou un ressenti
Elle peut choisir la visibilité (publique ou privée)
Le post apparaît dans le fil de la communauté
Les autres utilisatrices peuvent liker et commenter

3.4 : Consulter le fil d’actualité
Permettre à l’utilisatrice de suivre l’activité des autres.

En tant que utilisatrice
Je veux consulter les publications de la communauté
Afin de m’inspirer et rester motivée

Critères d’acceptation :
Les publications sont affichées sous forme de fil
Les contenus sont triés par ordre chronologique ou pertinence
Chaque post affiche :
performance
message
interactions
L’utilisatrice peut faire défiler facilement
Le chargement est rapide et fluide

3.5 : Créer des groupes de runneuses
Permettre aux utilisatrices de créer et rejoindre des groupes pour courir ensemble et se motiver.

En tant que utilisatrice
Je veux créer ou rejoindre un groupe de runneuses
Afin de partager des objectifs communs, échanger et me motiver avec des personnes ayant un profil similaire

Critères d’acceptation
L’utilisatrice peut créer un groupe facilement
Elle peut définir les paramètres du groupe (nom, niveau, objectif, etc.)
Les autres utilisatrices peuvent rechercher et rejoindre un groupe
L’utilisatrice peut voir la liste des membres
Un espace dédié permet d’échanger (messages, publications)
Les activités du groupe sont visibles dans un fil spécifique
L’utilisatrice peut quitter un groupe à tout moment
Les paramètres de confidentialité (public/privé) sont respectés

3.6 : Suivre une utilisatrice
Permettre à l’utilisatrice de suivre d’autres utilisatrices pour voir leur contenu en priorité.
En tant que utilisatrice
Je veux m’abonner à d’autres utilisatrices
Afin de voir leurs publications en priorité
Critères d’acceptation :
L’utilisatrice peut s’abonner à une autre utilisatrice
Elle peut se désabonner à tout moment
Les publications des personnes suivies apparaissent en priorité
Une liste des abonnements est accessible
Une notification peut être envoyée lors d’un nouvel abonné

4 : Entrainements et Suivi des performances
4.1 : Voir l’entraînement du jour
Permettre à l’utilisatrice de consulter facilement sa séance quotidienne.
En tant que utilisatrice
Je veux voir l’entraînement recommandé pour aujourd’hui avec sa durée et son type
Afin de savoir exactement quoi faire pour ma séance

Critères d’acceptation :
L’application affiche la séance du jour avec le type d’exercice et la durée
Les séances sont adaptées à la phase actuelle du cycle menstruel
La séance peut être visualisée directement depuis le tableau de bord
4.2 : Lancer une séance de running
Permettre à l’utilisatrice de lancer, mettre en pause et arrêter une séance de running
En tant que utilisatrice
Je veux lancer une séance de course depuis l’application
Afin de suivre ma performance en temps réel
Critères d’acceptation :
L’utilisatrice peut démarrer / mettre en pause / arrêter une séance
La distance et la durée sont suivies en temps réel
Les données sont enregistrées à la fin de la séance
4.3 : Marquer un entraînement comme terminé
Permettre à l’utilisatrice de suivre ses séances et voir ses progrès.
En tant que utilisatrice
Je veux pouvoir indiquer qu’une séance est terminée
Afin de suivre mon évolution et garder un historique de mes entraînements

Critères d’acceptation :
L’utilisatrice peut cliquer sur un bouton ou cocher une option pour marquer la séance comme terminée
L’entraînement terminé est visuellement identifié dans le plan du jour
L’historique des séances est mis à jour automatiquement pour refléter les entraînements complétés
4.4 : Consulter ses statistiques
Permettre à l’utilisatrice de visualiser ses progrès en running.
En tant que utilisatrice
Je veux voir le nombre de séances effectuées, la distance totale parcourue et la distance moyenne par séance
Afin de suivre mon évolution et rester motivée
Critères d’acceptation (complétés) :
L’application affiche le nombre total de séances
La distance cumulée et moyenne sont visibles
Les données se mettent à jour après chaque séance
Les statistiques sont accessibles depuis le tableau de bord

4.5 : Consulter l’historique des entraînements
Permettre à l’utilisatrice de consulter l’historique de ses entraînements.
En tant que utilisatrice
Je veux voir la liste de mes séances passées
Afin de suivre mon évolution dans le temps
Critères d’acceptation :
Les séances passées sont listées avec date, durée et type
Les séances terminées sont clairement identifiées
L’historique est triable par date
4.6 : Planifier ses séances
Permettre à l’utilisatrice d’organiser sa semaine.
En tant que utilisatrice
Je veux planifier mes séances à l’avance
Afin de organiser mon entraînement dans mon emploi du temps
Critères d’acceptation :
L’utilisatrice peut voir une semaine complète
Elle peut déplacer ou choisir des séances
Les séances tiennent compte du cycle
Un planning est sauvegardé
4.7 : Recevoir un résumé après séance
Donner un retour immédiat après un entraînement.
En tant que utilisatrice
Je veux voir un résumé de ma séance
Afin de comprendre ma performance
Critères d’acceptation :
Un écran récap s’affiche après la séance
Les infos clés sont visibles (durée, distance, allure)
Un message motivant est affiché
Le ressenti peut être ajouté directement
4.8 : Se fixer un objectif hebdomadaire
Permettre de structurer la progression.
En tant que utilisatrice
Je veux définir un objectif hebdomadaire
Afin de rester motivée et progresser
Critères d’acceptation :
L’utilisatrice peut définir un objectif (nb séances, distance…)
La progression est affichée
L’objectif est ajustable
Une notification peut rappeler l’objectif
4.9 : Recevoir des encouragements
Motiver l’utilisatrice dans sa pratique.
En tant que utilisatrice
Je veux recevoir des messages de motivation
Afin de rester engagée dans mon entraînement
Critères d’acceptation :
Des messages apparaissent avant/après séance
Le contenu est adapté au contexte (cycle, performance)
Les messages sont positifs et personnalisés
Ils ne sont pas intrusifs
5 : Contenu et Education
5.1 : Informations sur les menstruations
Fournir à l’utilisatrice des informations claires et pédagogiques sur les menstruations et leur impact sur la pratique sportive.

En tant que utilisatrice de l’application
Je veux Accéder à des contenus informatifs sur mon cycle menstruel et comprendre son influence sur mes performances sportives
Afin de Mieux comprendre mon corps, adapter mes entraînements et me sentir plus confiante dans ma pratique du running

Critères d’acceptation :
L’utilisatrice peut accéder facilement à une section “Comprendre mon cycle”
Les contenus sont clairs, pédagogiques et accessibles (pas trop médicaux)
Les informations sont organisées par phase du cycle
L’utilisatrice peut consulter rapidement : les impacts sur le sport, les recommandations associées
Des visuels ou schémas facilitent la compréhension

Les contenus sont consultables à tout moment depuis l’application
Les informations sont cohérentes avec les données personnelles renseignées (cycle, profil)
L’utilisatrice peut enregistrer ou mettre en favori certains contenus
6 : Engagement et Notification
6.1 : Recevoir des notifications d’entraînement
Aider l’utilisatrice à rester régulière dans ses séances.
En tant que utilisatrice
Je veux recevoir un rappel quotidien pour mon entraînement
Afin de ne pas oublier ma séance et rester motivée

Critères d’acceptation :
L’utilisatrice peut choisir l’heure de la notification
La notification indique la séance du jour
L’utilisatrice peut activer/désactiver les notifications à tout moment
6.2 : Recevoir des notifications sociales
En tant que utilisatrice
Je veux être notifiée quand quelqu’un interagit avec mes publications
Afin de rester engagée avec la communauté
Critères d’acceptation :
Notification en cas de like ou commentaire
Accès direct à la publication depuis la notification
Possibilité de désactiver ces notifications
6.3 : Recevoir des notifications liées au cycle
Informer l’utilisatrice des moments clés de son cycle et lui proposer des conseils adaptés pour ses entraînements et son bien-être.
En tant que utilisatrice
Je veux recevoir des notifications en fonction de ma phase de cycle
Afin de adapter mes séances, anticiper mon état physique et mieux comprendre mon corps
Critères d’acceptation :
L’utilisatrice reçoit des notifications aux moments clés du cycle (début des règles, ovulation, etc.)
Les notifications contiennent des conseils simples et adaptés (repos, intensité, motivation…)
Le contenu est cohérent avec les données du cycle renseignées
L’utilisatrice peut activer ou désactiver ces notifications
Les notifications restent non intrusives et personnalisées
Un accès rapide vers les recommandations associées est proposé depuis la notification

7 : Expérience de navigation mobile

7.1 : Naviguer facilement entre les sections de l’application

Permettre à l’utilisatrice de se déplacer rapidement et naturellement entre les sections principales de Maïa.

En tant que utilisatrice de l’application mobile
Je veux accéder aux sections principales depuis une barre de navigation fixe et pouvoir passer d’une section à l’autre par bouton ou par balayage horizontal
Afin de retrouver rapidement mes repères et de profiter de transitions agréables entre les écrans

Critères d’acceptation :
Une barre de navigation est fixée en bas des écrans principaux de l’application mobile
La barre respecte les zones sûres de l’appareil et reste utilisable lorsque le clavier est affiché
La section active est identifiable visuellement et chaque bouton mène à la section correspondante en un appui
Un balayage horizontal de droite à gauche ou de gauche à droite permet d’accéder à la section principale adjacente, sans gêner les gestes propres au contenu de l’écran
Le passage par bouton ou par balayage fournit un retour visuel clair et une animation cohérente entre les écrans
Les animations respectent la préférence système de réduction des animations
La navigation est utilisable au lecteur d’écran et au clavier, avec des libellés accessibles pour chaque destination
