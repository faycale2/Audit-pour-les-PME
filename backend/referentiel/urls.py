from django.urls import path
from . import views

urlpatterns = [
    path("questionnaire/", views.questionnaire_actif),
    path("evaluations/demarrer/", views.demarrer_evaluation),
    path("evaluations/<int:evaluation_id>/reponses/", views.soumettre_reponses),
    path("evaluations/<int:evaluation_id>/resultats/", views.resultats_evaluation),
    path("evaluations/<int:evaluation_id>/rapport-pdf/", views.telecharger_rapport_pdf),
]