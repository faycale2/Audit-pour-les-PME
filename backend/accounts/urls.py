from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("inscription/", views.inscription),
    path("connexion/", views.connexion),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("profil/", views.profil),
    path("profil/photo/", views.profil_photo),
    path("profil/changer-mot-de-passe/", views.changer_mot_de_passe),
    path("mot-de-passe-oublie/", views.mot_de_passe_oublie),
    path("reinitialiser-mot-de-passe/", views.reinitialiser_mot_de_passe),

    # Espace admin
    path("admin/seuils/", views.gerer_seuils),
    path("admin/statistiques/", views.statistiques_globales),
    path("admin/utilisateurs/", views.liste_utilisateurs),
    path("admin/utilisateurs/<int:user_id>/", views.modifier_utilisateur),
    path("admin/pmes/", views.liste_pmes),
    path("admin/associations/", views.associations_consultant),
    path("admin/associations/<int:association_id>/", views.supprimer_association),

    path("consultant/pmes/", views.consultant_pmes),
    path("consultants/disponibles/", views.consultants_disponibles),
    path("pme/choisir-consultant/", views.choisir_consultant),
    path("chatbot/question/", views.chatbot_question),
    path("accompagnement/", views.demandes_accompagnement),
    path("accompagnement/<int:demande_id>/", views.modifier_demande_accompagnement),
    path("messages/non-lus/", views.messages_non_lus),
    path("messages/<int:pme_id>/", views.messages_conversation),
    path("messages/<int:pme_id>/envoyer/", views.envoyer_message),
    path("messages/<int:pme_id>/marquer-lu/", views.marquer_messages_lus),
]