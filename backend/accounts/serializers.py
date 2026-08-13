from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, PME


class InscriptionSerializer(serializers.Serializer):
    """Validation des données à l'inscription d'une PME."""
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8)
    nom_entreprise = serializers.CharField(max_length=200)
    secteur = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Un compte existe déjà avec cet email.")
        return value


class ConnexionSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class PMESerializer(serializers.ModelSerializer):
    class Meta:
        model = PME
        fields = ["id", "nom_entreprise", "secteur"]