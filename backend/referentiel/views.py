from django.shortcuts import get_object_or_404
from django.http import FileResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

from referentiel.models import Referentiel, Question, ChoixReponse, Evaluation, Reponse
from referentiel.serializers import (
    ReferentielSerializer,
    EvaluationSerializer,
    SoumissionReponsesSerializer,
)
from referentiel.services import ScoreCalculator
from referentiel.pdf import generer_rapport_pdf
from accounts.permissions import IsPME


# ---------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def questionnaire_actif(request):
    """Retourne le référentiel actif complet (thèmes, questions, choix) pour affichage du questionnaire."""
    referentiel = Referentiel.objects.filter(actif=True).prefetch_related(
        "themes__questions__choix"
    ).first()

    if referentiel is None:
        return Response({"detail": "Aucun référentiel actif."}, status=status.HTTP_404_NOT_FOUND)

    serializer = ReferentielSerializer(referentiel)
    return Response(serializer.data)


# ---------------------------------------------------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsPME])
def demarrer_evaluation(request):
    """Crée une nouvelle évaluation EN_COURS pour la PME connectée, sur le référentiel actif."""
    pme = getattr(request.user, "pme", None)
    if pme is None:
        return Response({"detail": "Aucun profil PME associé à ce compte."}, status=status.HTTP_400_BAD_REQUEST)

    referentiel = Referentiel.objects.filter(actif=True).first()
    if referentiel is None:
        return Response({"detail": "Aucun référentiel actif."}, status=status.HTTP_404_NOT_FOUND)

    evaluation = Evaluation.objects.create(pme=pme, referentiel=referentiel)
    serializer = EvaluationSerializer(evaluation)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsPME])
def soumettre_reponses(request, evaluation_id):
    """
    Enregistre une ou plusieurs réponses pour une évaluation EN_COURS,
    puis calcule et sauvegarde le score si toutes les questions ont une réponse.
    """
    evaluation = get_object_or_404(Evaluation, id=evaluation_id)

    if evaluation.pme != getattr(request.user, "pme", None):
        return Response({"detail": "Accès refusé."}, status=status.HTTP_403_FORBIDDEN)

    if evaluation.statut == Evaluation.STATUT_TERMINEE:
        return Response({"detail": "Cette évaluation est déjà terminée."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = SoumissionReponsesSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        for item in serializer.validated_data["reponses"]:
            question = get_object_or_404(Question, id=item["question_id"])
            choix = get_object_or_404(ChoixReponse, id=item["choix_id"], question=question)

            Reponse.objects.update_or_create(
                evaluation=evaluation,
                question=question,
                defaults={"choix": choix},
            )

    total_questions = Question.objects.count()
    nb_reponses = evaluation.reponses.count()

    resultat = {"nb_reponses": nb_reponses, "total_questions": total_questions, "termine": False}

    if nb_reponses >= total_questions:
        calc = ScoreCalculator(evaluation)
        resultats_score = calc.finaliser_evaluation()
        resultat["termine"] = True
        resultat["resultats"] = resultats_score

    return Response(resultat, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def resultats_evaluation(request, evaluation_id):
    """Retourne les résultats détaillés (score total, par thème, par domaine, maturité) d'une évaluation."""
    evaluation = get_object_or_404(Evaluation, id=evaluation_id)

    if request.user.role == "PME" and evaluation.pme != getattr(request.user, "pme", None):
        return Response({"detail": "Accès refusé."}, status=status.HTTP_403_FORBIDDEN)

    calc = ScoreCalculator(evaluation)
    resultats = calc.calculer_tout()
    return Response(resultats)


# ---------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def telecharger_rapport_pdf(request, evaluation_id):
    """Génère et retourne le rapport PDF d'une évaluation terminée."""
    evaluation = get_object_or_404(Evaluation, id=evaluation_id)

    if request.user.role == "PME" and evaluation.pme != getattr(request.user, "pme", None):
        return Response({"detail": "Accès refusé."}, status=status.HTTP_403_FORBIDDEN)

    if evaluation.statut != Evaluation.STATUT_TERMINEE:
        return Response({"detail": "L'évaluation doit être terminée pour générer le rapport."}, status=status.HTTP_400_BAD_REQUEST)

    buffer = generer_rapport_pdf(evaluation)
    filename = f"rapport_audit_{evaluation.pme.nom_entreprise}_{evaluation.id}.pdf".replace(" ", "_")

    return FileResponse(buffer, as_attachment=True, filename=filename)
