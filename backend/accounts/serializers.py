from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, PME, DemandeAccompagnement, Message


class InscriptionSerializer(serializers.Serializer):
    """Validation des données à l'inscription (PME ou Consultant)."""
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8)
    role = serializers.CharField(required=False, default="PME")
    
    # Champs spécifiques PME
    nom_entreprise = serializers.CharField(max_length=200, required=False, allow_blank=True)
    secteur = serializers.CharField(max_length=150, required=False, allow_blank=True)
    
    # Champs spécifiques Consultant
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Un compte existe déjà avec cet email.")
        return value

    def validate(self, attrs):
        from django.contrib.auth.password_validation import validate_password
        validate_password(attrs["password"])
        
        role = attrs.get("role", "PME")
        if role == "PME" and not attrs.get("nom_entreprise"):
            raise serializers.ValidationError({"nom_entreprise": "Ce champ est obligatoire pour une PME."})
        if role == "CONSULTANT" and (not attrs.get("first_name") or not attrs.get("last_name")):
            raise serializers.ValidationError({"detail": "Le prénom et le nom sont obligatoires pour un consultant."})
            
        return attrs


class ConnexionSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class PMESerializer(serializers.ModelSerializer):
    photo_url = serializers.ImageField(source="photo_profil", read_only=True)
    class Meta:
        model = PME
        fields = ["id", "nom_entreprise", "secteur", "photo_url"]


class DemandeAccompagnementSerializer(serializers.ModelSerializer):
    pme_nom = serializers.CharField(source="pme.nom_entreprise", read_only=True)
    consultant_nom = serializers.SerializerMethodField()

    class Meta:
        model = DemandeAccompagnement
        fields = ["id", "pme", "pme_nom", "consultant", "consultant_nom", "commentaire", "reponse", "statut", "date_creation", "date_modification"]
        read_only_fields = ["pme", "pme_nom", "consultant_nom", "date_creation", "date_modification"]

    def get_consultant_nom(self, obj):
        return obj.consultant.get_full_name() or obj.consultant.username if obj.consultant else None


class MessageSerializer(serializers.ModelSerializer):
    expediteur_nom = serializers.CharField(source="expediteur.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "expediteur", "expediteur_nom", "destinataire", "pme_concernee", "contenu", "date_envoi", "lu"]
        read_only_fields = ["id", "expediteur", "expediteur_nom", "destinataire", "pme_concernee", "date_envoi", "lu"]


class ConsultantSerializer(serializers.ModelSerializer):
    nom = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "nom"]

    def get_nom(self, obj):
        return obj.get_full_name() or obj.username