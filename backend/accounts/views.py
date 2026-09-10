from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Avg, Count
from django.db import transaction

from .models import User, PME, ConfigurationSeuils
from .serializers import InscriptionSerializer, ConnexionSerializer, UserSerializer, PMESerializer
from .permissions import IsAdmin


def generer_tokens(user):
    """Génère la paire access/refresh token pour un utilisateur donné."""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def inscription(request):
    """Crée un compte PME + profil, retourne les tokens JWT."""
    serializer = InscriptionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    with transaction.atomic():
        user = User.objects.create_user(
            username=data["email"],
            email=data["email"],
            password=data["password"],
            role=User.ROLE_PME,
        )
        PME.objects.create(
            utilisateur=user,
            nom_entreprise=data["nom_entreprise"],
            secteur=data.get("secteur", ""),
        )

    tokens = generer_tokens(user)
    return Response(
        {**tokens, "role": user.role},
        status=status.HTTP_201_CREATED,
    )


# accounts/views.py - Version corrigée de la fonction connexion

@api_view(["POST"])
@permission_classes([AllowAny])
def connexion(request):
    """Authentifie un utilisateur (PME, Consultant ou Admin) par email, retourne les tokens JWT."""
    serializer = ConnexionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    # Utiliser filter().first() au lieu de get() pour éviter MultipleObjectsReturned
    user_obj = User.objects.filter(email=data["email"]).first()
    if not user_obj:
        return Response({"detail": "Identifiants invalides."}, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(username=user_obj.username, password=data["password"])
    if not user:
        return Response({"detail": "Identifiants invalides."}, status=status.HTTP_401_UNAUTHORIZED)

    tokens = generer_tokens(user)
    return Response({**tokens, "role": user.role})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profil(request):
    """Retourne les infos de l'utilisateur connecté (utile pour la Sidebar React)."""
    data = UserSerializer(request.user).data
    if hasattr(request.user, "pme"):
        data["pme"] = PMESerializer(request.user.pme).data
    return Response(data)


# ─────────────────────────────────────────────
# ESPACE ADMIN
# ─────────────────────────────────────────────

@api_view(["GET", "PUT"])
@permission_classes([IsAdmin])
def gerer_seuils(request):
    """Lit ou modifie les seuils de maturité (Critique / Intermédiaire / Satisfaisant)."""
    config, _ = ConfigurationSeuils.objects.get_or_create(id=1)

    if request.method == "GET":
        return Response({
            "seuil_critique": config.seuil_critique,
            "seuil_intermediaire": config.seuil_intermediaire,
        })

    # PUT : mise à jour
    config.seuil_critique = request.data.get("seuil_critique", config.seuil_critique)
    config.seuil_intermediaire = request.data.get("seuil_intermediaire", config.seuil_intermediaire)
    config.save()
    return Response({
        "seuil_critique": config.seuil_critique,
        "seuil_intermediaire": config.seuil_intermediaire,
    })


@api_view(["GET"])
@permission_classes([IsAdmin])
def statistiques_globales(request):
    """Statistiques pour le tableau de bord admin."""
    nb_pme = PME.objects.count()
    nb_utilisateurs = User.objects.count()
    repartition_secteur = list(
        PME.objects.values("secteur").annotate(total=Count("id")).order_by("-total")
    )

    return Response({
        "nombre_pme": nb_pme,
        "nombre_utilisateurs": nb_utilisateurs,
        "repartition_par_secteur": repartition_secteur,
    })


@api_view(["GET"])
@permission_classes([IsAdmin])
def liste_utilisateurs(request):
    """Liste tous les comptes, pour la gestion des rôles côté admin."""
    users = User.objects.all()
    return Response(UserSerializer(users, many=True).data)