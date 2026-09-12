import React from "react";
import { Link } from "react-router-dom";

import logoCMRPI from "../assets/logo3.webp";

import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">

      {/* ================= NAVBAR ================= */}

      <header className="landing-navbar">

        <div className="landing-logo">
          <img
            src={logoCMRPI}
            alt="Logo CMRPI"
            className="landing-logo-image"
          />
        </div>

        <nav className="landing-nav-links">
          <a href="#accueil">Accueil</a>
          <a href="#problematique">Problématique</a>
          <a href="#plateforme">La plateforme</a>
          <a href="#referentiels">Référentiels</a>
          <a href="#cmrpi">À propos</a>
        </nav>

        <div className="landing-nav-actions">

          <Link
            to="/connexion"
            className="landing-btn landing-btn-outline"
          >
            Se connecter
          </Link>

          <Link
            to="/inscription"
            className="landing-btn landing-btn-primary"
          >
            Créer un compte
          </Link>

        </div>

      </header>


      {/* ================= HERO ================= */}

      <main>

        <section
          id="accueil"
          className="landing-hero"
        >

          <div className="landing-hero-content">

            <span className="landing-badge">
              Cybersécurité des PME
            </span>

            <h1>
              Évaluez et améliorez
              <br />
              la maturité cybersécurité
              <br />
              de votre PME
            </h1>

            <p>
              Une plateforme dédiée à l'évaluation de la maturité
              cybersécurité des PME, permettant d'identifier leurs
              principaux axes d'amélioration et de bénéficier de
              recommandations adaptées.
            </p>

            <div className="landing-hero-actions">

              <Link
                to="/inscription"
                className="landing-btn landing-btn-primary landing-btn-large"
              >
                Commencer l'évaluation
              </Link>

              <a
                href="#plateforme"
                className="landing-btn landing-btn-secondary landing-btn-large"
              >
                Découvrir la plateforme
              </a>

            </div>

          </div>


          <div className="landing-hero-visual">

            <div className="landing-logo-placeholder">

              <img
                src={logoCMRPI}
                alt="Logo CMRPI"
                className="landing-logo-image"
              />

              <small>
                Plateforme d'évaluation cybersécurité
              </small>

            </div>

          </div>

        </section>


        {/* ================= PROBLÉMATIQUE ================= */}

        <section
          id="problematique"
          className="landing-section landing-problematique"
        >

          <div className="landing-section-header">

            <span className="landing-section-label">
              La problématique
            </span>

            <h2>
              Les PME face aux enjeux de cybersécurité
            </h2>

            <p>
              Les PME disposent souvent de moyens et de ressources
              limités pour évaluer leur niveau de cybersécurité.
              Elles peuvent ainsi rencontrer des difficultés à
              identifier leurs faiblesses, à prioriser les actions
              à mettre en place et à savoir par où commencer.
            </p>

          </div>


          <div className="landing-problematique-grid">

            <div className="landing-info-card">

              <div className="landing-card-icon">
                01
              </div>

              <h3>
                Manque de visibilité
              </h3>

              <p>
                Difficulté à déterminer clairement le niveau actuel
                de maturité cybersécurité de l'entreprise.
              </p>

            </div>


            <div className="landing-info-card">

              <div className="landing-card-icon">
                02
              </div>

              <h3>
                Difficulté à prioriser
              </h3>

              <p>
                Les PME peuvent avoir du mal à identifier les
                domaines les plus importants et les actions à
                traiter en priorité.
              </p>

            </div>


            <div className="landing-info-card">

              <div className="landing-card-icon">
                03
              </div>

              <h3>
                Besoin d'accompagnement
              </h3>

              <p>
                L'évaluation doit pouvoir être suivie de
                recommandations et, lorsque cela est nécessaire,
                d'un accompagnement adapté.
              </p>

            </div>

          </div>

        </section>


        {/* ================= PLATEFORME ================= */}

        <section
          id="plateforme"
          className="landing-section"
        >

          <div className="landing-section-header">

            <span className="landing-section-label">
              Notre plateforme
            </span>

            <h2>
              De l'évaluation à l'accompagnement
            </h2>

            <p>
              La plateforme propose un parcours structuré permettant
              à la PME d'évaluer sa maturité, de comprendre ses
              résultats et d'identifier ses axes d'amélioration.
            </p>

          </div>


          <div className="landing-process">

            <div className="landing-process-item">

              <span>01</span>

              <h3>
                Évaluer
              </h3>

              <p>
                Répondre au questionnaire d'évaluation de maturité
                cybersécurité.
              </p>

            </div>


            <div className="landing-process-item">

              <span>02</span>

              <h3>
                Analyser
              </h3>

              <p>
                Obtenir une vision globale du niveau de maturité
                cybersécurité de l'entreprise.
              </p>

            </div>


            <div className="landing-process-item">

              <span>03</span>

              <h3>
                Identifier
              </h3>

              <p>
                Identifier les domaines nécessitant une attention
                particulière et les principaux axes d'amélioration.
              </p>

            </div>


            <div className="landing-process-item">

              <span>04</span>

              <h3>
                Accompagner
              </h3>

              <p>
                Bénéficier d'un accompagnement par un consultant
                spécialisé.
              </p>

            </div>

          </div>

        </section>


        {/* ================= RÉFÉRENTIELS ================= */}

        <section
          id="referentiels"
          className="landing-section landing-referentiels"
        >

          <div className="landing-section-header">

            <span className="landing-section-label">
              Référentiels & guides
            </span>

            <h2>
              Une évaluation basée sur plusieurs références
            </h2>

            <p>
              Le référentiel d'évaluation s'appuie sur plusieurs
              cadres et références en matière de cybersécurité et
              de protection des données.
            </p>

          </div>


          <div className="landing-reference-grid">

            <div className="landing-reference-card">

              <h3>
                ISO/IEC 27001:2022
              </h3>

              <p>
                Cadre de référence pour le management de la sécurité
                de l'information.
              </p>

            </div>


            <div className="landing-reference-card">

              <h3>
                NIST CSF v1.1
              </h3>

              <p>
                Cadre de cybersécurité permettant notamment
                d'identifier, protéger, détecter, répondre et
                récupérer.
              </p>

            </div>


            <div className="landing-reference-card">

              <h3>
                Loi 09-08
              </h3>

              <p>
                Référence relative à la protection des données à
                caractère personnel au Maroc.
              </p>

            </div>


            <div className="landing-reference-card">

              <h3>
                Guide CMRPI / AUSIM
              </h3>

              <p>
                Bonnes pratiques et recommandations adaptées au
                contexte des entreprises marocaines.
              </p>

            </div>

          </div>

        </section>


        {/* ================= CMRPI ================= */}

        <section
          id="cmrpi"
          className="landing-section landing-about"
        >

          <div className="landing-about-content">

            <span className="landing-section-label">
              À propos
            </span>

            <h2>
              Une initiative portée par le CMRPI
            </h2>

            <p>
              Cette plateforme s'inscrit dans une démarche visant à
              faciliter l'évaluation et l'amélioration de la maturité
              cybersécurité des PME.
            </p>

            <p>
              Elle propose une approche structurée permettant de
              transformer les résultats de l'évaluation en pistes
              d'amélioration et en accompagnement adapté.
            </p>

          </div>


          <div className="landing-about-logo">

            <div className="landing-logo-placeholder large">

              <img
                src={logoCMRPI}
                alt="Logo CMRPI"
                className="landing-logo-image"
              />

            </div>

          </div>

        </section>


        {/* ================= CTA ================= */}

        <section className="landing-cta">

          <div>

            <span className="landing-section-label">
              Commencer
            </span>

            <h2>
              Prêt à évaluer la maturité cybersécurité de votre PME ?
            </h2>

            <p>
              Créez votre compte et commencez votre parcours
              d'évaluation.
            </p>

          </div>


          <Link
            to="/inscription"
            className="landing-btn landing-btn-primary landing-btn-large"
          >
            Créer un compte
          </Link>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="landing-footer">

        <div className="landing-footer-logo">

          <img
            src={logoCMRPI}
            alt="Logo CMRPI"
            className="landing-logo-image"
          />

        </div>

        <p>
          Plateforme d'évaluation de la maturité cybersécurité des PME.
        </p>

        <span>
          © 2026 — CMRPI
        </span>

      </footer>

    </div>
  );
};

export default LandingPage;