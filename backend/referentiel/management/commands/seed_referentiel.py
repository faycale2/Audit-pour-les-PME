# referentiel/management/commands/seed_referentiel.py
from django.core.management.base import BaseCommand
from django.db import transaction
from referentiel.models import Referentiel, Theme, Question, ChoixReponse
from referentiel.data.seed_data import REFERENTIEL

class Command(BaseCommand):
    help = "Remplit la base de données avec le référentiel de questions."

    def handle(self, *args, **options):
        with transaction.atomic():
            # Supprimer l'ancien référentiel actif
            Referentiel.objects.filter(actif=True).update(actif=False)
            
            # Créer le nouveau référentiel
            ref_data = REFERENTIEL
            referentiel = Referentiel.objects.create(
                nom=ref_data["nom"],
                version=ref_data["version"],
                description=ref_data["description"],
                score_maximum=ref_data["score_maximum"],
                actif=True
            )
            self.stdout.write(f"✅ Référentiel créé : {referentiel}")

            for theme_data in ref_data["themes"]:
                theme = Theme.objects.create(
                    referentiel=referentiel,
                    code=theme_data["code"],
                    nom=theme_data["nom"],
                    description=theme_data["description"],
                    ordre=theme_data["ordre"]
                )
                self.stdout.write(f"  ✅ Thème créé : {theme}")

                for q_data in theme_data["questions"]:
                    question = Question.objects.create(
                        theme=theme,
                        numero=q_data["numero"],
                        texte=q_data["texte"],
                        ref_iso27001=q_data["ref_iso27001"],
                        ref_nist=q_data["ref_nist"],
                        ref_loi0908=q_data["ref_loi0908"],
                        recommandation=q_data["recommandation"],
                        ordre=q_data["ordre"]
                    )
                    
                    for choix_data in q_data["choix"]:
                        ChoixReponse.objects.create(
                            question=question,
                            valeur=choix_data["valeur"],
                            libelle_niveau=choix_data["libelle_niveau"],
                            texte=choix_data["texte"]
                        )
                
                self.stdout.write(f"    ✅ {len(theme_data['questions'])} questions importées")

        self.stdout.write(self.style.SUCCESS("🎉 Import terminé avec succès !"))