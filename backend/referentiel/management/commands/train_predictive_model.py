import os
import joblib
from django.conf import settings
from django.core.management.base import BaseCommand
from referentiel.ml_training import entrainer_modele


class Command(BaseCommand):
    help = "Entraîne le modèle prédictif (progression de maturité) sur un jeu de données synthétique."

    def add_arguments(self, parser):
        parser.add_argument("--n-pme", type=int, default=300)

    def handle(self, *args, **options):
        self.stdout.write("Génération des données synthétiques et entraînement en cours...")
        modele, metriques = entrainer_modele(n_pme=options["n_pme"])

        dossier = os.path.join(settings.BASE_DIR, "referentiel", "ml_models")
        os.makedirs(dossier, exist_ok=True)
        chemin = os.path.join(dossier, "progression_model.joblib")
        joblib.dump(modele, chemin)

        self.stdout.write(self.style.SUCCESS(f"Modèle entraîné et sauvegardé : {chemin}"))
        for cle, valeur in metriques.items():
            self.stdout.write(f"  {cle} : {valeur}")