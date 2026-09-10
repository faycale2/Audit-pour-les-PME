import secrets
from datetime import timedelta

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
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
)
from .permissions import IsAdmin, IsPME
from .serializers import (
    ConsultantSerializer,
    ConnexionSerializer,
    DemandeAccompagnementSerializer,
    InscriptionSerializer,
    MessageSerializer,
    PMESerializer,
    UserSerializer,
)


def generer_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


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
            last_name=data.get("last_name", "")
        )
<<<<<<< HEAD
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

=======
        if role == User.ROLE_PME:
            PME.objects.create(
                utilisateur=user, 
                nom_entreprise=data.get("nom_entreprise", ""), 
                secteur=data.get("secteur", "")
            )
            
    return Response({**generer_tokens(user), "role": user.role, "user_id": user.id}, status=status.HTTP_201_CREATED)
>>>>>>> origin/main
@api_view(["POST"])
@permission_classes([AllowAny])
def connexion(request):
    serializer = ConnexionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
<<<<<<< HEAD

    # Utiliser filter().first() au lieu de get() pour éviter MultipleObjectsReturned
    user_obj = User.objects.filter(email=data["email"]).first()
    if not user_obj:
        return Response({"detail": "Identifiants invalides."}, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(username=user_obj.username, password=data["password"])
=======
    user_obj = User.objects.filter(email__iexact=data["email"]).first()
    user = authenticate(username=user_obj.username, password=data["password"]) if user_obj else None
>>>>>>> origin/main
    if not user:
        return Response({"detail": "Identifiants invalides."}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({**generer_tokens(user), "role": user.role, "user_id": user.id})


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

            nom_complet = (
                f"{consultant.first_name} {consultant.last_name}"
            ).strip()

            # Si le consultant n'a pas encore renseigné
            # son prénom/nom, on garde un nom générique.
            if not nom_complet:
                nom_complet = "Consultant"

            consultants.append({
                "consultant_id": consultant.id,
                "consultant_nom": nom_complet,
                "first_name": consultant.first_name,
                "last_name": consultant.last_name,
            })

        data["consultants"] = consultants

    return Response(data)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def profil_photo(request):
    pme = getattr(request.user, "pme", None)
    photo = request.FILES.get("photo_profil")
    if pme is None:
        return Response({"detail": "La photo est disponible pour les profils PME."}, status=status.HTTP_400_BAD_REQUEST)
    if photo is None or not photo.content_type.startswith("image/"):
        return Response({"photo_profil": ["Sélectionnez une image valide."]}, status=status.HTTP_400_BAD_REQUEST)
    if photo.size > 5 * 1024 * 1024:
        return Response({"photo_profil": ["L'image doit faire moins de 5 Mo."]}, status=status.HTTP_400_BAD_REQUEST)
    pme.photo_profil = photo
    pme.save(update_fields=["photo_profil"])
    return Response(PMESerializer(pme).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def changer_mot_de_passe(request):
    ancien = request.data.get("ancien_mot_de_passe", "")
    nouveau = request.data.get("nouveau_mot_de_passe", "")
    if not request.user.check_password(ancien):
        return Response({"detail": "L'ancien mot de passe est incorrect."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_password(nouveau, request.user)
    except Exception as error:
        return Response({"nouveau_mot_de_passe": error.messages}, status=status.HTTP_400_BAD_REQUEST)
    request.user.set_password(nouveau)
    request.user.save(update_fields=["password"])
    return Response({"detail": "Mot de passe modifié avec succès."})


@api_view(["POST"])
@permission_classes([AllowAny])
def mot_de_passe_oublie(request):
    user = User.objects.filter(email__iexact=str(request.data.get("email", "")).strip()).first()
    if user:
        token = secrets.token_urlsafe(48)
        JetonReinitialisation.objects.filter(user=user).delete()
        JetonReinitialisation.objects.create(user=user, token=token)
        send_mail("Réinitialisation de votre mot de passe", f"Votre token de réinitialisation est : {token}", None, [user.email])
    return Response({"detail": "Si un compte correspond à cet email, un token a été envoyé."})


@api_view(["POST"])
@permission_classes([AllowAny])
def reinitialiser_mot_de_passe(request):
    jeton = JetonReinitialisation.objects.select_related("user").filter(token=request.data.get("token", "")).first()
    if not jeton or timezone.now() - jeton.date_creation > timedelta(hours=1):
        return Response({"detail": "Token invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_password(request.data.get("nouveau_mot_de_passe", ""), jeton.user)
    except Exception as error:
        return Response({"nouveau_mot_de_passe": error.messages}, status=status.HTTP_400_BAD_REQUEST)
    jeton.user.set_password(request.data["nouveau_mot_de_passe"])
    jeton.user.save(update_fields=["password"])
    jeton.delete()
    return Response({"detail": "Mot de passe réinitialisé avec succès."})


@api_view(["GET", "PUT"])
@permission_classes([IsAdmin])
def gerer_seuils(request):
    config, _ = ConfigurationSeuils.objects.get_or_create(id=1)
    champs = ("seuil_niveau2", "seuil_niveau3", "seuil_niveau4", "seuil_niveau5")
    if request.method == "PUT":
        valeurs = []
        for champ in champs:
            try:
                valeur = int(request.data.get(champ, getattr(config, champ)))
            except (TypeError, ValueError):
                return Response({"detail": f"{champ} doit être un entier."}, status=status.HTTP_400_BAD_REQUEST)
            if not 0 <= valeur <= 116:
                return Response({"detail": f"{champ} doit être compris entre 0 et 116."}, status=status.HTTP_400_BAD_REQUEST)
            valeurs.append(valeur)
        if valeurs != sorted(valeurs) or len(set(valeurs)) != len(valeurs):
            return Response({"detail": "Les seuils doivent être strictement croissants."}, status=status.HTTP_400_BAD_REQUEST)
        for champ, valeur in zip(champs, valeurs):
            setattr(config, champ, valeur)
        config.save()
    return Response({champ: getattr(config, champ) for champ in champs})


@api_view(["GET"])
@permission_classes([IsAdmin])
def statistiques_globales(request):
    return Response({"nombre_pme": PME.objects.count(), "nombre_utilisateurs": User.objects.count(), "repartition_par_secteur": list(PME.objects.values("secteur").annotate(total=__import__("django.db.models", fromlist=["Count"]).Count("id")).order_by("-total"))})


@api_view(["GET"])
@permission_classes([IsAdmin])
def liste_utilisateurs(request):
    return Response(UserSerializer(User.objects.all(), many=True).data)


@api_view(["PATCH"])
@permission_classes([IsAdmin])
def modifier_utilisateur(request, user_id):
    user = get_object_or_404(User, id=user_id)
    role = request.data.get("role")
    if role not in {User.ROLE_PME, User.ROLE_CONSULTANT, User.ROLE_ADMIN}:
        return Response({"detail": "Rôle invalide."}, status=status.HTTP_400_BAD_REQUEST)
    user.role = role
    user.save(update_fields=["role"])
    return Response(UserSerializer(user).data)


@api_view(["GET"])
@permission_classes([IsAdmin])
def liste_pmes(request):
    return Response([{"id": p.id, "nom_entreprise": p.nom_entreprise, "email": p.utilisateur.email} for p in PME.objects.select_related("utilisateur")])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def consultants_disponibles(request):
    if request.user.role not in (User.ROLE_PME, User.ROLE_ADMIN):
        return Response({"detail": "Accès réservé aux PME et administrateurs."}, status=status.HTTP_403_FORBIDDEN)
    return Response(ConsultantSerializer(User.objects.filter(role=User.ROLE_CONSULTANT, is_active=True), many=True).data)


@api_view(["POST"])
@permission_classes([IsPME])
def choisir_consultant(request):
    pme = getattr(request.user, "pme", None)
    consultant = get_object_or_404(User, id=request.data.get("consultant_id"), role=User.ROLE_CONSULTANT, is_active=True)
    if pme is None:
        return Response({"detail": "Aucun profil PME associé à ce compte."}, status=status.HTTP_400_BAD_REQUEST)
    association, created = ConsultantPME.objects.get_or_create(pme=pme, consultant=consultant)
    return Response({"id": association.id, "consultant": ConsultantSerializer(consultant).data, "deja_associe": not created}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsAdmin])
def associations_consultant(request):
    if request.method == "GET":
        return Response([{"id": a.id, "consultant": ConsultantSerializer(a.consultant).data, "pme_id": a.pme_id, "pme_nom": a.pme.nom_entreprise, "pme_email": a.pme.utilisateur.email} for a in ConsultantPME.objects.select_related("consultant", "pme", "pme__utilisateur")])
    consultant = get_object_or_404(User, id=request.data.get("consultant_id"), role=User.ROLE_CONSULTANT)
    pme = get_object_or_404(PME, id=request.data.get("pme_id"))
    association, created = ConsultantPME.objects.get_or_create(pme=pme, consultant=consultant)
    return Response({"id": association.id, "consultant": ConsultantSerializer(consultant).data, "pme_id": pme.id, "pme_nom": pme.nom_entreprise, "deja_associe": not created}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAdmin])
def supprimer_association(request, association_id):
    get_object_or_404(ConsultantPME, id=association_id).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def consultant_pmes(request):
    if request.user.role == User.ROLE_CONSULTANT:
        pmes = PME.objects.filter(consultants__consultant=request.user).distinct()
    elif request.user.role == User.ROLE_ADMIN:
        pmes = PME.objects.all()
    else:
        return Response({"detail": "Accès réservé aux consultants et administrateurs."}, status=status.HTTP_403_FORBIDDEN)
    from referentiel.models import Evaluation
    from referentiel.services import ScoreCalculator
    resultats = []
    for pme in pmes.select_related("utilisateur"):
        derniere = Evaluation.objects.filter(pme=pme, statut=Evaluation.STATUT_TERMINEE, score_total__isnull=False).order_by("-date_fin").first()
        resultats.append({"id": pme.id, "nom_entreprise": pme.nom_entreprise, "secteur": pme.secteur, "email": pme.utilisateur.email, "dernier_score": derniere.score_total if derniere else None, "niveau_maturite": ScoreCalculator(derniere).determiner_niveau_maturite(derniere.score_total)["niveau"] if derniere else None, "date_derniere_evaluation": derniere.date_fin if derniere else None, "evaluation_en_cours": Evaluation.objects.filter(pme=pme, statut=Evaluation.STATUT_EN_COURS).exists()})
    return Response(resultats)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chatbot_question(request):
    message = str(request.data.get("message", "")).lower().strip()
    if not message:
        return Response({"detail": "Le message ne peut pas être vide."}, status=status.HTTP_400_BAD_REQUEST)
    for entree in FAQEntry.objects.all():
        mots = [mot.strip().lower() for mot in entree.mots_cles.split(",") if len(mot.strip()) >= 3]
        if any(mot in message for mot in mots):
            return Response({"trouve": True, "titre": entree.titre, "reponse": entree.reponse})
    return Response({"trouve": False, "reponse": "Je n'ai pas trouvé de réponse précise. Reformulez votre question ou contactez un consultant."})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def demandes_accompagnement(request):
    if request.user.role == User.ROLE_PME:
        pme = getattr(request.user, "pme", None)
        if pme is None: return Response({"detail": "Aucun profil PME associé."}, status=status.HTTP_400_BAD_REQUEST)
        if request.method == "POST":
            serializer = DemandeAccompagnementSerializer(data=request.data); serializer.is_valid(raise_exception=True); return Response(DemandeAccompagnementSerializer(serializer.save(pme=pme)).data, status=status.HTTP_201_CREATED)
        demandes = DemandeAccompagnement.objects.filter(pme=pme)
    elif request.user.role == User.ROLE_CONSULTANT:
        demandes = DemandeAccompagnement.objects.filter(pme__consultants__consultant=request.user).distinct()
    elif request.user.role == User.ROLE_ADMIN:
        demandes = DemandeAccompagnement.objects.all()
    else: return Response({"detail": "Accès refusé."}, status=status.HTTP_403_FORBIDDEN)
    return Response(DemandeAccompagnementSerializer(demandes.select_related("pme", "consultant"), many=True).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def modifier_demande_accompagnement(request, demande_id):
    demande = get_object_or_404(DemandeAccompagnement, id=demande_id)
    autorise = request.user.role == User.ROLE_ADMIN or (request.user.role == User.ROLE_CONSULTANT and demande.pme.consultants.filter(consultant=request.user).exists())
    if not autorise: return Response({"detail": "Accès refusé."}, status=status.HTTP_403_FORBIDDEN)
    serializer = DemandeAccompagnementSerializer(demande, data={k: request.data[k] for k in ("reponse", "statut") if k in request.data}, partial=True); serializer.is_valid(raise_exception=True)
    if request.user.role == User.ROLE_CONSULTANT: serializer.save(consultant=request.user)
    else: serializer.save()
    return Response(serializer.data)


def _interlocuteur(request, pme, consultant_id=None):
    if request.user.role == User.ROLE_CONSULTANT:
        relation = ConsultantPME.objects.filter(consultant=request.user, pme=pme).select_related("pme__utilisateur").first()
        return relation.pme.utilisateur if relation else None
    if request.user.role == User.ROLE_PME and pme.utilisateur_id == request.user.id:
        relations = ConsultantPME.objects.filter(pme=pme).select_related("consultant")
        return next((r.consultant for r in relations if consultant_id and r.consultant_id == int(consultant_id)), None) or (relations[0].consultant if relations.count() == 1 else None)
    return None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def messages_conversation(request, pme_id):
    pme = get_object_or_404(PME, id=pme_id); other = _interlocuteur(request, pme, request.query_params.get("destinataire_id"))
    if other is None: return Response({"detail": "Conversation non autorisée."}, status=status.HTTP_403_FORBIDDEN)
    messages = Message.objects.filter(pme_concernee=pme, expediteur__in=[request.user, other], destinataire__in=[request.user, other]).select_related("expediteur")
    return Response(MessageSerializer(messages, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def envoyer_message(request, pme_id):
    pme = get_object_or_404(PME, id=pme_id); other = _interlocuteur(request, pme, request.data.get("destinataire_id")); contenu = str(request.data.get("contenu", "")).strip()
    if other is None: return Response({"detail": "Conversation non autorisée."}, status=status.HTTP_403_FORBIDDEN)
    if not contenu: return Response({"contenu": ["Le message ne peut pas être vide."]}, status=status.HTTP_400_BAD_REQUEST)
    return Response(MessageSerializer(Message.objects.create(expediteur=request.user, destinataire=other, pme_concernee=pme, contenu=contenu)).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def messages_non_lus(request): return Response({"total": Message.objects.filter(destinataire=request.user, lu=False).count()})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def marquer_messages_lus(request, pme_id):
    pme = get_object_or_404(PME, id=pme_id); other = _interlocuteur(request, pme, request.data.get("destinataire_id") or request.query_params.get("destinataire_id"))
    if other is None: return Response({"detail": "Conversation non autorisée."}, status=status.HTTP_403_FORBIDDEN)
    Message.objects.filter(pme_concernee=pme, destinataire=request.user, expediteur=other, lu=False).update(lu=True)
    return Response({"ok": True})
