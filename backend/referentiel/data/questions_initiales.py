"""Referentiel initial versionne dans le code, sans dependance a Excel."""

REFERENTIEL = {
    "nom": "Référentiel enrichi d'évaluation de maturité cybersécurité PME",
    "version": "1.0",
    "description": "Référentiel basé sur ISO/IEC 27001:2022, NIST CSF v1.1 et Loi 09-08, enrichi à partir du Guide CMRPI/AUSIM.",
    "score_maximum": 116,
}

THEMES = [
    ("THEME_1", "Gouvernance, Politique et RH", "Direction formelle, objectifs mesurables, gestion des risques, sensibilisation, classification des données, gestion des fournisseurs", 1),
    ("THEME_2", "Gestion des Accès et Authentification", "Contrôle des connexions, identification/authentification, gestion des droits, comptes privilégiés, authentification forte", 2),
    ("THEME_3", "Sécurité Physique et Infrastructure", "Protection des locaux, standardisation du SI, interconnexions sécurisées, gestion des vulnérabilités, supports amovibles, sécurité du développement", 3),
    ("THEME_4", "Incidents, Continuité et Conformité", "Gestion des crises, plan de continuité, documentation, conservation des données, notification des violations, PIA", 4),
]

# theme, numero, texte, ISO 27001, NIST, Loi 09-08, recommandation, ordre
QUESTIONS = [
    ("THEME_1", 1, "Votre entreprise dispose-t-elle d'une politique formelle de sécurité informatique ?", "A.5.1.1", "ID.GV-1", "Art. 4", "Établir une politique de sécurité conforme à l'ISO 27001 (A.5.1.1)", 1),
    ("THEME_1", 2, "Avez-vous désigné un responsable de la sécurité informatique (DSI, responsable IT) ?", "A.5.1.2", "ID.GV-4", "", "Désigner un RSSI et définir ses responsabilités (ISO 27001 A.5.1.2)", 2),
    ("THEME_1", 3, "Avez-vous réalisé une analyse/gestion formelle des risques cybersécurité ?", "A.6.1.2", "ID.RA-3", "", "Réaliser une analyse des risques selon ISO 27005 et NIST ID.RA-3", 3),
    ("THEME_1", 4, "Vos employés reçoivent-ils une formation/sensibilisation à la cybersécurité ?", "A.6.3.1", "PR.AT-1", "", "Mettre en place un plan de sensibilisation annuel (NIST PR.AT-1)", 4),
    ("THEME_1", 5, "En cas de départ d'un employé, avez-vous une procédure pour révoquer ses accès ?", "A.9.2.6", "PR.AC-4", "Art. 24", "Formaliser une procédure de révocation des accès (NIST PR.AC-4)", 5),
    ("THEME_1", 21, "Une classification des données (publique, interne, confidentielle, restreinte) est-elle définie et appliquée ?", "A.8.2.1", "ID.AM-5", "Art. 23", "Définir et appliquer une classification des données (ISO 27001 A.8.2.1)", 6),
    ("THEME_1", 22, "Des exigences de sécurité sont-elles définies et imposées aux fournisseurs et sous-traitants ?", "A.15.1.1", "ID.SC-4", "Art. 36", "Inclure des clauses de sécurité dans les contrats (Loi 09-08 Art. 36)", 7),
    ("THEME_2", 6, "Comment contrôlez-vous l'accès au système informatique (bureau, serveur) ?", "A.9.1.2", "PR.AC-1", "", "Implémenter un contrôle d'accès basé sur les rôles (RBAC)", 1),
    ("THEME_2", 7, "Avez-vous des règles formelles sur les mots de passe ?", "A.9.4.3", "PR.AC-7", "Art. 23", "Appliquer une politique de mots de passe forte (complexité, rotation, MFA)", 2),
    ("THEME_2", 8, "Disposez-vous de journaux d'accès (logs) enregistrant qui accède à quoi et quand ?", "A.12.4.1", "DE.AE-3", "Art. 10", "Mettre en place un système de journalisation centralisé (SIEM)", 3),
    ("THEME_2", 9, "Les accès administrateur (IT) sont-ils séparés des comptes utilisateur normaux ?", "A.9.2.3", "PR.AC-4", "", "Séparer les comptes administrateur et utilisateur (least privilege)", 4),
    ("THEME_2", 10, "Avez-vous un inventaire documenté de tous les comptes et des droits associés ?", "A.9.1.1", "ID.AM-2", "", "Créer et maintenir un inventaire des comptes et droits", 5),
    ("THEME_2", 23, "Existe-t-il une procédure spécifique pour la création, l'utilisation et la révocation des comptes privilégiés ?", "A.9.2.3", "PR.AC-4", "", "Mettre en place une procédure stricte pour les comptes privilégiés", 6),
    ("THEME_2", 24, "L'accès à distance au système d'information est-il protégé par une authentification forte (MFA) ?", "A.9.4.2", "PR.AC-7", "", "Imposer l'authentification multifacteur pour tous les accès distants", 7),
    ("THEME_3", 11, "Comment protégez-vous physiquement vos serveurs et équipements critiques ?", "A.11.1.1", "PR.PT-1", "", "Sécuriser l'accès aux serveurs (badge, vidéo, HVAC)", 1),
    ("THEME_3", 12, "Avez-vous des mesures contre les menaces physiques/environnementales (vol, incendie, dégât d'eau) ?", "A.11.1.4", "PR.PT-2", "", "Mettre en place des mesures de protection environnementale (détection incendie, onduleur/UPS, sauvegarde externalisée)", 2),
    ("THEME_3", 13, "Vos systèmes informatiques sont-ils standardisés et maintenus de façon cohérente ?", "A.12.1.2", "PR.IP-1", "", "Standardiser les systèmes et appliquer les patches (NIST PR.IP-1)", 3),
    ("THEME_3", 14, "Comment gérez-vous l'accès à Internet et aux réseaux externes ?", "A.13.1.1", "PR.DS-5", "", "Mettre en place pare-feu, VPN et segmentation réseau", 4),
    ("THEME_3", 15, "Vos prestataires informatiques/sous-traitants sont-ils encadrés contractuellement ?", "A.15.1.1", "ID.SC-2", "Art. 36", "Inclure des clauses de sécurité dans les contrats (Loi 09-08 Art. 36)", 5),
    ("THEME_3", 25, "Existe-t-il un processus formalisé de gestion des vulnérabilités (détection, analyse, correction) ?", "A.12.6.1", "ID.RA-1", "", "Mettre en place un processus de gestion des vulnérabilités (NIST ID.RA-1)", 6),
    ("THEME_3", 26, "L'utilisation des supports amovibles (USB, disques externes, etc.) est-elle contrôlée et sécurisée ?", "A.8.3.1", "PR.DS-2", "Art. 23", "Contrôler l'usage des supports amovibles (chiffrement, antivirus)", 7),
    ("THEME_3", 29, "La sécurité est-elle intégrée dans le cycle de développement des applications (sécurité dès la conception) ?", "A.8.25", "PR.IP-2", "", "Adopter une approche DevSecOps (ISO 27001 A.8.25)", 8),
    ("THEME_4", 16, "Avez-vous une procédure formalisée pour signaler et gérer les incidents de sécurité ?", "A.16.1.1", "RS.CO-2", "Art. 39", "Définir une procédure de gestion des incidents (ISO 27001 A.16.1.1)", 1),
    ("THEME_4", 17, "Avez-vous un plan de continuité d'activité en cas de crise informatique ?", "A.17.1.1", "RC.RP-1", "", "Élaborer un PCA/PRA avec RTO et RPO définis", 2),
    ("THEME_4", 18, "Avez-vous des sauvegardes régulières de vos données critiques ?", "A.12.3.1", "PR.IP-4", "Art. 23", "Mettre en place une stratégie de sauvegarde 3-2-1", 3),
    ("THEME_4", 19, "Documentez-vous votre infrastructure informatique et vos processus de sécurité ?", "A.12.1.1", "ID.GV-3", "", "Documenter l'infrastructure et les processus (ISO 27001 A.12.1.1)", 4),
    ("THEME_4", 20, "Votre entreprise respecte-t-elle les obligations légales et réglementaires en matière de données ?", "A.18.1.1", "ID.GV-2", "Art. 5-10", "Se mettre en conformité avec la loi 09-08 (Loi 09-08 Art. 5-10)", 5),
    ("THEME_4", 27, "Existe-t-il une procédure de notification des violations de données à l'autorité de contrôle (CNDP) et aux personnes concernées ?", "A.16.1.4", "RS.CO-5", "Art. 39-40", "Mettre en place une procédure de notification des violations (72h)", 6),
    ("THEME_4", 28, "Des évaluations d'impact sur la protection des données (PIA) sont-elles réalisées pour les traitements sensibles ?", "", "ID.RA-2", "Art. 12", "Réaliser des évaluations d'impact pour les traitements sensibles (Loi 09-08 Art. 12)", 7),
]

CHOIX_PAR_DEFAUT = [
    (0, "Niveau 1 — Informelle", "Aucune pratique formalisée."),
    (1, "Niveau 2 — Répétable", "Une pratique existe, mais elle reste informelle ou irrégulière."),
    (2, "Niveau 3 — Défini", "Une pratique documentée est appliquée de façon régulière."),
    (3, "Niveau 4 — Contrôlé", "La pratique est mesurée, contrôlée et régulièrement revue."),
    (4, "Niveau 5 — Optimisé", "La pratique est optimisée et améliorée en continu."),
]
