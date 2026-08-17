import math
from django.db.models import Avg
from django.utils import timezone
from accounts.models import PME
from referentiel.models import Evaluation, Referentiel
from referentiel.services import ScoreCalculator


class AnalysePredictiveComparative:
    """
    Service d'analyse comparative et prédictive :
    - évolution des scores d'une PME dans le temps
    - tendance pondérée par le temps réel écoulé (régression pondérée)
    - comparaison au benchmark (moyenne globale ou sectorielle)
    - segmentation des PME par profil de maturité (K-means, réservé aux consultants/admin)
    """

    # -------------------------------------------------------------
    @staticmethod
    def historique_pme(pme):
        """Liste chronologique des évaluations terminées d'une PME."""
        evaluations = (
            Evaluation.objects
            .filter(pme=pme, statut=Evaluation.STATUT_TERMINEE)
            .order_by("date_fin")
        )
        historique = []
        for i, ev in enumerate(evaluations):
            historique.append({
                "index": i,
                "evaluation_id": ev.id,
                "date": ev.date_fin,
                "score_total": ev.score_total,
                "score_maximum": ev.referentiel.score_maximum,
                "niveau": AnalysePredictiveComparative._niveau_depuis_score(ev),
            })
        return historique

    @staticmethod
    def _niveau_depuis_score(evaluation):
        calc = ScoreCalculator(evaluation)
        return calc.determiner_niveau_maturite(evaluation.score_total)

    # -------------------------------------------------------------
    @staticmethod
    def tendance_pme(pme, demi_vie_jours=60):
        """
        Régression linéaire PONDÉRÉE dans le temps :
        - l'axe X est le nombre de jours réels écoulés depuis la 1ère évaluation
          (et non un simple index), pour respecter l'espacement réel des mesures ;
        - chaque évaluation est pondérée selon son ancienneté (poids qui diminue
          de moitié tous les `demi_vie_jours` jours), pour que les mesures récentes
          pèsent davantage dans la tendance qu'une mesure ancienne.
        Retourne la pente, la tendance qualitative, le score estimé "aujourd'hui",
        et un indice R² (qualité de l'ajustement).
        """
        historique = AnalysePredictiveComparative.historique_pme(pme)
        n = len(historique)

        if n < 2:
            return {
                "disponible": False,
                "raison": "Au moins 2 évaluations terminées sont nécessaires pour calculer une tendance.",
                "nb_evaluations": n,
            }

        date_premiere = historique[0]["date"]
        maintenant = timezone.now()

        xs, ys, poids = [], [], []
        for point in historique:
            jours_ecoules_depuis_debut = (point["date"] - date_premiere).total_seconds() / 86400
            anciennete_jours = (maintenant - point["date"]).total_seconds() / 86400
            w = 0.5 ** (anciennete_jours / demi_vie_jours)  # poids exponentiel décroissant avec l'ancienneté

            xs.append(jours_ecoules_depuis_debut)
            ys.append(point["score_total"])
            poids.append(w)

        somme_poids = sum(poids)
        moyenne_x = sum(w * x for w, x in zip(poids, xs)) / somme_poids
        moyenne_y = sum(w * y for w, y in zip(poids, ys)) / somme_poids

        numerateur = sum(w * (x - moyenne_x) * (y - moyenne_y) for w, x, y in zip(poids, xs, ys))
        denominateur = sum(w * (x - moyenne_x) ** 2 for w, x in zip(poids, xs))

        pente = numerateur / denominateur if denominateur else 0
        ordonnee_origine = moyenne_y - pente * moyenne_x

        y_predits = [pente * x + ordonnee_origine for x in xs]
        residus = sum(w * (y - yp) ** 2 for w, y, yp in zip(poids, ys, y_predits))
        totale = sum(w * (y - moyenne_y) ** 2 for w, y in zip(poids, ys))
        r_carre = 1 - (residus / totale) if totale else 0

        score_maximum = historique[0]["score_maximum"]
        jours_ecoules_aujourdhui = (maintenant - date_premiere).total_seconds() / 86400
        score_estime_aujourdhui = pente * jours_ecoules_aujourdhui + ordonnee_origine
        score_estime_aujourdhui = round(max(0, min(score_maximum, score_estime_aujourdhui)))

        pente_par_mois = pente * 30  # plus lisible qu'une pente "par jour"

        if pente_par_mois > 1:
            tendance_libelle = "En progression"
        elif pente_par_mois < -1:
            tendance_libelle = "En régression"
        else:
            tendance_libelle = "Stable"

        return {
            "disponible": True,
            "nb_evaluations": n,
            "pente_par_mois": round(pente_par_mois, 2),
            "tendance": tendance_libelle,
            "confiance_r2": round(r_carre, 2),
            "confiance_fiable": n >= 3,
            "score_estime_aujourdhui": score_estime_aujourdhui,
            "score_maximum": score_maximum,
            "methode": f"Régression pondérée (demi-vie {demi_vie_jours} jours), axe temporel réel",
        }

    # -------------------------------------------------------------
    @staticmethod
    def benchmark(secteur=None):
        """Moyenne des scores sur toutes les évaluations terminées, filtrée par secteur si précisé."""
        queryset = Evaluation.objects.filter(statut=Evaluation.STATUT_TERMINEE)
        if secteur:
            queryset = queryset.filter(pme__secteur=secteur)

        moyenne = queryset.aggregate(moyenne_score=Avg("score_total"))["moyenne_score"]
        nb_evaluations = queryset.count()

        return {
            "secteur": secteur or "Tous secteurs",
            "nb_evaluations_comparees": nb_evaluations,
            "score_moyen": round(moyenne, 1) if moyenne is not None else None,
        }

    # -------------------------------------------------------------
    @staticmethod
    def segmenter_pmes(n_clusters=3):
        """
        Segmentation des PME par profil de maturité (K-means) à partir des scores
        par thème (en %) de leur dernière évaluation terminée.

        RÉSERVÉ AUX CONSULTANTS/ADMIN : expose les noms d'autres PME, ne doit
        jamais être appelé pour un compte de rôle PME (risque de confidentialité).
        """
        try:
            from sklearn.cluster import KMeans
            import numpy as np
        except ImportError:
            return {"disponible": False, "raison": "scikit-learn n'est pas installé."}

        referentiel = Referentiel.objects.filter(actif=True).first()
        noms_themes = list(
            referentiel.themes.order_by("code").values_list("nom", flat=True)
        ) if referentiel else []

        vecteurs, pme_infos = [], []
        for pme in PME.objects.all():
            derniere = (
                Evaluation.objects.filter(pme=pme, statut=Evaluation.STATUT_TERMINEE)
                .order_by("-date_fin")
                .first()
            )
            if derniere is None:
                continue
            calc = ScoreCalculator(derniere)
            scores_theme = calc.calculer_scores_par_theme()
            vecteur = [t["pourcentage"] for t in scores_theme]
            if len(vecteur) != len(noms_themes):
                continue  # sécurité si un référentiel incomplet traîne
            vecteurs.append(vecteur)
            pme_infos.append({"pme_id": pme.id, "pme_nom": pme.nom_entreprise, "secteur": pme.secteur})

        if len(vecteurs) < n_clusters:
            return {
                "disponible": False,
                "raison": f"Au moins {n_clusters} PME avec une évaluation terminée sont nécessaires "
                          f"(actuellement {len(vecteurs)}).",
                "nb_pme_disponibles": len(vecteurs),
            }

        X = np.array(vecteurs)
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)

        assignations = []
        for info, label, vecteur in zip(pme_infos, labels, vecteurs):
            assignations.append({**info, "cluster": int(label), "profil_pourcentages_par_theme": vecteur})

        centres = kmeans.cluster_centers_.tolist()
        profils_clusters = []
        for i, centre in enumerate(centres):
            theme_le_plus_faible = noms_themes[centre.index(min(centre))]
            theme_le_plus_fort = noms_themes[centre.index(max(centre))]
            profils_clusters.append({
                "cluster": i,
                "centre_pourcentages_par_theme": [round(v, 1) for v in centre],
                "point_faible_dominant": theme_le_plus_faible,
                "point_fort_dominant": theme_le_plus_fort,
            })

        return {
            "disponible": True,
            "nb_pme": len(vecteurs),
            "n_clusters": n_clusters,
            "themes": noms_themes,
            "assignations": assignations,
            "profils_clusters": profils_clusters,
            "avertissement": "Segmentation indicative — fiabilité statistique limitée avec un faible nombre de PME.",
        }