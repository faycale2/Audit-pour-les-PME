import random
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

NOMS_THEMES_ORDRE = [
    "Gouvernance, Politique et RH",
    "Gestion des Accès et Authentification",
    "Sécurité Physique et Infrastructure",
    "Incidents, Continuité et Conformité",
]


def _simuler_trajectoire_pme(n_mois=24):
    """
    Simule l'évolution mensuelle (en %) des 4 thèmes d'une PME fictive sur n_mois.
    Chaque PME a une "culture de progression" propre (dérive de base + bruit),
    tirée aléatoirement, pour représenter la diversité réelle entre PME.
    """
    derive_globale = random.gauss(0.3, 0.6)
    theme_pourcentages = [random.uniform(10, 60) for _ in NOMS_THEMES_ORDRE]

    trajectoire = []
    for mois in range(n_mois):
        theme_pourcentages = [
            max(0, min(100, p + derive_globale + random.gauss(0, 3)))
            for p in theme_pourcentages
        ]
        trajectoire.append(list(theme_pourcentages))
    return trajectoire


def generer_jeu_entrainement(n_pme=300, n_mois=24, horizon_mois=6, seuil_progression=5):
    """
    Génère un jeu de données synthétique : pour chaque PME fictive et chaque mois
    d'observation, calcule les features à cet instant (score global %, % par thème,
    tendance récente) et l'étiquette (1 si le score global a progressé d'au moins
    `seuil_progression` points de % dans les `horizon_mois` mois suivants, 0 sinon).
    """
    X, y = [], []

    for _ in range(n_pme):
        trajectoire = _simuler_trajectoire_pme(n_mois=n_mois)

        for t in range(3, n_mois - horizon_mois):
            themes_t = trajectoire[t]
            score_global_t = sum(themes_t) / len(themes_t)

            themes_t_moins_3 = trajectoire[t - 3]
            score_t_moins_3 = sum(themes_t_moins_3) / len(themes_t_moins_3)
            tendance_recente = (score_global_t - score_t_moins_3) / 3

            themes_futur = trajectoire[t + horizon_mois]
            score_futur = sum(themes_futur) / len(themes_futur)

            label = 1 if (score_futur - score_global_t) >= seuil_progression else 0

            X.append([score_global_t, *themes_t, tendance_recente])
            y.append(label)

    return np.array(X), np.array(y)


def entrainer_modele(n_pme=300):
    """Entraîne une régression logistique sur le jeu synthétique et retourne le modèle + ses métriques."""
    X, y = generer_jeu_entrainement(n_pme=n_pme)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    modele = LogisticRegression(max_iter=1000)
    modele.fit(X_train, y_train)

    precision_train = accuracy_score(y_train, modele.predict(X_train))
    precision_test = accuracy_score(y_test, modele.predict(X_test))

    metriques = {
        "n_exemples_entrainement": len(X_train),
        "n_exemples_test": len(X_test),
        "precision_train": round(precision_train, 3),
        "precision_test": round(precision_test, 3),
        "proportion_positifs": round(float(y.mean()), 3),
    }
    return modele, metriques