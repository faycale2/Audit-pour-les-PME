from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import ConsultantPME, PME, User
from referentiel.models import Evaluation, Question, Referentiel


class ReferentielApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.pme_user = User.objects.create_user(
            username="pme@test.ma", email="pme@test.ma", password="MotDePasse123!", role=User.ROLE_PME
        )
        self.pme = PME.objects.create(utilisateur=self.pme_user, nom_entreprise="Atlas Soft", secteur="IT")
        self.autre_user = User.objects.create_user(
            username="autre@test.ma", email="autre@test.ma", password="MotDePasse123!", role=User.ROLE_PME
        )
        self.autre_pme = PME.objects.create(utilisateur=self.autre_user, nom_entreprise="Autre SARL")
        self.consultant = User.objects.create_user(
            username="consultant@test.ma",
            email="consultant@test.ma",
            password="MotDePasse123!",
            role=User.ROLE_CONSULTANT,
        )
        self.admin = User.objects.create_user(
            username="admin@test.ma", email="admin@test.ma", password="MotDePasse123!", role=User.ROLE_ADMIN
        )
        self.referentiel = Referentiel.objects.get(actif=True)

    def _token(self, email):
        response = self.client.post("/api/connexion/", {"email": email, "password": "MotDePasse123!"}, format="json")
        self.assertEqual(response.status_code, 200)
        return response.data["access"]

    def test_soumettre_reponse_d_un_autre_referentiel_est_refuse(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('pme@test.ma')}")
        evaluation = Evaluation.objects.create(pme=self.pme, referentiel=self.referentiel)
        autre_ref = Referentiel.objects.create(nom="Autre", version="9", actif=False)
        from referentiel.models import Theme

        theme = Theme.objects.create(referentiel=autre_ref, code="X", nom="X", ordre=1)
        question = Question.objects.create(theme=theme, numero=99, texte="hors périmètre", ordre=1)
        response = self.client.post(
            f"/api/referentiel/evaluations/{evaluation.id}/reponses/",
            {"reponses": [{"question_id": question.id, "choix_id": 1}]},
            format="json",
        )
        self.assertEqual(response.status_code, 404)

    def test_resultats_consultant_non_lie_sont_refuses(self):
        evaluation = Evaluation.objects.create(pme=self.pme, referentiel=self.referentiel, statut=Evaluation.STATUT_TERMINEE, score_total=40)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('consultant@test.ma')}")
        response = self.client.get(f"/api/referentiel/evaluations/{evaluation.id}/resultats/")
        self.assertEqual(response.status_code, 403)

    def test_resultats_consultant_lie_sont_autorises(self):
        evaluation = Evaluation.objects.create(pme=self.pme, referentiel=self.referentiel, statut=Evaluation.STATUT_TERMINEE, score_total=40)
        ConsultantPME.objects.create(consultant=self.consultant, pme=self.pme)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('consultant@test.ma')}")
        response = self.client.get(f"/api/referentiel/evaluations/{evaluation.id}/resultats/")
        self.assertEqual(response.status_code, 200)

    def test_segmentation_n_clusters_invalide(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('admin@test.ma')}")
        response = self.client.get("/api/referentiel/segmentation-pme/?n_clusters=abc")
        self.assertEqual(response.status_code, 400)

    def test_reprise_evaluation_renvoie_les_reponses(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('pme@test.ma')}")
        premiere = self.client.post("/api/referentiel/evaluations/demarrer/")
        self.assertEqual(premiere.status_code, 201)
        evaluation_id = premiere.data["id"]
        question = Question.objects.filter(theme__referentiel=self.referentiel).first()
        choix = question.choix.first()
        self.client.post(
            f"/api/referentiel/evaluations/{evaluation_id}/reponses/",
            {"reponses": [{"question_id": question.id, "choix_id": choix.id}]},
            format="json",
        )
        reprise = self.client.post("/api/referentiel/evaluations/demarrer/")
        self.assertEqual(reprise.status_code, 200)
        self.assertEqual(reprise.data["id"], evaluation_id)
        self.assertEqual(len(reprise.data["reponses"]), 1)
