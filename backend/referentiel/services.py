from django.db.models import Sum
from accounts.models import ConfigurationSeuils
from referentiel.models import Evaluation


# Description des 5 niveaux de maturité (issue de ton document, section 6)
NIVEAUX_MATURITE = {
    1: "Pratique informelle",
    2: "Pratique répétable",
    3: "Processus défini",
    4: "Processus contrôlé",
    5: "Processus optimisé",
}


class ScoreCalculator:
    """
    Calcule le score total, les scores par thème, les scores par domaine
    normatif (ISO 27001 / NIST / Loi 09-08), et le niveau de maturité
    d'une évaluation, à partir des réponses déjà enregistrées.
    """

    def __init__(self, evaluation: Evaluation):
        self.evaluation = evaluation
        # toutes les réponses de cette évaluation, avec question/choix préchargés
        self.reponses = (
            evaluation.reponses
            .select_related("question", "question__theme", "choix")
            .all()
        )

    # -----------------------------------------------------------------
    def calculer_score_total(self) -> int:
        """Somme des valeurs (0-4) de toutes les réponses de l'évaluation."""
        total = self.reponses.aggregate(total=Sum("choix__valeur"))["total"]
        return total or 0

    # -----------------------------------------------------------------
    def calculer_scores_par_theme(self) -> list[dict]:
        """
        Retourne, pour chaque thème répondu :
        code, nom, score obtenu, score max possible, pourcentage.
        """
        scores_par_theme = {}

        for reponse in self.reponses:
            theme = reponse.question.theme
            if theme.id not in scores_par_theme:
                scores_par_theme[theme.id] = {
                    "theme_code": theme.code,
                    "theme_nom": theme.nom,
                    "score": 0,
                    "score_max": theme.questions.count() * 4,
                }
            scores_par_theme[theme.id]["score"] += reponse.choix.valeur

        resultats = list(scores_par_theme.values())
        for r in resultats:
            r["pourcentage"] = round((r["score"] / r["score_max"]) * 100, 1) if r["score_max"] else 0

        # tri selon l'ordre des thèmes défini dans le référentiel
        resultats.sort(key=lambda r: r["theme_code"])
        return resultats

    # -----------------------------------------------------------------
    def calculer_scores_par_domaine(self) -> dict:
        """
        Retourne le score obtenu pour chaque référentiel normatif
        (une question compte pour un domaine si elle a une référence
        non vide pour ce domaine).
        """
        domaines = {
            "ISO_27001": {"score": 0, "nb_questions": 0},
            "NIST_CSF": {"score": 0, "nb_questions": 0},
            "LOI_09_08": {"score": 0, "nb_questions": 0},
        }

        for reponse in self.reponses:
            q = reponse.question
            valeur = reponse.choix.valeur

            if q.ref_iso27001:
                domaines["ISO_27001"]["score"] += valeur
                domaines["ISO_27001"]["nb_questions"] += 1
            if q.ref_nist:
                domaines["NIST_CSF"]["score"] += valeur
                domaines["NIST_CSF"]["nb_questions"] += 1
            if q.ref_loi0908:
                domaines["LOI_09_08"]["score"] += valeur
                domaines["LOI_09_08"]["nb_questions"] += 1

        for d in domaines.values():
            d["score_max"] = d["nb_questions"] * 4
            d["pourcentage"] = round((d["score"] / d["score_max"]) * 100, 1) if d["score_max"] else 0

        return domaines

    # -----------------------------------------------------------------
    def determiner_niveau_maturite(self, score_total: int) -> dict:
        """
        Détermine le niveau de maturité (1 à 5) à partir du score total,
        en utilisant les seuils configurables (ConfigurationSeuils).
        """
        config = ConfigurationSeuils.objects.first()
        if config is None:
            # sécurité : si aucune config n'existe encore en base, on prend les valeurs par défaut
            seuil2, seuil3, seuil4, seuil5 = 24, 47, 70, 93
        else:
            seuil2 = config.seuil_niveau2
            seuil3 = config.seuil_niveau3
            seuil4 = config.seuil_niveau4
            seuil5 = config.seuil_niveau5

        if score_total < seuil2:
            niveau = 1
        elif score_total < seuil3:
            niveau = 2
        elif score_total < seuil4:
            niveau = 3
        elif score_total < seuil5:
            niveau = 4
        else:
            niveau = 5

        return {
            "niveau": niveau,
            "libelle": NIVEAUX_MATURITE[niveau],
        }

    # -----------------------------------------------------------------
    def calculer_tout(self) -> dict:
        """Calcule l'ensemble des résultats sans rien enregistrer en base."""
        score_total = self.calculer_score_total()
        return {
            "score_total": score_total,
            "score_maximum": self.evaluation.referentiel.score_maximum,
            "scores_par_theme": self.calculer_scores_par_theme(),
            "scores_par_domaine": self.calculer_scores_par_domaine(),
            "maturite": self.determiner_niveau_maturite(score_total),
        }

    # -----------------------------------------------------------------
    def finaliser_evaluation(self) -> dict:
        """
        Calcule le score total, l'enregistre sur l'évaluation, passe son
        statut à TERMINEE, et retourne l'ensemble des résultats.
        À appeler une fois que la PME a répondu aux 29 questions.
        """
        resultats = self.calculer_tout()

        self.evaluation.score_total = resultats["score_total"]
        self.evaluation.statut = Evaluation.STATUT_TERMINEE
        from django.utils import timezone
        self.evaluation.date_fin = timezone.now()
        self.evaluation.save()

        return resultats