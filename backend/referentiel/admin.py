from django.contrib import admin
from .models import Referentiel, Theme, Question, ChoixReponse, Evaluation, Reponse


class ChoixReponseInline(admin.TabularInline):
	model = ChoixReponse
	extra = 0
	ordering = ("valeur",)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
	list_display = ["numero", "texte_court", "theme", "ordre"]
	list_filter = ["theme__referentiel", "theme"]
	search_fields = ["texte", "recommandation", "ref_iso27001", "ref_nist", "ref_loi0908"]
	list_editable = ["ordre"]
	inlines = [ChoixReponseInline]

	@admin.display(description="Question")
	def texte_court(self, obj):
		return obj.texte[:90]


@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
	list_display = ["code", "nom", "referentiel", "ordre"]
	list_filter = ["referentiel"]
	search_fields = ["code", "nom", "description"]
	list_editable = ["ordre"]


@admin.register(Referentiel)
class ReferentielAdmin(admin.ModelAdmin):
	list_display = ["nom", "version", "score_maximum", "actif", "date_creation"]
	list_filter = ["actif"]
	search_fields = ["nom", "version", "description"]


@admin.register(ChoixReponse)
class ChoixReponseAdmin(admin.ModelAdmin):
	list_display = ["question", "valeur", "libelle_niveau"]
	list_filter = ["valeur", "question__theme"]
	search_fields = ["question__texte", "libelle_niveau", "texte"]


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
	list_display = ["pme", "referentiel", "statut", "score_total", "date_debut", "date_fin"]
	list_filter = ["statut", "referentiel"]
	search_fields = ["pme__nom_entreprise", "pme__utilisateur__email"]


@admin.register(Reponse)
class ReponseAdmin(admin.ModelAdmin):
	list_display = ["evaluation", "question", "choix", "date_reponse"]
	list_filter = ["choix__valeur"]
	search_fields = ["evaluation__pme__nom_entreprise", "question__texte"]
