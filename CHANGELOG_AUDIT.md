# Audit du projet

Date de l'audit : 2026-08-27
Périmètre : Tâche 1 uniquement. Aucun correctif fonctionnel de la Tâche 1 n'a été appliqué avant cette liste.

## Bugs confirmés

### AUDIT-001 — Résultats d'évaluation accessibles hors périmètre
- **Gravité : élevée**
- **Cause :** `resultats_evaluation` et `telecharger_rapport_pdf` filtrent uniquement les utilisateurs de rôle `PME`. Un consultant ou un administrateur authentifié peut consulter ou télécharger une évaluation d'une autre PME en connaissant son identifiant.
- **Correction prévue :** autoriser l'administrateur, et pour un consultant vérifier que la PME est liée par `ConsultantPME`. Refuser les autres accès.
- **Fichiers :** `backend/referentiel/views.py`

### AUDIT-002 — Réponses acceptées pour une question d'un autre référentiel
- **Gravité : élevée**
- **Cause :** `soumettre_reponses` charge `Question` par son identifiant global sans vérifier son appartenance à `evaluation.referentiel`.
- **Correction prévue :** filtrer la question par le référentiel de l'évaluation et retourner une erreur explicite si elle ne correspond pas.
- **Fichiers :** `backend/referentiel/views.py`

### AUDIT-003 — Nombre total de questions global au lieu du référentiel évalué
- **Gravité : élevée**
- **Cause :** `total_questions = Question.objects.count()` compte les questions de toutes les versions. Une nouvelle version rendrait les évaluations incohérentes ou impossibles à terminer.
- **Correction prévue :** compter uniquement `Question.objects.filter(theme__referentiel=evaluation.referentiel)`.
- **Fichiers :** `backend/referentiel/views.py`

### AUDIT-004 — Configuration de base non alignée avec l'environnement annoncé
- **Gravité : élevée**
- **Cause :** `settings.py` utilise SQLite en dur, alors que le projet doit utiliser PostgreSQL et que `psycopg2-binary` est installé. Aucun `DATABASE_URL` ou groupe de variables `DB_*` n'est lu.
- **Correction prévue :** charger la configuration via `.env` avec `python-dotenv`, utiliser PostgreSQL lorsque `DATABASE_URL` est fourni, et conserver SQLite uniquement comme fallback local explicite.
- **Fichiers :** `backend/config/settings.py`, `backend/requirements.txt`

### AUDIT-005 — Absence de modèle ML gérée, mais erreurs de chargement non interceptées
- **Gravité : moyenne**
- **Cause :** `joblib.load()` et `predict_proba()` sont appelés sans `try/except`. Un fichier absent est géré, mais un fichier corrompu, incompatible avec scikit-learn ou mal formé provoque une erreur 500.
- **Correction prévue :** intercepter les erreurs de chargement/prédiction, vérifier `n_features_in_` et retourner `disponible: false` avec une raison exploitable.
- **Fichiers :** `backend/referentiel/analytics.py`

### AUDIT-006 — Format d'entrée ML dépendant du référentiel courant
- **Gravité : moyenne**
- **Cause :** le modèle entraîné attend 6 variables : score global, 4 scores de thèmes et tendance. L'inférence construit le vecteur avec le nombre de thèmes du référentiel actif, qui peut différer de 4. Le modèle actuel a bien été vérifié avec `n_features_in_ = 6`, mais aucune vérification ne protège une future modification du référentiel.
- **Correction prévue :** contrôler le nombre et l'ordre des thèmes avant prédiction, ou versionner explicitement le schéma des features et réentraîner le modèle lorsqu'il change.
- **Fichiers :** `backend/referentiel/analytics.py`, `backend/referentiel/ml_training.py`

### AUDIT-007 — Prédiction proposée avec une seule évaluation
- **Gravité : moyenne**
- **Cause :** après une seule évaluation terminée, `tendance_pme` est indisponible mais `predire_progression` remplace la tendance par `0` et lance quand même le modèle. Cela donne une probabilité alors que l'historique est insuffisant pour une tendance fiable.
- **Correction prévue :** retourner `disponible: false`, `raison: "Pas assez de données pour une prédiction"` tant que le minimum d'historique défini n'est pas atteint.
- **Fichiers :** `backend/referentiel/analytics.py`

### AUDIT-008 — Score global de prédiction calculé par moyenne non pondérée
- **Gravité : moyenne**
- **Cause :** l'inférence calcule la moyenne des pourcentages des thèmes. Les thèmes actuels ont 7, 7, 8 et 7 questions : cette moyenne n'est pas exactement le pourcentage global du score réel. L'entraînement utilise la même convention synthétique, mais elle diverge du calcul métier de `ScoreCalculator`.
- **Correction prévue :** utiliser le même calcul global pondéré par le nombre de questions dans l'entraînement et l'inférence, puis réentraîner le modèle.
- **Fichiers :** `backend/referentiel/analytics.py`, `backend/referentiel/ml_training.py`

### AUDIT-009 — Paramètre `n_clusters` non validé
- **Gravité : moyenne**
- **Cause :** `segmentation_pme` convertit directement la valeur reçue par `int()`. Une valeur non numérique, nulle, négative ou supérieure au nombre de PME disponibles peut produire une erreur 500 ou une erreur KMeans.
- **Correction prévue :** valider un entier dans une plage sûre et retourner HTTP 400 avec un message clair.
- **Fichiers :** `backend/referentiel/views.py`, `backend/referentiel/analytics.py`

### AUDIT-010 — Historique vulnérable aux évaluations incohérentes
- **Gravité : moyenne**
- **Cause :** une évaluation `TERMINEE` peut encore avoir `date_fin` ou `score_total` à `NULL` au niveau modèle. L'historique et le calcul de niveau supposent pourtant ces valeurs présentes.
- **Correction prévue :** ajouter une validation métier/contrainte adaptée et ignorer ou signaler les évaluations terminées incomplètes.
- **Fichiers :** `backend/referentiel/models.py`, `backend/referentiel/analytics.py`

### AUDIT-011 — Migration de données dépendante du code applicatif courant
- **Gravité : faible**
- **Cause :** `0003_seed_questions_python.py` importe `referentiel.data.questions_initiales`. Modifier ou supprimer ce module peut empêcher de rejouer une migration historique sur une installation neuve.
- **Correction prévue :** figer les données dans la migration ou conserver un module de seed versionné et immuable.
- **Fichiers :** `backend/referentiel/migrations/0003_seed_questions_python.py`

## Points vérifiés sans bug confirmé

- Les routes Evolution utilisées par le frontend correspondent aux routes backend : `pme/evolution/`, `pme/tendance-par-theme/` et `pme/prediction/`.
- Les champs consommés par `Evolution.jsx` correspondent aux réponses du service : `historique`, `tendance`, `tendance.par_theme`, `probabilite_progression_6_mois` et `avertissement_methodologique`.
- Le modèle `progression_model.joblib` se charge actuellement sans erreur, est un `LogisticRegression`, attend 6 features et expose les classes `[0, 1]`.
- Une seule configuration `REST_FRAMEWORK` et une seule configuration `SIMPLE_JWT` sont présentes dans `settings.py`; aucun doublon contradictoire n'a été confirmé.
- Les routes de `referentiel` utilisent `IsAuthenticated` et/ou `IsPME`; aucun `AllowAny` n'y est présent. Les contrôles d'accès restent néanmoins insuffisants pour les résultats/PDF (AUDIT-001).
- `manage.py check` et les migrations passent actuellement.

## Couverture de tests

Des tests API couvrent désormais les permissions consultant, le multi-référentiel, la reprise d'évaluation, la segmentation invalide, le périmètre des demandes d'accompagnement et le filtrage du chatbot.

## Statut des corrections

Corrigé et validé le 2026-08-27 : AUDIT-001, AUDIT-002, AUDIT-003, AUDIT-004, AUDIT-005, AUDIT-006, AUDIT-007, AUDIT-008, AUDIT-009, AUDIT-010 et AUDIT-011.
