from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, PME, ConfigurationSeuils, ConsultantPME, FAQEntry


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Étend l'admin User par défaut pour afficher/filtrer le champ role."""
    list_display = ["username", "email", "role", "is_staff", "is_superuser"]
    list_filter = ["role", "is_staff", "is_superuser"]
    fieldsets = UserAdmin.fieldsets + (
        ("Rôle (RBAC)", {"fields": ("role",)}),
    )


@admin.register(PME)
class PMEAdmin(admin.ModelAdmin):
    list_display = ["nom_entreprise", "secteur", "utilisateur", "date_creation"]
    search_fields = ["nom_entreprise"]


@admin.register(ConfigurationSeuils)
class ConfigurationSeuilsAdmin(admin.ModelAdmin):
    list_display = ["seuil_critique", "seuil_intermediaire", "date_modification"]


@admin.register(ConsultantPME)
class ConsultantPMEAdmin(admin.ModelAdmin):
    list_display = ["consultant", "pme", "date_assignation"]

@admin.register(FAQEntry)
class FAQEntryAdmin(admin.ModelAdmin):
    list_display = ["titre", "mots_cles"]
    search_fields = ["titre", "mots_cles"]	