import secrets

from datetime import timedelta

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import (
    api_view,
    parser_classes,
    permission_classes,
)
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    ConsultantPME,
    ConfigurationSeuils,
    DemandeAccompagnement,
    FAQEntry,
    JetonReinitialisation,
    Message,
    PME,
    User,
    DemandeAccompagnement,
    DemandeSuivi,
    ConsultantPME,
)

from .permissions import IsAdmin, IsPME

from .serializers import (
    ConsultantSerializer,
    ConnexionSerializer,
    DemandeAccompagnementSerializer,
    DemandeSuiviSerializer,
    InscriptionSerializer,
    MessageSerializer,
    PMESerializer,
    UserSerializer,
)


def generer_tokens(user):
    refresh = RefreshToken.for_user(user)

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


# ============================================================
# AUTHENTIFICATION
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def inscription(request):
    serializer = InscriptionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    role = data.get("role", User.ROLE_PME)

    with transaction.atomic():

        user = User.objects.create_user(
            username=data["email"],
            email=data["email"],
            password=data["password"],
            role=role,
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
        )

        if role == User.ROLE_PME:
            PME.objects.create(
                utilisateur=user,
                nom_entreprise=data["nom_entreprise"],
                secteur=data.get("secteur", ""),
            )

    return Response(
        {
            **generer_tokens(user),
            "role": user.role,
            "user_id": user.id,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def connexion(request):
    serializer = ConnexionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    user_obj = User.objects.filter(
        email__iexact=data["email"]
    ).first()

    user = (
        authenticate(
            username=user_obj.username,
            password=data["password"],
        )
        if user_obj
        else None
    )

    if not user:
        return Response(
            {"detail": "Identifiants invalides."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return Response(
        {
            **generer_tokens(user),
            "role": user.role,
            "user_id": user.id,
        }
    )


# ============================================================
# PROFIL
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profil(request):
    data = UserSerializer(request.user).data

    if hasattr(request.user, "pme"):
        pme = request.user.pme

        data["pme"] = PMESerializer(pme).data

        relations = (
            ConsultantPME.objects
            .filter(pme=pme)
            .select_related("consultant")
        )

        consultants = []

        for relation in relations:
            consultant = relation.consultant

            nom = (
                f"{consultant.first_name} "
                f"{consultant.last_name}"
            ).strip()

            if not nom:
                nom = consultant.username

            consultants.append(
                {
                    "consultant_id": consultant.id,
                    "consultant_nom": nom,
                    "first_name": consultant.first_name,
                    "last_name": consultant.last_name,
                }
            )

        data["consultants"] = consultants

    return Response(data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def profil_photo(request):
    photo = request.FILES.get("photo_profil")

    if photo is None:
        return Response(
            {
                "photo_profil": [
                    "Sélectionnez une image."
                ]
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not photo.content_type.startswith("image/"):
        return Response(
            {
                "photo_profil": [
                    "Sélectionnez une image valide."
                ]
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if photo.size > 5 * 1024 * 1024:
        return Response(
            {
                "photo_profil": [
                    "L'image doit faire moins de 5 Mo."
                ]
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = request.user

    user.photo_profil = photo
    user.save(update_fields=["photo_profil"])

    return Response(
        {
            "photo_url": user.photo_profil.url,
        },
        status=status.HTTP_200_OK,
    )


# ============================================================
# MOT DE PASSE
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def changer_mot_de_passe(request):
    ancien = request.data.get(
        "ancien_mot_de_passe",
        "",
    )

    nouveau = request.data.get(
        "nouveau_mot_de_passe",
        "",
    )

    if not request.user.check_password(ancien):
        return Response(
            {
                "detail":
                "L'ancien mot de passe est incorrect."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        validate_password(
            nouveau,
            request.user,
        )
    except Exception as error:
        return Response(
            {
                "nouveau_mot_de_passe":
                error.messages
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    request.user.set_password(nouveau)

    request.user.save(
        update_fields=["password"]
    )

    return Response(
        {
            "detail":
            "Mot de passe modifié avec succès."
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def mot_de_passe_oublie(request):
    user = User.objects.filter(
        email__iexact=str(
            request.data.get("email", "")
        ).strip()
    ).first()

    if user:
        token = secrets.token_urlsafe(48)

        JetonReinitialisation.objects.filter(
            user=user
        ).delete()

        JetonReinitialisation.objects.create(
            user=user,
            token=token,
        )

        send_mail(
            "Réinitialisation de votre mot de passe",
            f"Votre token de réinitialisation est : {token}",
            None,
            [user.email],
        )

    return Response(
        {
            "detail":
            "Si un compte correspond à cet email, "
            "un token a été envoyé."
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def reinitialiser_mot_de_passe(request):
    jeton = (
        JetonReinitialisation.objects
        .select_related("user")
        .filter(
            token=request.data.get(
                "token",
                "",
            )
        )
        .first()
    )

    if (
        not jeton
        or timezone.now() - jeton.date_creation
        > timedelta(hours=1)
    ):
        return Response(
            {
                "detail":
                "Token invalide ou expiré."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        validate_password(
            request.data.get(
                "nouveau_mot_de_passe",
                "",
            ),
            jeton.user,
        )
    except Exception as error:
        return Response(
            {
                "nouveau_mot_de_passe":
                error.messages
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    jeton.user.set_password(
        request.data["nouveau_mot_de_passe"]
    )

    jeton.user.save(
        update_fields=["password"]
    )

    jeton.delete()

    return Response(
        {
            "detail":
            "Mot de passe réinitialisé avec succès."
        }
    )


# ============================================================
# ADMIN
# ============================================================

@api_view(["GET", "PUT"])
@permission_classes([IsAdmin])
def gerer_seuils(request):
    config, _ = ConfigurationSeuils.objects.get_or_create(id=1)

    champs = (
        "seuil_niveau2",
        "seuil_niveau3",
        "seuil_niveau4",
        "seuil_niveau5",
    )

    if request.method == "PUT":
        valeurs = []

        for champ in champs:
            try:
                valeur = int(
                    request.data.get(
                        champ,
                        getattr(config, champ),
                    )
                )
            except (TypeError, ValueError):
                return Response(
                    {
                        "detail":
                        f"{champ} doit être un entier."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not 0 <= valeur <= 116:
                return Response(
                    {
                        "detail":
                        f"{champ} doit être compris entre 0 et 116."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            valeurs.append(valeur)

        if (
            valeurs != sorted(valeurs)
            or len(set(valeurs)) != len(valeurs)
        ):
            return Response(
                {
                    "detail":
                    "Les seuils doivent être strictement croissants."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        for champ, valeur in zip(champs, valeurs):
            setattr(config, champ, valeur)

        config.save()

    return Response(
        {
            champ: getattr(config, champ)
            for champ in champs
        }
    )


@api_view(["GET"])
@permission_classes([IsAdmin])
def statistiques_globales(request):
    from django.db.models import Count

    return Response(
        {
            "nombre_pme": PME.objects.count(),
            "nombre_utilisateurs": User.objects.count(),
            "repartition_par_secteur": list(
                PME.objects
                .values("secteur")
                .annotate(total=Count("id"))
                .order_by("-total")
            ),
        }
    )


@api_view(["GET"])
@permission_classes([IsAdmin])
def liste_utilisateurs(request):
    return Response(
        UserSerializer(
            User.objects.all(),
            many=True,
        ).data
    )


@api_view(["PATCH"])
@permission_classes([IsAdmin])
def modifier_utilisateur(request, user_id):
    user = get_object_or_404(
        User,
        id=user_id,
    )

    role = request.data.get("role")

    if role not in {
        User.ROLE_PME,
        User.ROLE_CONSULTANT,
        User.ROLE_ADMIN,
    }:
        return Response(
            {"detail": "Rôle invalide."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.role = role

    user.save(
        update_fields=["role"]
    )

    return Response(
        UserSerializer(user).data
    )


@api_view(["GET"])
@permission_classes([IsAdmin])
def liste_pmes(request):
    return Response(
        [
            {
                "id": p.id,
                "nom_entreprise": p.nom_entreprise,
                "email": p.utilisateur.email,
            }
            for p in PME.objects.select_related("utilisateur")
        ]
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def consultants_disponibles(request):
    if request.user.role not in (
        User.ROLE_PME,
        User.ROLE_ADMIN,
    ):
        return Response(
            {
                "detail":
                "Accès réservé aux PME et administrateurs."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    consultants = User.objects.filter(
        role=User.ROLE_CONSULTANT,
        is_active=True,
    )

    return Response(
        ConsultantSerializer(
            consultants,
            many=True,
        ).data
    )


@api_view(["POST"])
@permission_classes([IsPME])
def choisir_consultant(request):
    pme = getattr(
        request.user,
        "pme",
        None,
    )

    consultant = get_object_or_404(
        User,
        id=request.data.get("consultant_id"),
        role=User.ROLE_CONSULTANT,
        is_active=True,
    )

    if pme is None:
        return Response(
            {
                "detail":
                "Aucun profil PME associé à ce compte."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    association, created = (
        ConsultantPME.objects.get_or_create(
            pme=pme,
            consultant=consultant,
        )
    )

    return Response(
        {
            "id": association.id,
            "consultant":
                ConsultantSerializer(consultant).data,
            "deja_associe": not created,
        },
        status=(
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        ),
    )


@api_view(["GET", "POST"])
@permission_classes([IsAdmin])
def associations_consultant(request):
    if request.method == "GET":
        return Response(
            [
                {
                    "id": a.id,
                    "consultant":
                        ConsultantSerializer(
                            a.consultant
                        ).data,
                    "pme_id": a.pme_id,
                    "pme_nom": a.pme.nom_entreprise,
                    "pme_email": a.pme.utilisateur.email,
                }
                for a in ConsultantPME.objects.select_related(
                    "consultant",
                    "pme",
                    "pme__utilisateur",
                )
            ]
        )

    consultant = get_object_or_404(
        User,
        id=request.data.get("consultant_id"),
        role=User.ROLE_CONSULTANT,
    )

    pme = get_object_or_404(
        PME,
        id=request.data.get("pme_id"),
    )

    association, created = (
        ConsultantPME.objects.get_or_create(
            pme=pme,
            consultant=consultant,
        )
    )

    return Response(
        {
            "id": association.id,
            "consultant":
                ConsultantSerializer(
                    consultant
                ).data,
            "pme_id": pme.id,
            "pme_nom": pme.nom_entreprise,
            "deja_associe": not created,
        },
        status=(
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        ),
    )


@api_view(["DELETE"])
@permission_classes([IsAdmin])
def supprimer_association(
    request,
    association_id,
):
    get_object_or_404(
        ConsultantPME,
        id=association_id,
    ).delete()

    return Response(
        status=status.HTTP_204_NO_CONTENT
    )


# ============================================================
# CONSULTANT
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def consultant_pmes(request):

    if request.user.role == User.ROLE_CONSULTANT:
        pmes = (
            PME.objects
            .filter(
                consultants__consultant=request.user
            )
            .distinct()
        )

    elif request.user.role == User.ROLE_ADMIN:
        pmes = PME.objects.all()

    else:
        return Response(
            {
                "detail":
                "Accès réservé aux consultants et administrateurs."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    from referentiel.models import Evaluation
    from referentiel.services import ScoreCalculator

    resultats = []

    for pme in pmes.select_related("utilisateur"):

        derniere = (
            Evaluation.objects
            .filter(
                pme=pme,
                statut=Evaluation.STATUT_TERMINEE,
                score_total__isnull=False,
            )
            .order_by("-date_fin")
            .first()
        )

        niveau = None

        if derniere:
            niveau = (
                ScoreCalculator(derniere)
                .determiner_niveau_maturite(
                    derniere.score_total
                )
                ["niveau"]
            )

        resultats.append(
            {
                "id": pme.id,
                "nom_entreprise":
                    pme.nom_entreprise,
                "secteur":
                    pme.secteur,
                "email":
                    pme.utilisateur.email,
                "dernier_score":
                    derniere.score_total
                    if derniere
                    else None,
                "niveau_maturite":
                    niveau,
                "date_derniere_evaluation":
                    derniere.date_fin
                    if derniere
                    else None,
                "derniere_evaluation_id":
                    derniere.id
                    if derniere
                    else None,
                "evaluation_en_cours":
                    Evaluation.objects.filter(
                        pme=pme,
                        statut=Evaluation.STATUT_EN_COURS,
                    ).exists(),
            }
        )

    return Response(resultats)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def historique_pme(request, pme_id):
    """
    Historique des évaluations d'une PME.

    Accessible au consultant qui suit cette PME
    ou à un administrateur.
    """

    pme = get_object_or_404(
        PME,
        id=pme_id,
    )

    autorise = (
        request.user.role == User.ROLE_ADMIN
        or (
            request.user.role == User.ROLE_CONSULTANT
            and ConsultantPME.objects.filter(
                consultant=request.user,
                pme=pme,
            ).exists()
        )
    )

    if not autorise:
        return Response(
            {
                "detail":
                "Vous n'êtes pas autorisé à consulter "
                "l'historique de cette PME."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    from referentiel.models import Evaluation
    from referentiel.services import ScoreCalculator

    evaluations = (
        Evaluation.objects
        .filter(
            pme=pme,
            statut=Evaluation.STATUT_TERMINEE,
            score_total__isnull=False,
        )
        .order_by("date_fin")
    )

    historique = []

    for evaluation in evaluations:

        niveau = (
            ScoreCalculator(evaluation)
            .determiner_niveau_maturite(
                evaluation.score_total
            )
            ["niveau"]
        )

        historique.append(
            {
                "id": evaluation.id,
                "score": evaluation.score_total,
                "niveau_maturite": niveau,
                "date_debut":
                    evaluation.date_debut,
                "date_fin":
                    evaluation.date_fin,
            }
        )

    return Response(
        {
            "pme": {
                "id": pme.id,
                "nom_entreprise":
                    pme.nom_entreprise,
                "secteur":
                    pme.secteur,
            },
            "evaluations": historique,
        }
    )


# ============================================================
# CHATBOT
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chatbot_question(request):
    message = str(
        request.data.get(
            "message",
            "",
        )
    ).lower().strip()

    if not message:
        return Response(
            {
                "detail":
                "Le message ne peut pas être vide."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    for entree in FAQEntry.objects.all():

        mots = [
            mot.strip().lower()
            for mot in entree.mots_cles.split(",")
            if len(mot.strip()) >= 3
        ]

        if any(
            mot in message
            for mot in mots
        ):
            return Response(
                {
                    "trouve": True,
                    "titre": entree.titre,
                    "reponse": entree.reponse,
                }
            )

    return Response(
        {
            "trouve": False,
            "reponse":
                "Je n'ai pas trouvé de réponse précise. "
                "Reformulez votre question ou contactez "
                "un consultant.",
        }
    )


# ============================================================
# DEMANDES
# ============================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def demandes_accompagnement(request):

    if request.user.role == User.ROLE_PME:

        pme = getattr(request.user, "pme", None)

        if pme is None:
            return Response(
                {"detail": "Aucun profil PME associé."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.method == "POST":

            serializer = DemandeAccompagnementSerializer(
                data=request.data
            )

            serializer.is_valid(raise_exception=True)

            consultant = serializer.validated_data.get("consultant")

            if consultant is None:
                return Response(
                    {
                        "detail": "Veuillez sélectionner un consultant."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Empêcher plusieurs demandes en attente
            # vers le même consultant
            demande_existante = (
                DemandeAccompagnement.objects
                .filter(
                    pme=pme,
                    consultant=consultant,
                    statut=DemandeAccompagnement.STATUT_NOUVELLE,
                )
                .exists()
            )

            if demande_existante:
                return Response(
                    {
                        "detail": (
                            "Une demande est déjà en attente "
                            "pour ce consultant."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            demande = serializer.save(pme=pme)

            return Response(
                DemandeAccompagnementSerializer(
                    demande
                ).data,
                status=status.HTTP_201_CREATED,
            )

        demandes = (
            DemandeAccompagnement.objects
            .filter(pme=pme)
        )

    elif request.user.role == User.ROLE_CONSULTANT:

        # Le consultant voit les demandes
        # qui lui sont directement adressées
        demandes = (
            DemandeAccompagnement.objects
            .filter(consultant=request.user)
        )

    elif request.user.role == User.ROLE_ADMIN:

        demandes = DemandeAccompagnement.objects.all()

    else:
        return Response(
            {"detail": "Accès refusé."},
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response(
        DemandeAccompagnementSerializer(
            demandes.select_related(
                "pme",
                "consultant",
            ),
            many=True,
        ).data
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def modifier_demande_accompagnement(
    request,
    demande_id,
):

    demande = get_object_or_404(
        DemandeAccompagnement,
        id=demande_id,
    )

    # Seul le consultant auquel la demande est adressée
    # peut la traiter.
    autorise = (
        request.user.role == User.ROLE_ADMIN
        or (
            request.user.role == User.ROLE_CONSULTANT
            and demande.consultant_id == request.user.id
        )
    )

    if not autorise:
        return Response(
            {"detail": "Accès refusé."},
            status=status.HTTP_403_FORBIDDEN,
        )

    nouveau_statut = request.data.get("statut")

    if nouveau_statut not in (
        DemandeAccompagnement.STATUT_EN_COURS,
        DemandeAccompagnement.STATUT_REFUSEE,
    ):
        return Response(
            {
                "detail": (
                    "Le statut doit être EN_COURS "
                    "ou REFUSEE."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Une demande déjà traitée ne peut plus être modifiée
    if demande.statut != DemandeAccompagnement.STATUT_NOUVELLE:
        return Response(
            {
                "detail": (
                    "Cette demande a déjà été traitée."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    donnees = {
        "statut": nouveau_statut,
    }

    if "reponse" in request.data:
        donnees["reponse"] = request.data["reponse"]

    serializer = DemandeAccompagnementSerializer(
        demande,
        data=donnees,
        partial=True,
    )

    serializer.is_valid(raise_exception=True)

    # ACCEPTATION
    if (
        nouveau_statut
        == DemandeAccompagnement.STATUT_EN_COURS
    ):

        consultant = demande.consultant

        if consultant is None:
            return Response(
                {
                    "detail": (
                        "Aucun consultant n'est associé "
                        "à cette demande."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Création de l'association seulement maintenant
        ConsultantPME.objects.get_or_create(
            pme=demande.pme,
            consultant=consultant,
        )

    serializer.save()

    return Response(serializer.data)

# ============================================================
# MESSAGERIE
# ============================================================

def _interlocuteur(
    request,
    pme,
    consultant_id=None,
):
    """
    Détermine l'autre personne de la conversation.
    """

    if request.user.role == User.ROLE_CONSULTANT:

        relation = (
            ConsultantPME.objects
            .filter(
                consultant=request.user,
                pme=pme,
            )
            .select_related(
                "pme__utilisateur"
            )
            .first()
        )

        return (
            relation.pme.utilisateur
            if relation
            else None
        )

    if (
        request.user.role == User.ROLE_PME
        and pme.utilisateur_id == request.user.id
    ):

        relations = (
            ConsultantPME.objects
            .filter(pme=pme)
            .select_related("consultant")
        )

        if consultant_id:

            try:
                consultant_id = int(
                    consultant_id
                )
            except (
                TypeError,
                ValueError,
            ):
                return None

            relation = relations.filter(
                consultant_id=consultant_id
            ).first()

            return (
                relation.consultant
                if relation
                else None
            )

        if relations.count() == 1:
            return relations.first().consultant

    return None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def messages_conversation(
    request,
    pme_id,
):
    pme = get_object_or_404(
        PME,
        id=pme_id,
    )

    other = _interlocuteur(
        request,
        pme,
        request.query_params.get(
            "destinataire_id"
        ),
    )

    if other is None:
        return Response(
            {
                "detail":
                "Conversation non autorisée."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    messages = (
        Message.objects
        .filter(
            pme_concernee=pme,
            expediteur__in=[
                request.user,
                other,
            ],
            destinataire__in=[
                request.user,
                other,
            ],
        )
        .select_related(
            "expediteur",
            "destinataire",
        )
        .order_by("date_envoi")
    )

    return Response(
        MessageSerializer(
            messages,
            many=True,
        ).data
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def envoyer_message(
    request,
    pme_id,
):
    pme = get_object_or_404(
        PME,
        id=pme_id,
    )

    other = _interlocuteur(
        request,
        pme,
        request.data.get(
            "destinataire_id"
        ),
    )

    contenu = str(
        request.data.get(
            "contenu",
            "",
        )
    ).strip()

    if other is None:
        return Response(
            {
                "detail":
                "Conversation non autorisée."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if not contenu:
        return Response(
            {
                "contenu":
                ["Le message ne peut pas être vide."]
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    message = Message.objects.create(
        expediteur=request.user,
        destinataire=other,
        pme_concernee=pme,
        contenu=contenu,
    )

    return Response(
        MessageSerializer(message).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def messages_non_lus(request):
    return Response(
        {
            "total":
            Message.objects.filter(
                destinataire=request.user,
                lu=False,
            ).count()
        }
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def marquer_messages_lus(
    request,
    pme_id,
):
    pme = get_object_or_404(
        PME,
        id=pme_id,
    )

    other = _interlocuteur(
        request,
        pme,
        request.data.get(
            "destinataire_id"
        )
        or request.query_params.get(
            "destinataire_id"
        ),
    )

    if other is None:
        return Response(
            {
                "detail":
                "Conversation non autorisée."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    (
        Message.objects
        .filter(
            pme_concernee=pme,
            destinataire=request.user,
            expediteur=other,
            lu=False,
        )
        .update(lu=True)
    )

    return Response(
        {"ok": True}
    )

@api_view(["PATCH", "DELETE"])
@permission_classes([IsAdmin])
def modifier_utilisateur(request, user_id):
    user = get_object_or_404(User, id=user_id)

    # =========================
    # MODIFICATION DU RÔLE
    # =========================
    if request.method == "PATCH":
        role = request.data.get("role")

        if role not in {
            User.ROLE_PME,
            User.ROLE_CONSULTANT,
            User.ROLE_ADMIN,
        }:
            return Response(
                {"detail": "Rôle invalide."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.role = role
        user.save(update_fields=["role"])

        return Response(UserSerializer(user).data)

    # =========================
    # SUPPRESSION
    # =========================
    if request.method == "DELETE":

        # Empêcher l'admin de supprimer son propre compte
        if user.id == request.user.id:
            return Response(
                {
                    "detail":
                    "Vous ne pouvez pas supprimer votre propre compte."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()

        return Response(
            {
                "detail":
                "Utilisateur supprimé avec succès."
            },
            status=status.HTTP_204_NO_CONTENT,
        )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def demandes_suivi(request):

    # ==========================================
    # PME
    # ==========================================

    if request.user.role == User.ROLE_PME:

        pme = getattr(
            request.user,
            "pme",
            None,
        )

        if pme is None:
            return Response(
                {
                    "detail": "Aucun profil PME associé."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------
        # Création d'une demande de suivi
        # --------------------------------------

        if request.method == "POST":

            serializer = DemandeSuiviSerializer(
                data=request.data
            )

            serializer.is_valid(
                raise_exception=True
            )

            consultant = (
                serializer.validated_data[
                    "consultant"
                ]
            )

            # Vérifier qu'une demande est déjà
            # en attente pour ce consultant
            demande_existante = (
                DemandeSuivi.objects
                .filter(
                    pme=pme,
                    consultant=consultant,
                    statut=DemandeSuivi.STATUT_EN_ATTENTE,
                )
                .exists()
            )

            if demande_existante:
                return Response(
                    {
                        "detail": (
                            "Une demande est déjà "
                            "en attente pour ce consultant."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Vérifier si ce consultant suit
            # déjà cette PME
            association_existante = (
                ConsultantPME.objects.filter(
                    pme=pme,
                    consultant=consultant,
                ).exists()
            )

            if association_existante:
                return Response(
                    {
                        "detail": (
                            "Ce consultant suit déjà "
                            "votre entreprise."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            demande = serializer.save(
                pme=pme
            )

            return Response(
                DemandeSuiviSerializer(
                    demande
                ).data,
                status=status.HTTP_201_CREATED,
            )

        # --------------------------------------
        # Historique des demandes de la PME
        # --------------------------------------

        demandes = (
            DemandeSuivi.objects
            .filter(pme=pme)
            .select_related(
                "pme",
                "consultant",
            )
        )

    # ==========================================
    # CONSULTANT
    # ==========================================

    elif request.user.role == User.ROLE_CONSULTANT:

        # Le consultant voit uniquement
        # les demandes qui lui sont adressées.
        demandes = (
            DemandeSuivi.objects
            .filter(
                consultant=request.user
            )
            .select_related(
                "pme",
                "consultant",
            )
        )

    # ==========================================
    # ADMIN
    # ==========================================

    elif request.user.role == User.ROLE_ADMIN:

        demandes = (
            DemandeSuivi.objects
            .all()
            .select_related(
                "pme",
                "consultant",
            )
        )

    else:

        return Response(
            {
                "detail": "Accès refusé."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response(
        DemandeSuiviSerializer(
            demandes,
            many=True,
        ).data
    )


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def traiter_demande_suivi(
    request,
    demande_id,
):
    demande = get_object_or_404(
        DemandeSuivi,
        id=demande_id,
    )

    # ==========================================
    # SUPPRESSION DE LA DEMANDE
    # ==========================================

    if request.method == "DELETE":

        autorise_suppression = (
            request.user.role == User.ROLE_ADMIN
            or (
                request.user.role == User.ROLE_PME
                and demande.pme.utilisateur_id
                == request.user.id
            )
            or (
                request.user.role == User.ROLE_CONSULTANT
                and demande.consultant_id
                == request.user.id
            )
        )

        if not autorise_suppression:
            return Response(
                {
                    "detail": "Vous n'êtes pas autorisé à supprimer cette demande."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        demande.delete()

        return Response(
            {
                "detail": "Demande supprimée avec succès."
            },
            status=status.HTTP_204_NO_CONTENT,
        )

    # ==========================================
    # TRAITEMENT DE LA DEMANDE
    # ==========================================

    autorise = (
        request.user.role == User.ROLE_ADMIN
        or (
            request.user.role == User.ROLE_CONSULTANT
            and demande.consultant_id
            == request.user.id
        )
    )

    if not autorise:
        return Response(
            {
                "detail": "Accès refusé."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # ==========================================
    # DEMANDE DÉJÀ TRAITÉE
    # ==========================================

    if (
        demande.statut
        != DemandeSuivi.STATUT_EN_ATTENTE
    ):
        return Response(
            {
                "detail": (
                    "Cette demande a déjà été traitée."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    nouveau_statut = request.data.get(
        "statut"
    )

    # ==========================================
    # STATUT VALIDE
    # ==========================================

    if nouveau_statut not in (
        DemandeSuivi.STATUT_ACCEPTEE,
        DemandeSuivi.STATUT_REFUSEE,
    ):
        return Response(
            {
                "detail": (
                    "Le statut doit être "
                    "ACCEPTEE ou REFUSEE."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    reponse = request.data.get(
        "reponse",
        "",
    )

    # ==========================================
    # ACCEPTATION
    # ==========================================

    if (
        nouveau_statut
        == DemandeSuivi.STATUT_ACCEPTEE
    ):

        # Création de la relation uniquement
        # après acceptation de la demande.

        ConsultantPME.objects.get_or_create(
            consultant=demande.consultant,
            pme=demande.pme,
        )

    # ==========================================
    # MISE À JOUR
    # ==========================================

    demande.statut = nouveau_statut
    demande.reponse = reponse
    demande.save(
        update_fields=[
            "statut",
            "reponse",
        ]
    )

    return Response(
        DemandeSuiviSerializer(
            demande
        ).data,
        status=status.HTTP_200_OK,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def terminer_accompagnement(request, pme_id):
    """
    Met fin à l'accompagnement entre le consultant connecté
    et une PME.

    La relation ConsultantPME est supprimée, mais les demandes
    et l'historique des évaluations sont conservés.
    """

    pme = get_object_or_404(
        PME,
        id=pme_id,
    )

    # ==========================================
    # AUTORISATION
    # ==========================================

    if request.user.role == User.ROLE_CONSULTANT:
        relation = (
            ConsultantPME.objects
            .filter(
                consultant=request.user,
                pme=pme,
            )
            .first()
        )

    elif request.user.role == User.ROLE_ADMIN:
        relation = (
            ConsultantPME.objects
            .filter(pme=pme)
            .first()
        )

    else:
        return Response(
            {
                "detail":
                    "Seuls les consultants et administrateurs "
                    "peuvent mettre fin à un accompagnement."
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    # ==========================================
    # RELATION INEXISTANTE
    # ==========================================

    if relation is None:
        return Response(
            {
                "detail":
                    "Aucun accompagnement actif trouvé."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # ==========================================
    # SUPPRESSION DE LA RELATION
    # ==========================================

    relation.delete()

    return Response(
        {
            "detail":
                "L'accompagnement a été terminé avec succès."
        },
        status=status.HTTP_204_NO_CONTENT,
    )    