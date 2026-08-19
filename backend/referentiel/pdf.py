import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
)

from referentiel.services import ScoreCalculator


COULEUR_PRINCIPALE = colors.HexColor("#1F4E78")
COULEUR_CLAIRE = colors.HexColor("#D9E2F3")
SEUIL_POINT_FAIBLE = 1  # une réponse <= 1 (Informelle/Répétable) est considérée comme un point faible


def generer_rapport_pdf(evaluation) -> io.BytesIO:
    """
    Génère le rapport PDF enrichi d'une évaluation :
    en-tête, score global, scores par thème, scores par domaine normatif,
    recommandations pour les points faibles.
    Retourne un buffer BytesIO prêt à être envoyé en réponse HTTP.
    """
    calc = ScoreCalculator(evaluation)
    resultats = calc.calculer_tout()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=2 * cm, bottomMargin=2 * cm,
        leftMargin=2 * cm, rightMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    style_titre = ParagraphStyle(
        "TitrePrincipal", parent=styles["Title"], fontSize=18, textColor=COULEUR_PRINCIPALE,
    )
    style_soustitre = ParagraphStyle(
        "SousTitre", parent=styles["Heading2"], fontSize=13, textColor=COULEUR_PRINCIPALE,
        spaceBefore=16, spaceAfter=8,
    )
    style_normal = styles["Normal"]
    style_recommandation = ParagraphStyle(
        "Recommandation", parent=styles["Normal"], fontSize=10, leftIndent=10, spaceAfter=6,
    )

    elements = []

    # --- En-tête ---
    elements.append(Paragraph("Rapport d'évaluation de maturité cybersécurité", style_titre))
    elements.append(Spacer(1, 0.5 * cm))
    elements.append(Paragraph(f"<b>Entreprise :</b> {evaluation.pme.nom_entreprise}", style_normal))
    elements.append(Paragraph(f"<b>Secteur :</b> {evaluation.pme.secteur or 'Non renseigné'}", style_normal))
    elements.append(Paragraph(f"<b>Référentiel :</b> {evaluation.referentiel.nom} (v{evaluation.referentiel.version})", style_normal))
    date_str = evaluation.date_fin.strftime("%d/%m/%Y") if evaluation.date_fin else evaluation.date_debut.strftime("%d/%m/%Y")
    elements.append(Paragraph(f"<b>Date de l'évaluation :</b> {date_str}", style_normal))
    elements.append(Spacer(1, 0.8 * cm))

    # --- Score global ---
    elements.append(Paragraph("Score global", style_soustitre))
    score_total = resultats["score_total"]
    score_max = resultats["score_maximum"]
    maturite = resultats["maturite"]
    pourcentage_global = round((score_total / score_max) * 100, 1) if score_max else 0

    data_score = [
        ["Score obtenu", f"{score_total} / {score_max} ({pourcentage_global}%)"],
        ["Niveau de maturité", f"Niveau {maturite['niveau']} — {maturite['libelle']}"],
    ]
    table_score = Table(data_score, colWidths=[6 * cm, 10 * cm])
    table_score.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), COULEUR_CLAIRE),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(table_score)
    elements.append(Spacer(1, 0.8 * cm))

    # --- Scores par thème ---
    elements.append(Paragraph("Scores par thème", style_soustitre))
    data_themes = [["Thème", "Score", "%"]]
    for t in resultats["scores_par_theme"]:
        data_themes.append([t["theme_nom"], f"{t['score']} / {t['score_max']}", f"{t['pourcentage']}%"])

    table_themes = Table(data_themes, colWidths=[10 * cm, 3.5 * cm, 2.5 * cm])
    table_themes.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), COULEUR_PRINCIPALE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, COULEUR_CLAIRE]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    elements.append(table_themes)
    elements.append(Spacer(1, 0.8 * cm))

    # --- Scores par domaine normatif ---
    elements.append(Paragraph("Scores par domaine normatif", style_soustitre))
    noms_domaines = {"ISO_27001": "ISO/IEC 27001", "NIST_CSF": "NIST CSF", "LOI_09_08": "Loi 09-08"}
    data_domaines = [["Domaine", "Score", "%"]]
    for code, d in resultats["scores_par_domaine"].items():
        if d["score_max"] > 0:
            data_domaines.append([noms_domaines.get(code, code), f"{d['score']} / {d['score_max']}", f"{d['pourcentage']}%"])

    table_domaines = Table(data_domaines, colWidths=[10 * cm, 3.5 * cm, 2.5 * cm])
    table_domaines.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), COULEUR_PRINCIPALE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, COULEUR_CLAIRE]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    elements.append(table_domaines)
    elements.append(PageBreak())

    # --- Recommandations ---
    elements.append(Paragraph("Recommandations prioritaires", style_soustitre))
    elements.append(Paragraph(
        "Les recommandations ci-dessous concernent les points identifiés comme "
        "faibles (niveau de maturité 1 ou 2) lors de l'évaluation.",
        style_normal,
    ))
    elements.append(Spacer(1, 0.4 * cm))

    reponses_faibles = (
        evaluation.reponses
        .select_related("question", "question__theme", "choix")
        .filter(choix__valeur__lte=SEUIL_POINT_FAIBLE)
        .order_by("question__theme__ordre", "question__ordre")
    )

    if not reponses_faibles.exists():
        elements.append(Paragraph(
            "Aucun point faible majeur identifié — bravo, la maturité est globalement satisfaisante.",
            style_normal,
        ))
    else:
        theme_courant = None
        for reponse in reponses_faibles:
            theme = reponse.question.theme
            if theme.id != theme_courant:
                elements.append(Spacer(1, 0.3 * cm))
                elements.append(Paragraph(f"<b>{theme.nom}</b>", style_normal))
                theme_courant = theme.id

            recommandation = reponse.question.recommandation or "Point à examiner avec un consultant."
            texte = (
                f"• <b>Q{reponse.question.numero}</b> — {reponse.question.texte}<br/>"
                f"<i>Recommandation :</i> {recommandation}"
            )
            elements.append(Paragraph(texte, style_recommandation))

    doc.build(elements)
    buffer.seek(0)
    return buffer