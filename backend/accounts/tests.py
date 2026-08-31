from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import ConsultantPME, DemandeAccompagnement, FAQEntry, PME, User


class AccountsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.pme_user = User.objects.create_user(
            username="pme@test.ma", email="pme@test.ma", password="MotDePasse123!", role=User.ROLE_PME
        )
        self.pme = PME.objects.create(utilisateur=self.pme_user, nom_entreprise="Atlas Soft")
        self.consultant = User.objects.create_user(
            username="consultant@test.ma",
            email="consultant@test.ma",
            password="MotDePasse123!",
            role=User.ROLE_CONSULTANT,
        )
        self.autre_consultant = User.objects.create_user(
            username="autrecons@test.ma",
            email="autrecons@test.ma",
            password="MotDePasse123!",
            role=User.ROLE_CONSULTANT,
        )
        ConsultantPME.objects.create(consultant=self.consultant, pme=self.pme)
        DemandeAccompagnement.objects.create(pme=self.pme, commentaire="Besoin d'aide sauvegarde")
        FAQEntry.objects.create(titre="Pare-feu", mots_cles="pare-feu, firewall", reponse="Installez un pare-feu.")

    def _token(self, email):
        response = self.client.post("/api/connexion/", {"email": email, "password": "MotDePasse123!"}, format="json")
        return response.data["access"]

    def test_consultant_ne_voit_que_ses_demandes(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('autrecons@test.ma')}")
        response = self.client.get("/api/accompagnement/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('consultant@test.ma')}")
        response = self.client.get("/api/accompagnement/")
        self.assertEqual(len(response.data), 1)

    def test_chatbot_ignore_mots_cles_trop_courts(self):
        FAQEntry.objects.create(titre="Piège", mots_cles="a, de", reponse="ne doit pas matcher")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token('pme@test.ma')}")
        response = self.client.post("/api/chatbot/question/", {"message": "aide de sauvegarde"}, format="json")
        self.assertTrue(response.data["trouve"] is False or "pare-feu" not in response.data.get("reponse", "").lower())
        response = self.client.post("/api/chatbot/question/", {"message": "comment configurer un firewall"}, format="json")
        self.assertTrue(response.data["trouve"])
        self.assertIn("pare-feu", response.data["reponse"].lower())
