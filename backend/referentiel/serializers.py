from rest_framework import serializers
from referentiel.models import Referentiel, Theme, Question, ChoixReponse, Evaluation, Reponse


class ChoixReponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoixReponse
        fields = ["id", "valeur", "libelle_niveau", "texte"]


class QuestionSerializer(serializers.ModelSerializer):
    choix = ChoixReponseSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "numero", "texte", "ref_iso27001", "ref_nist", "ref_loi0908", "ordre", "choix"]


class ThemeSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Theme
        fields = ["id", "code", "nom", "description", "ordre", "questions"]


class ReferentielSerializer(serializers.ModelSerializer):
    """Référentiel complet avec thèmes, questions et choix imbriqués -- utilisé pour afficher le questionnaire."""
    themes = ThemeSerializer(many=True, read_only=True)

    class Meta:
        model = Referentiel
        fields = ["id", "nom", "version", "description", "score_maximum", "themes"]


class ReponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reponse
        fields = ["id", "question", "choix", "date_reponse"]
        read_only_fields = ["id", "date_reponse"]


class ReponseSoumissionSerializer(serializers.Serializer):
    """Une réponse envoyée par le front lors de la soumission du questionnaire."""
    question_id = serializers.IntegerField()
    choix_id = serializers.IntegerField()


class SoumissionReponsesSerializer(serializers.Serializer):
    """Corps de la requête POST pour soumettre plusieurs réponses d'un coup."""
    reponses = ReponseSoumissionSerializer(many=True)


class EvaluationSerializer(serializers.ModelSerializer):
    pme_nom = serializers.CharField(source="pme.nom_entreprise", read_only=True)
    referentiel_nom = serializers.CharField(source="referentiel.nom", read_only=True)
    reponses = ReponseSerializer(many=True, read_only=True)

    class Meta:
        model = Evaluation
        fields = [
            "id", "pme", "pme_nom", "referentiel", "referentiel_nom",
            "date_debut", "date_fin", "statut", "score_total", "reponses",
        ]
        read_only_fields = ["id", "pme_nom", "referentiel_nom", "date_debut", "date_fin", "score_total", "reponses"]

class PointHistoriqueSerializer(serializers.Serializer):
    index = serializers.IntegerField()
    evaluation_id = serializers.IntegerField()
    date = serializers.DateTimeField()
    score_total = serializers.IntegerField()
    score_maximum = serializers.IntegerField()
    niveau = serializers.DictField()