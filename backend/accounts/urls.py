from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from . import views


urlpatterns = [

    # ========================================================
    # AUTHENTIFICATION
    # ========================================================

    path(
        "inscription/",
        views.inscription,
    ),

    path(
        "connexion/",
        views.connexion,
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
    ),


    # ========================================================
    # PROFIL
    # ========================================================

    path(
        "profil/",
        views.profil,
    ),

    path(
        "profil/photo/",
        views.profil_photo,
    ),

    path(
        "profil/changer-mot-de-passe/",
        views.changer_mot_de_passe,
    ),


    # ========================================================
    # MOT DE PASSE
    # ========================================================

    path(
        "mot-de-passe-oublie/",
        views.mot_de_passe_oublie,
    ),

    path(
        "reinitialiser-mot-de-passe/",
        views.reinitialiser_mot_de_passe,
    ),


    # ========================================================
    # ADMIN
    # ========================================================

    path(
        "admin/seuils/",
        views.gerer_seuils,
    ),

    path(
        "admin/statistiques/",
        views.statistiques_globales,
    ),

    path(
        "admin/utilisateurs/",
        views.liste_utilisateurs,
    ),

    path(
        "admin/utilisateurs/<int:user_id>/",
        views.modifier_utilisateur,
    ),

    path(
        "admin/pmes/",
        views.liste_pmes,
    ),

    path(
        "admin/associations/",
        views.associations_consultant,
    ),

    path(
        "admin/associations/<int:association_id>/",
        views.supprimer_association,
    ),


    # ========================================================
    # CONSULTANT
    # ========================================================

    path(
        "consultant/pmes/",
        views.consultant_pmes,
    ),

    path(
        "consultant/pme/<int:pme_id>/historique/",
        views.historique_pme,
    ),


    # ========================================================
    # CONSULTANTS
    # ========================================================

    path(
        "consultants/disponibles/",
        views.consultants_disponibles,
    ),

    # Ancienne route conservée pour le moment
    path(
        "pme/choisir-consultant/",
        views.choisir_consultant,
    ),


    # ========================================================
    # CHATBOT
    # ========================================================

    path(
        "chatbot/question/",
        views.chatbot_question,
    ),


    # ========================================================
    # QUESTIONS
    # ========================================================
    #
    # Cette partie reste indépendante.
    #
    # PME → pose une question
    #      ↓
    # un consultant peut répondre
    #
    # Pas de demande officielle de suivi ici.
    #

    path(
        "accompagnement/",
        views.demandes_accompagnement,
    ),

    path(
        "accompagnement/<int:demande_id>/",
        views.modifier_demande_accompagnement,
    ),


    # ========================================================
    # DEMANDES DE SUIVI
    # ========================================================
    #
    # PME → choisit un consultant
    #      ↓
    # DemandeSuivi EN_ATTENTE
    #      ↓
    # Consultant accepte/refuse
    #      ↓
    # si accepté → ConsultantPME
    #

    path(
        "demandes-suivi/",
        views.demandes_suivi,
        name="demandes-suivi",
    ),

    path(
        "demandes-suivi/<int:demande_id>/",
        views.traiter_demande_suivi,
        name="traiter-demande-suivi",
    ),


    # ========================================================
    # MESSAGERIE
    # ========================================================

    path(
        "messages/non-lus/",
        views.messages_non_lus,
    ),

    path(
        "messages/<int:pme_id>/",
        views.messages_conversation,
    ),

    path(
        "messages/<int:pme_id>/envoyer/",
        views.envoyer_message,
    ),

    path(
        "messages/<int:pme_id>/marquer-lu/",
        views.marquer_messages_lus,
    ),
	path(
    "accompagnement/terminer/<int:pme_id>/",
    views.terminer_accompagnement,
    name="terminer-accompagnement",
),
]