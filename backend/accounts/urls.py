from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("inscription/", views.inscription),
    path("connexion/", views.connexion),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("profil/", views.profil),

    # Espace admin
    path("admin/seuils/", views.gerer_seuils),
    path("admin/statistiques/", views.statistiques_globales),
    path("admin/utilisateurs/", views.liste_utilisateurs),

	path("chatbot/question/", views.chatbot_question),
]