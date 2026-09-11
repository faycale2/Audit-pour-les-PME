from django.contrib.auth import authenticate

from rest_framework import serializers

from .models import (
    User,
    PME,
    ConsultantPME,
    DemandeAccompagnement,
    DemandeSuivi,
    Message,
)


# ============================================================
# INSCRIPTION
# ============================================================

class InscriptionSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        min_length=8
    )

    role = serializers.CharField(
        required=False,
        default="PME",
    )

    nom_entreprise = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
    )

    secteur = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )

    first_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )

    last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )

    def validate_email(self, value):

        if User.objects.filter(
            email__iexact=value
        ).exists():

            raise serializers.ValidationError(
                "Un compte existe déjà avec cet email."
            )

        return value

    def validate(self, attrs):

        from django.contrib.auth.password_validation import (
            validate_password,
        )

        validate_password(
            attrs["password"]
        )

        role = attrs.get(
            "role",
            User.ROLE_PME,
        )

        # Sécurité : impossible de créer
        # soi-même un compte administrateur.

        if role == User.ROLE_ADMIN:

            raise serializers.ValidationError(
                {
                    "role": (
                        "La création d'un compte "
                        "administrateur n'est pas autorisée."
                    )
                }
            )

        # PME

        if (
            role == User.ROLE_PME
            and not attrs.get("nom_entreprise")
        ):

            raise serializers.ValidationError(
                {
                    "nom_entreprise": (
                        "Ce champ est obligatoire pour une PME."
                    )
                }
            )

        # Consultant

        if (
            role == User.ROLE_CONSULTANT
            and (
                not attrs.get("first_name")
                or not attrs.get("last_name")
            )
        ):

            raise serializers.ValidationError(
                {
                    "detail": (
                        "Le prénom et le nom sont obligatoires "
                        "pour un consultant."
                    )
                }
            )

        return attrs


# ============================================================
# CONNEXION
# ============================================================

class ConnexionSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField()


# ============================================================
# UTILISATEUR
# ============================================================

class UserSerializer(serializers.ModelSerializer):

    nom = serializers.SerializerMethodField()

    photo_url = serializers.ImageField(
        source="photo_profil",
        read_only=True,
    )

    class Meta:

        model = User

        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "nom",
            "role",
            "photo_url",
        ]

    def get_nom(self, obj):

        nom = obj.get_full_name().strip()

        if nom:
            return nom

        return "Utilisateur"


# ============================================================
# PME
# ============================================================

class PMESerializer(serializers.ModelSerializer):

    """
    Informations propres à une PME.

    photo_url est conservé ici pour compatibilité
    avec les anciennes photos PME.
    """

    photo_url = serializers.ImageField(
        source="photo_profil",
        read_only=True,
    )

    class Meta:

        model = PME

        fields = [
            "id",
            "nom_entreprise",
            "secteur",
            "photo_url",
        ]


# ============================================================
# QUESTIONS AUX CONSULTANTS
# ============================================================

class DemandeAccompagnementSerializer(
    serializers.ModelSerializer
):

    """
    Question posée par une PME.

    Cette fonctionnalité est indépendante de DemandeSuivi.

    Une PME peut poser une question et un consultant
    peut y répondre.

    Cela ne crée pas automatiquement une relation
    de suivi entre la PME et le consultant.
    """

    pme_nom = serializers.CharField(
        source="pme.nom_entreprise",
        read_only=True,
    )

    consultant_nom = serializers.SerializerMethodField()

    class Meta:

        model = DemandeAccompagnement

        fields = [
            "id",
            "pme",
            "pme_nom",
            "consultant",
            "consultant_nom",
            "commentaire",
            "reponse",
            "statut",
            "date_creation",
            "date_modification",
        ]

        read_only_fields = [
            "pme",
            "pme_nom",
            "consultant_nom",
            "reponse",
            "statut",
            "date_creation",
            "date_modification",
        ]

    def get_consultant_nom(self, obj):

        if not obj.consultant:
            return None

        nom = (
            f"{obj.consultant.first_name} "
            f"{obj.consultant.last_name}"
        ).strip()

        return (
            nom
            or obj.consultant.username
        )

    def validate_consultant(self, consultant):

        if consultant.role != User.ROLE_CONSULTANT:

            raise serializers.ValidationError(
                "L'utilisateur sélectionné n'est pas un consultant."
            )

        if not consultant.is_active:

            raise serializers.ValidationError(
                "Ce consultant n'est plus disponible."
            )

        return consultant


# ============================================================
# DEMANDE OFFICIELLE DE SUIVI
# ============================================================

class DemandeSuiviSerializer(
    serializers.ModelSerializer
):

    """
    Demande officielle d'une PME pour être suivie
    par un consultant.

    Workflow :

        PME choisit un consultant
                    ↓
               EN_ATTENTE
                    ↓
             Consultant
              /       \
         Accepte      Refuse
            ↓            ↓
        ACCEPTEE      REFUSEE
            ↓
       ConsultantPME
            ↓
      Suivi de la PME
    """

    pme_nom = serializers.CharField(
        source="pme.nom_entreprise",
        read_only=True,
    )

    consultant_nom = serializers.SerializerMethodField()

    class Meta:

        model = DemandeSuivi

        fields = [
            "id",
            "pme",
            "pme_nom",
            "consultant",
            "consultant_nom",
            "message",
            "reponse",
            "statut",
            "date_creation",
            "date_modification",
        ]

        read_only_fields = [
            "id",
            "pme",
            "pme_nom",
            "consultant_nom",
            "reponse",
            "statut",
            "date_creation",
            "date_modification",
        ]

    def get_consultant_nom(self, obj):

        consultant = obj.consultant

        nom = (
            f"{consultant.first_name} "
            f"{consultant.last_name}"
        ).strip()

        return (
            nom
            or consultant.username
        )

    def validate_consultant(self, consultant):

        if consultant.role != User.ROLE_CONSULTANT:

            raise serializers.ValidationError(
                "L'utilisateur sélectionné n'est pas un consultant."
            )

        if not consultant.is_active:

            raise serializers.ValidationError(
                "Ce consultant n'est plus disponible."
            )

        return consultant

    def validate_message(self, value):

        if not value.strip():

            raise serializers.ValidationError(
                "Veuillez présenter votre demande."
            )

        return value.strip()


# ============================================================
# MESSAGES
# ============================================================

class MessageSerializer(
    serializers.ModelSerializer
):

    expediteur_nom = serializers.SerializerMethodField()

    class Meta:

        model = Message

        fields = [
            "id",
            "expediteur",
            "expediteur_nom",
            "destinataire",
            "pme_concernee",
            "contenu",
            "date_envoi",
            "lu",
        ]

        read_only_fields = [
            "id",
            "expediteur",
            "expediteur_nom",
            "destinataire",
            "pme_concernee",
            "date_envoi",
            "lu",
        ]

    def get_expediteur_nom(self, obj):

        if not obj.expediteur:
            return "Utilisateur"

        nom = (
            obj.expediteur
            .get_full_name()
            .strip()
        )

        if nom:
            return nom

        return "Utilisateur"


# ============================================================
# CONSULTANT
# ============================================================

class ConsultantSerializer(
    serializers.ModelSerializer
):

    nom = serializers.SerializerMethodField()

    photo_url = serializers.ImageField(
        source="photo_profil",
        read_only=True,
    )

    class Meta:

        model = User

        fields = [
            "id",
            "first_name",
            "last_name",
            "nom",
            "photo_url",
        ]

    def get_nom(self, obj):

        nom = (
            obj.get_full_name()
            .strip()
        )

        if nom:
            return nom

        return "Consultant"