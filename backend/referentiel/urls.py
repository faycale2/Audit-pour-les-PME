from django.urls import path
from . import views

urlpatterns = [
    path("questionnaire/", views.questionnaire_actif),
    path("evaluations/demarrer/", views.demarrer_evaluation),
    path("evaluations/<int:evaluation_id>/reponses/", views.soumettre_reponses),
    path("evaluations/<int:evaluation_id>/resultats/", views.resultats_evaluation),
    path("evaluations/<int:evaluation_id>/rapport-pdf/", views.telecharger_rapport_pdf),
    path("pme/evolution/", views.evolution_et_tendance),
    path("pme/comparatif/", views.comparatif_benchmark),
    path("segmentation-pme/", views.segmentation_pme),
    path("pme/tendance-par-theme/", views.tendance_par_theme),
    path("pme/prediction/", views.prediction_progression),
]