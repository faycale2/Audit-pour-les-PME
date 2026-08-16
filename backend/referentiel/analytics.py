from django.db.models import Avg
from referentiel.models import Evaluation
from referentiel.services import NIVEAUX_MATURITE, ScoreCalculator


class AnalysePredictiveComparative:
    """
    Service d'analyse comparative et prédictive :
    - évolution des scores d'une PME dans le temps
    - tendance (régression linéaire simple) et projection du prochain score
    - comparaison au benchmark (moyenne globale ou sectorielle)
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
    def tendance_pme(pme):
        """
        Régression linéaire simple (méthode des moindres carrés) sur les scores
        successifs d'une PME. Retourne la pente, la projection du prochain score,
        et un indice de confiance (R²) + un avertissement si peu de données.
        """
        historique = AnalysePredictiveComparative.historique_pme(pme)
        n = len(historique)

        if n < 2:
            return {
                "disponible": False,
                "raison": "Au moins 2 évaluations terminées sont nécessaires pour calculer une tendance.",
                "nb_evaluations": n,
            }

        xs = [point["index"] for point in historique]
        ys = [point["score_total"] for point in historique]

        moyenne_x = sum(xs) / n
        moyenne_y = sum(ys) / n

        numerateur = sum((x - moyenne_x) * (y - moyenne_y) for x, y in zip(xs, ys))
        denominateur = sum((x - moyenne_x) ** 2 for x in xs)

        pente = numerateur / denominateur if denominateur else 0
        ordonnee_origine = moyenne_y - pente * moyenne_x

        # R² : qualité de l'ajustement (0 = mauvais, 1 = parfait)
        y_predits = [pente * x + ordonnee_origine for x in xs]
        somme_carres_residus = sum((y - yp) ** 2 for y, yp in zip(ys, y_predits))
        somme_carres_totale = sum((y - moyenne_y) ** 2 for y in ys)
        r_carre = 1 - (somme_carres_residus / somme_carres_totale) if somme_carres_totale else 0

        score_maximum = historique[0]["score_maximum"]
        prochain_index = n
        projection = pente * prochain_index + ordonnee_origine
        projection = max(0, min(score_maximum, round(projection)))  # borné entre 0 et le score max

        if pente > 0.5:
            tendance_libelle = "En progression"
        elif pente < -0.5:
            tendance_libelle = "En régression"
        else:
            tendance_libelle = "Stable"

        return {
            "disponible": True,
            "nb_evaluations": n,
            "pente": round(pente, 2),
            "tendance": tendance_libelle,
            "confiance_r2": round(r_carre, 2),
            "confiance_fiable": n >= 3,  # avertissement si peu de points
            "score_projete_prochaine_evaluation": projection,
            "score_maximum": score_maximum,
        }

    # -------------------------------------------------------------
    @staticmethod
    def benchmark(secteur=None):
        """
        Moyenne des scores sur toutes les évaluations terminées,
        filtrée par secteur si précisé (comparaison PME vs marché).
        """
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