from django.db import models
from accounts.models import PME


class Referentiel(models.Model):
    """Un référentiel d'évaluation (ex: version enrichie ISO+NIST+Loi 09-08)."""

    nom = models.CharField(max_length=200)
    version = models.CharField(max_length=50, default="1.0")
    description = models.TextField(blank=True)
    score_maximum = models.PositiveIntegerField(default=116)
    date_creation = models.DateTimeField(auto_now_add=True)
    actif = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nom} (v{self.version})"


class Theme(models.Model):
    """Un des 4 thèmes stratégiques du référentiel."""

    referentiel = models.ForeignKey(Referentiel, on_delete=models.CASCADE, related_name="themes")
    code = models.CharField(max_length=20)  # ex: "THEME_1"
    nom = models.CharField(max_length=200)  # ex: "Gouvernance, Politique et RH"
    description = models.TextField(blank=True)
    ordre = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["ordre"]

    def __str__(self):
        return self.nom


class Question(models.Model):
    """Une question du questionnaire, rattachée à un thème."""

    theme = models.ForeignKey(Theme, on_delete=models.CASCADE, related_name="questions")
    numero = models.PositiveIntegerField()  # ex: 1 à 29
    texte = models.TextField()  # l'intitulé de la question
    ref_iso27001 = models.CharField(max_length=50, blank=True)
    ref_nist = models.CharField(max_length=50, blank=True)
    ref_loi0908 = models.CharField(max_length=50, blank=True)
    recommandation = models.TextField(blank=True)
    ordre = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["ordre"]

    def __str__(self):
        return f"Q{self.numero} - {self.texte[:50]}"


class ChoixReponse(models.Model):
    """Un des 5 niveaux de réponse possibles pour une question donnée (0 à 4)."""

    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choix")
    valeur = models.PositiveSmallIntegerField()  # 0, 1, 2, 3 ou 4
    libelle_niveau = models.CharField(max_length=50)  # ex: "Niveau 3 — Défini"
    texte = models.TextField()  # description complète du choix

    class Meta:
        ordering = ["valeur"]
        unique_together = ("question", "valeur")

    def __str__(self):
        return f"{self.question.numero} → {self.valeur} ({self.libelle_niveau})"


class Evaluation(models.Model):
    """Une session de passation du questionnaire par une PME."""

    STATUT_EN_COURS = "EN_COURS"
    STATUT_TERMINEE = "TERMINEE"

    STATUT_CHOICES = [
        (STATUT_EN_COURS, "En cours"),
        (STATUT_TERMINEE, "Terminée"),
    ]

    pme = models.ForeignKey(PME, on_delete=models.CASCADE, related_name="evaluations")
    referentiel = models.ForeignKey(Referentiel, on_delete=models.PROTECT, related_name="evaluations")
    date_debut = models.DateTimeField(auto_now_add=True)
    date_fin = models.DateTimeField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default=STATUT_EN_COURS)
    score_total = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f"Évaluation {self.pme.nom_entreprise} - {self.date_debut.strftime('%d/%m/%Y')}"


class Reponse(models.Model):
    """Une réponse donnée par la PME à une question, dans le cadre d'une évaluation."""

    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE, related_name="reponses")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="reponses")
    choix = models.ForeignKey(ChoixReponse, on_delete=models.PROTECT, related_name="reponses")
    date_reponse = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("evaluation", "question")  # une seule réponse par question par évaluation

    def __str__(self):
        return f"{self.evaluation} - Q{self.question.numero} = {self.choix.valeur}"
