# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Utilisateur étendu avec un rôle, pour gérer les permissions (RBAC)."""

    ROLE_PME = "PME"
    ROLE_CONSULTANT = "CONSULTANT"
    ROLE_ADMIN = "ADMIN"

    ROLE_CHOICES = [
        (ROLE_PME, "PME"),
        (ROLE_CONSULTANT, "Consultant / Expert"),
        (ROLE_ADMIN, "Administrateur"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_PME)

    def __str__(self):
        return f"{self.username} ({self.role})"


class PME(models.Model):
    """Profil d'une entreprise, lié à un compte utilisateur de rôle PME."""

    utilisateur = models.OneToOneField(User, on_delete=models.CASCADE, related_name="pme")
    nom_entreprise = models.CharField(max_length=200)
    secteur = models.CharField(max_length=150, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom_entreprise


class ConfigurationSeuils(models.Model):
    """
    Seuils de maturité configurables par l'administrateur
    (au lieu d'être codés en dur dans scoring.py).
    Une seule ligne active à la fois.
    """

    seuil_critique = models.PositiveIntegerField(default=40)
    seuil_intermediaire = models.PositiveIntegerField(default=70)
    date_modification = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Critique ≤ {self.seuil_critique} | Intermédiaire ≤ {self.seuil_intermediaire}"


class ConsultantPME(models.Model):
    """Table d'association : quelles PME sont suivies par quel consultant."""

    consultant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pme_suivies")
    pme = models.ForeignKey(PME, on_delete=models.CASCADE, related_name="consultants")
    date_assignation = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("consultant", "pme")