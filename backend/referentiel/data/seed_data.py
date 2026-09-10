# referentiel/data/seed_data.py - Version avec numérotation continue

REFERENTIEL = {
    "nom": "Référentiel enrichi d'évaluation de maturité cybersécurité PME",
    "version": "1.0",
    "description": "Référentiel basé sur ISO/IEC 27001:2022, NIST CSF v1.1 et Loi 09-08, enrichi à partir du Guide CMRPI/AUSIM.",
    "score_maximum": 116,
    "themes": [
        # ============================================================
        # THEME 1 : Gouvernance, Politique et RH (Questions 1 à 7)
        # ============================================================
        {
            "code": "THEME_1",
            "nom": "Gouvernance, Politique et RH",
            "description": "Direction formelle, objectifs mesurables, gestion des risques, sensibilisation, classification des données, gestion des fournisseurs",
            "ordre": 1,
            "questions": [
                {
                    "numero": 1,
                    "texte": "Votre entreprise dispose-t-elle d'une politique formelle de sécurité informatique ?",
                    "ref_iso27001": "A.5.1.1",
                    "ref_nist": "ID.GV-1",
                    "ref_loi0908": "Art. 4",
                    "recommandation": "Établir une politique de sécurité conforme à l'ISO 27001 (A.5.1.1)",
                    "ordre": 1,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, il n'existe pas de politique écrite"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, mais elle est informelle (discussions occasionnelles, pas de document officiel)"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, une politique écrite existe et couvre les règles principales"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, la politique est formelle, mise à jour annuellement avec métriques de suivi"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, politique formalisée, audit régulier, amélioration continue, communiquée et acceptée par tous"},
                    ]
                },
                {
                    "numero": 2,
                    "texte": "Avez-vous désigné un responsable de la sécurité informatique (DSI, responsable IT) ?",
                    "ref_iso27001": "A.5.1.2",
                    "ref_nist": "ID.GV-4",
                    "ref_loi0908": "",
                    "recommandation": "Désigner un RSSI et définir ses responsabilités (ISO 27001 A.5.1.2)",
                    "ordre": 2,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, personne n'est responsable"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, mais c'est une tâche parmi beaucoup d'autres, sans dédicace"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, une personne ou équipe est clairement responsable de la sécurité"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, le responsable a une autorité claire, des objectifs mesurables et fait rapports réguliers à la direction"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, responsable avec autorité stratégique, tableau de bord de performance, accès direct à la direction générale"},
                    ]
                },
                {
                    "numero": 3,
                    "texte": "Avez-vous réalisé une analyse/gestion formelle des risques cybersécurité ?",
                    "ref_iso27001": "A.6.1.2",
                    "ref_nist": "ID.RA-3",
                    "ref_loi0908": "",
                    "recommandation": "Réaliser une analyse des risques selon ISO 27005 et NIST ID.RA-3",
                    "ordre": 3,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, pas d'analyse"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, occasionnellement et sans méthode structurée"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, une analyse est réalisée annuellement avec une méthodologie simple"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, analyse régulière, documentée, avec plan d'action et suivi quantitatif des risques"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, analyse continue, intégrée aux projets, réajustée selon l'évolution de la menace"},
                    ]
                },
                {
                    "numero": 4,
                    "texte": "Vos employés reçoivent-ils une formation/sensibilisation à la cybersécurité ?",
                    "ref_iso27001": "A.6.3.1",
                    "ref_nist": "PR.AT-1",
                    "ref_loi0908": "",
                    "recommandation": "Mettre en place un plan de sensibilisation annuel (NIST PR.AT-1)",
                    "ordre": 4,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, aucune formation"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, occasionnellement (ex. une fois par an, informelle)"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, une formation annuelle formelle est dispensée à tous les nouveaux et aux employés existants"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, plan de formation régulier (semestriel), adapté par rôle, avec évaluation des compétences"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, programme continu d'apprentissage, simulation de phishing, certification, mesure du comportement"},
                    ]
                },
                {
                    "numero": 5,
                    "texte": "En cas de départ d'un employé, avez-vous une procédure pour révoquer ses accès ?",
                    "ref_iso27001": "A.9.2.6",
                    "ref_nist": "PR.AC-4",
                    "ref_loi0908": "Art. 24",
                    "recommandation": "Formaliser une procédure de révocation des accès (NIST PR.AC-4)",
                    "ordre": 5,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, l'employé garde ses accès"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, mais de manière informelle et tardive"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, une procédure formelle existe pour révoquer les accès rapidement"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, procédure stricte : accès révoqués avant départ, équipements collectés, audit d'accès"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, procédure automatisée, exit interview, audit complet, documentation, suivi 6 mois"},
                    ]
                },
                {
                    "numero": 6,
                    "texte": "Une classification des données (publique, interne, confidentielle, restreinte) est-elle définie et appliquée ?",
                    "ref_iso27001": "A.8.2.1",
                    "ref_nist": "ID.AM-5",
                    "ref_loi0908": "Art. 23",
                    "recommandation": "Définir et appliquer une classification des données (ISO 27001 A.8.2.1)",
                    "ordre": 6,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, aucune classification"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Classification informelle, non documentée"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Classification définie pour les données les plus sensibles"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Classification formelle pour toutes les données, avec procédure"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Classification intégrée aux processus métier, auditée et révisée annuellement"},
                    ]
                },
                {
                    "numero": 7,
                    "texte": "Des exigences de sécurité sont-elles définies et imposées aux fournisseurs et sous-traitants ?",
                    "ref_iso27001": "A.15.1.1",
                    "ref_nist": "ID.SC-4",
                    "ref_loi0908": "Art. 36",
                    "recommandation": "Inclure des clauses de sécurité dans les contrats (Loi 09-08 Art. 36)",
                    "ordre": 7,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, aucune exigence"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Exigences basiques, non contractualisées"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Exigences définies dans les contrats (confidentialité, conformité)"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Exigences détaillées, audits réguliers des fournisseurs"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Gestion complète du cycle de vie des fournisseurs, audits annuels, KPIs sécurité"},
                    ]
                },
            ]
        },
        # ============================================================
        # THEME 2 : Gestion des Accès et Authentification (Questions 8 à 14)
        # ============================================================
        {
            "code": "THEME_2",
            "nom": "Gestion des Accès et Authentification",
            "description": "Contrôle des connexions, identification/authentification, gestion des droits, comptes privilégiés, authentification forte",
            "ordre": 2,
            "questions": [
                {
                    "numero": 8,
                    "texte": "Comment contrôlez-vous l'accès au système informatique (bureau, serveur) ?",
                    "ref_iso27001": "A.9.1.2",
                    "ref_nist": "PR.AC-1",
                    "ref_loi0908": "",
                    "recommandation": "Implémenter un contrôle d'accès basé sur les rôles (RBAC)",
                    "ordre": 1,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Pas de contrôle formel ; n'importe qui peut accéder"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Accès basique par mot de passe simple, peu de différenciation des droits"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Identifiants et mots de passe exigés ; les droits varient selon le rôle"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Contrôle d'accès strict : authentification forte, audit des connexions, révision régulière des droits"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Contrôle avancé : MFA, SSO, audit en temps réel, intelligence comportementale, révocation automatique"},
                    ]
                },
                {
                    "numero": 9,
                    "texte": "Avez-vous des règles formelles sur les mots de passe ?",
                    "ref_iso27001": "A.9.4.3",
                    "ref_nist": "PR.AC-7",
                    "ref_loi0908": "Art. 23",
                    "recommandation": "Appliquer une politique de mots de passe forte (complexité, rotation, MFA)",
                    "ordre": 2,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, pas de règles"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, règles simples (ex. changer tous les 6 mois)"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, règles formelles (longueur, complexité, changement périodique)"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, politiques strictes (MFA, audit des changements, pas de partage, gestionnaire de mots de passe)"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, politique avancée avec contrôle de compromission, rotation automatique, audit continu"},
                    ]
                },
                {
                    "numero": 10,
                    "texte": "Disposez-vous de journaux d'accès (logs) enregistrant qui accède à quoi et quand ?",
                    "ref_iso27001": "A.12.4.1",
                    "ref_nist": "DE.AE-3",
                    "ref_loi0908": "Art. 10",
                    "recommandation": "Mettre en place un système de journalisation centralisé (SIEM)",
                    "ordre": 3,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, mais limité ; seules certaines accès sont enregistrées"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, journaux complets mais peu analysés"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, journaux détaillés, examinés régulièrement, centralisés et conservés (6 mois minimum)"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, journaux analysés en temps réel via SIEM, alertes automatiques, conservation longue durée"},
                    ]
                },
                {
                    "numero": 11,
                    "texte": "Les accès administrateur (IT) sont-ils séparés des comptes utilisateur normaux ?",
                    "ref_iso27001": "A.9.2.3",
                    "ref_nist": "PR.AC-4",
                    "ref_loi0908": "",
                    "recommandation": "Séparer les comptes administrateur et utilisateur (least privilege)",
                    "ordre": 4,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, les administrateurs utilisent des comptes avec tous les droits au quotidien"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Partiellement ; quelques comptes séparés mais pratique incohérente"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, comptes administrateur séparés, utilisés uniquement pour tâches administratives"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, stricte séparation, audit des actions admin, authentification multifacteur pour l'admin"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, privilèges minimaux (least privilege), JIT access, enregistrement vidéo des sessions admin"},
                    ]
                },
                {
                    "numero": 12,
                    "texte": "Avez-vous un inventaire documenté de tous les comptes et des droits associés ?",
                    "ref_iso27001": "A.9.1.1",
                    "ref_nist": "ID.AM-2",
                    "ref_loi0908": "",
                    "recommandation": "Créer et maintenir un inventaire des comptes et droits",
                    "ordre": 5,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, mais incomplet et rarement mis à jour"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, inventaire maintenu et revu annuellement"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, inventaire précis, mis à jour régulièrement, audité annuellement pour éviter les accès orphelins"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, inventaire temps réel, automatisé, audit continu, recertification régulière"},
                    ]
                },
                {
                    "numero": 13,
                    "texte": "Existe-t-il une procédure spécifique pour la création, l'utilisation et la révocation des comptes privilégiés ?",
                    "ref_iso27001": "A.9.2.3",
                    "ref_nist": "PR.AC-4",
                    "ref_loi0908": "",
                    "recommandation": "Mettre en place une procédure stricte pour les comptes privilégiés",
                    "ordre": 6,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, pas de procédure spécifique"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Procédure informelle, non documentée"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Procédure documentée, approbation requise pour les accès privilégiés"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Procédure stricte, traçabilité des actions, revue trimestrielle"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Gestion automatisée, JIT (Just-In-Time) access, enregistrement des sessions"},
                    ]
                },
                {
                    "numero": 14,
                    "texte": "L'accès à distance au système d'information est-il protégé par une authentification forte (MFA) ?",
                    "ref_iso27001": "A.9.4.2",
                    "ref_nist": "PR.AC-7",
                    "ref_loi0908": "",
                    "recommandation": "Imposer l'authentification multifacteur pour tous les accès distants",
                    "ordre": 7,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Accès distant sans authentification ou simple mot de passe"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Accès distant possible, mais MFA non obligatoire"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "MFA recommandé mais pas systématique"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "MFA obligatoire pour tous les accès distants"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "MFA obligatoire, biométrie incluse, avec surveillance et analyse comportementale"},
                    ]
                },
            ]
        },
        # ============================================================
        # THEME 3 : Sécurité Physique et Infrastructure (Questions 15 à 22)
        # ============================================================
        {
            "code": "THEME_3",
            "nom": "Sécurité Physique et Infrastructure",
            "description": "Protection des locaux, standardisation du SI, interconnexions sécurisées, gestion des vulnérabilités, supports amovibles, sécurité du développement",
            "ordre": 3,
            "questions": [
                {
                    "numero": 15,
                    "texte": "Comment protégez-vous physiquement vos serveurs et équipements critiques ?",
                    "ref_iso27001": "A.11.1.1",
                    "ref_nist": "PR.PT-1",
                    "ref_loi0908": "",
                    "recommandation": "Sécuriser l'accès aux serveurs (badge, vidéo, HVAC)",
                    "ordre": 1,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Pas de protection spéciale ; équipements accessibles à tous"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Accès limité mais pas de contrôle formel (porte fermée, pas de badge)"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Accès réservé au personnel IT ; entrée contrôlée (clé/badge)"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Accès strictement réglementé ; salle climatisée, surveillance, audit des entrées"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Infrastructure sécurisée : cage HVAC, détection de mouvement, biométrie, audit complet"},
                    ]
                },
                {
                    "numero": 16,
                    "texte": "Avez-vous des mesures contre les menaces physiques/environnementales (vol, incendie, dégât d'eau) ?",
                    "ref_iso27001": "A.11.1.4",
                    "ref_nist": "PR.PT-2",
                    "ref_loi0908": "",
                    "recommandation": "Mettre en place des mesures de protection environnementale (détection incendie, onduleur/UPS, sauvegarde externalisée) — ISO 27001 A.11.1.4, NIST PR.PT-2",
                    "ordre": 2,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non ou très limitées"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, basiques (ex. extincteur, assurance)"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, mesures en place (alarme, vidéosurveillance, électricité de secours)"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, plan complet : détection incendie, redondance électrique, sauvegarde externalisée, audit régulier"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, infrastructure résiliente : UPS, générateur, géolocalisation, assurance, test régulier du plan"},
                    ]
                },
                {
                    "numero": 17,
                    "texte": "Vos systèmes informatiques sont-ils standardisés et maintenus de façon cohérente ?",
                    "ref_iso27001": "A.12.1.2",
                    "ref_nist": "PR.IP-1",
                    "ref_loi0908": "",
                    "recommandation": "Standardiser les systèmes et appliquer les patches (NIST PR.IP-1)",
                    "ordre": 3,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non ; chaque département a ses propres systèmes et versions"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Partiellement ; certains systèmes sont identiques, d'autres non"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, la plupart des systèmes suivent des standards ; mises à jour régulières"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, standardisation stricte, patch management formalisé, inventaire d'équipements à jour"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, architecture unifiée, déploiement automatisé, patch appliqué en moins de 30 jours"},
                    ]
                },
                {
                    "numero": 18,
                    "texte": "Comment gérez-vous l'accès à Internet et aux réseaux externes ?",
                    "ref_iso27001": "A.13.1.1",
                    "ref_nist": "PR.DS-5",
                    "ref_loi0908": "",
                    "recommandation": "Mettre en place pare-feu, VPN et segmentation réseau",
                    "ordre": 4,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Accès libre et sans restrictions"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Accès limité mais pas de pare-feu formel"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Pare-feu en place ; contrôle d'accès basique (proxy, filtrage)"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Infrastructures sécurisées : pare-feu, VPN, segmentation réseau, monitoring régulier"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Architecture zéro-trust : segmentation stricte, filtrage avancé, analytics réseau, IPS/IDS"},
                    ]
                },
                {
                    "numero": 19,
                    "texte": "Vos prestataires informatiques/sous-traitants sont-ils encadrés contractuellement ?",
                    "ref_iso27001": "A.15.1.1",
                    "ref_nist": "ID.SC-2",
                    "ref_loi0908": "Art. 36",
                    "recommandation": "Inclure des clauses de sécurité dans les contrats (Loi 09-08 Art. 36)",
                    "ordre": 5,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, pas de clauses spécifiques de sécurité"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, mais clauses légères"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, contrats incluant obligations de sécurité, audit et confidentialité"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, contrats détaillés avec clauses SSI strictes, audit régulier, pénalités en cas de manquement"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, contrats complets avec audit annuel, KPIs de sécurité, droit d'audit à la demande"},
                    ]
                },
                {
                    "numero": 20,
                    "texte": "Existe-t-il un processus formalisé de gestion des vulnérabilités (détection, analyse, correction) ?",
                    "ref_iso27001": "A.12.6.1",
                    "ref_nist": "ID.RA-1",
                    "ref_loi0908": "",
                    "recommandation": "Mettre en place un processus de gestion des vulnérabilités (NIST ID.RA-1)",
                    "ordre": 6,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, pas de processus"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Détection ponctuelle des vulnérabilités"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Processus documenté, analyse et correction des vulnérabilités connues"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Processus formalisé, analyse de vulnérabilité régulière, plan de correction"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Processus automatisé, analyse continue, correction en moins de 30 jours"},
                    ]
                },
                {
                    "numero": 21,
                    "texte": "L'utilisation des supports amovibles (USB, disques externes, etc.) est-elle contrôlée et sécurisée ?",
                    "ref_iso27001": "A.8.3.1",
                    "ref_nist": "PR.DS-2",
                    "ref_loi0908": "Art. 23",
                    "recommandation": "Contrôler l'usage des supports amovibles (chiffrement, antivirus)",
                    "ordre": 7,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Utilisation libre et sans restriction"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Restrictions informelles recommandées"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Politique documentée, contrôle d'usage"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Politique stricte, chiffrement obligatoire, antivirus systématique"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Gestion automatisée, blocage des supports non autorisés, audit d'utilisation"},
                    ]
                },
                {
                    "numero": 22,
                    "texte": "La sécurité est-elle intégrée dans le cycle de développement des applications (sécurité dès la conception) ?",
                    "ref_iso27001": "A.8.25",
                    "ref_nist": "PR.IP-2",
                    "ref_loi0908": "",
                    "recommandation": "Adopter une approche DevSecOps (ISO 27001 A.8.25)",
                    "ordre": 8,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Pas de prise en compte de la sécurité dans le développement"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Considérations de sécurité occasionnelles"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Sécurité intégrée dans certaines phases du cycle de développement"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Sécurité intégrée à toutes les phases (analyse, conception, codage, test, déploiement)"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "DevSecOps complet, automatisation des tests de sécurité, formation continue des développeurs"},
                    ]
                },
            ]
        },
        # ============================================================
        # THEME 4 : Incidents, Continuité et Conformité (Questions 23 à 29)
        # ============================================================
        {
            "code": "THEME_4",
            "nom": "Incidents, Continuité et Conformité",
            "description": "Gestion des crises, plan de continuité, documentation, conservation des données, notification des violations, PIA",
            "ordre": 4,
            "questions": [
                {
                    "numero": 23,
                    "texte": "Avez-vous une procédure formalisée pour signaler et gérer les incidents de sécurité ?",
                    "ref_iso27001": "A.16.1.1",
                    "ref_nist": "RS.CO-2",
                    "ref_loi0908": "Art. 39",
                    "recommandation": "Définir une procédure de gestion des incidents (ISO 27001 A.16.1.1)",
                    "ordre": 1,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, pas de procédure"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, mais informelle ; chacun agit à sa façon"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, une procédure existe : signalement, classification, action corrective"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, procédure formalisée : qui appeler, comment documenter, qui décide, suivi post-incident"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, process complet : CSIRT, escalade automatique, notification régulée, lessons learned, KPIs"},
                    ]
                },
                {
                    "numero": 24,
                    "texte": "Avez-vous un plan de continuité d'activité en cas de crise informatique ?",
                    "ref_iso27001": "A.17.1.1",
                    "ref_nist": "RC.RP-1",
                    "ref_loi0908": "",
                    "recommandation": "Élaborer un PCA/PRA avec RTO et RPO définis",
                    "ordre": 2,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, mais basique et non testé"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, plan écrit avec procédures de sauvegarde/récupération et test annuel"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, plan complet avec objectifs RTO/RPO, tests réguliers (semestriel), mise à jour"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, plan robuste : test continu, plan de secours géographique, assurance, amélioration continue"},
                    ]
                },
                {
                    "numero": 25,
                    "texte": "Avez-vous des sauvegardes régulières de vos données critiques ?",
                    "ref_iso27001": "A.12.3.1",
                    "ref_nist": "PR.IP-4",
                    "ref_loi0908": "Art. 23",
                    "recommandation": "Mettre en place une stratégie de sauvegarde 3-2-1",
                    "ordre": 3,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, pas de sauvegardes régulières"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, occasionnelles et non testées"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, sauvegardes régulières (quotidiennes/hebdomadaires) et testées annuellement"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, sauvegardes automatisées, externalisées, testées régulièrement, décentralisées"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, sauvegarde 3-2-1 (3 copies, 2 médias, 1 hors site), chiffrement, restauration validée"},
                    ]
                },
                {
                    "numero": 26,
                    "texte": "Documentez-vous votre infrastructure informatique et vos processus de sécurité ?",
                    "ref_iso27001": "A.12.1.1",
                    "ref_nist": "ID.GV-3",
                    "ref_loi0908": "",
                    "recommandation": "Documenter l'infrastructure et les processus (ISO 27001 A.12.1.1)",
                    "ordre": 4,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, peu ou pas de documentation"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, mais informelle et peu à jour"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, documentation écrite couvrant les principaux systèmes et processus"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, documentation complète, centralisée, mise à jour régulièrement, accessible à l'équipe"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, documentation exhaustive, versionnée, audit d'accès, wiki sécurité, formation obligatoire"},
                    ]
                },
                {
                    "numero": 27,
                    "texte": "Votre entreprise respecte-t-elle les obligations légales et réglementaires en matière de données ?",
                    "ref_iso27001": "A.18.1.1",
                    "ref_nist": "ID.GV-2",
                    "ref_loi0908": "Art. 5-10",
                    "recommandation": "Se mettre en conformité avec la loi 09-08 (Loi 09-08 Art. 5-10)",
                    "ordre": 5,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, pas de mesures formelles"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Oui, connaissance basique de la loi 09-08 mais peu de mise en œuvre"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Oui, mesures en place pour respecter la loi 09-08 (durée de conservation, droits d'accès)"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Oui, conformité complète avec audit régulier, registre des traitements, contrats de clauses"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Oui, conformité avancée : audit annuel, DPO nommé, impact assessment, notification incidents légale"},
                    ]
                },
                {
                    "numero": 28,
                    "texte": "Existe-t-il une procédure de notification des violations de données à l'autorité de contrôle (CNDP) et aux personnes concernées ?",
                    "ref_iso27001": "A.16.1.4",
                    "ref_nist": "RS.CO-5",
                    "ref_loi0908": "Art. 39-40",
                    "recommandation": "Mettre en place une procédure de notification des violations (72h)",
                    "ordre": 6,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, pas de procédure"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Connaissance de l'obligation, pas de procédure formalisée"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "Procédure documentée, mais peu pratiquée"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "Procédure formalisée avec délais définis (72h)"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "Procédure automatisée, tests réguliers, coordination avec les autorités"},
                    ]
                },
                {
                    "numero": 29,
                    "texte": "Des évaluations d'impact sur la protection des données (PIA) sont-elles réalisées pour les traitements sensibles ?",
                    "ref_iso27001": "",
                    "ref_nist": "ID.RA-2",
                    "ref_loi0908": "Art. 12",
                    "recommandation": "Réaliser des évaluations d'impact pour les traitements sensibles (Loi 09-08 Art. 12)",
                    "ordre": 7,
                    "choix": [
                        {"valeur": 0, "libelle_niveau": "Niveau 1 — Informelle", "texte": "Non, pas de PIA réalisée"},
                        {"valeur": 1, "libelle_niveau": "Niveau 2 — Répétable", "texte": "Connaissance du concept, pas de mise en œuvre"},
                        {"valeur": 2, "libelle_niveau": "Niveau 3 — Défini", "texte": "PIA réalisée pour certains traitements sensibles"},
                        {"valeur": 3, "libelle_niveau": "Niveau 4 — Contrôlé", "texte": "PIA systématique pour tous les nouveaux traitements de données"},
                        {"valeur": 4, "libelle_niveau": "Niveau 5 — Optimisé", "texte": "PIA intégrée au cycle de vie des projets, réévaluation régulière"},
                    ]
                },
            ]
        },
    ]
}