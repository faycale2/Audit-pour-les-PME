import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getStatistiques } from "../api/adminApi";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    getStatistiques()
      .then(setStats)
      .catch(() =>
        setErreur("Impossible de charger les statistiques.")
      );
  }, []);

  if (erreur) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-state dashboard-error">
          <span className="state-icon">⚠️</span>
          <h3>Une erreur est survenue</h3>
          <p>{erreur}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-state">
          <div className="spinner"></div>
          <p>Chargement du pilotage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Centre de pilotage</span>

          <h1>Vue d'ensemble</h1>

          <p>
            Suivez l'activité de la plateforme et gardez le référentiel
            à jour.
          </p>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          <span>Système opérationnel</span>
        </div>
      </header>


      {/* =========================
          INDICATEURS
      ========================= */}

      <section className="dashboard-metrics">

        <article className="metric-card">
          <div className="metric-icon metric-icon-pme">
            🏢
          </div>

          <div className="metric-content">
            <span>PME inscrites</span>
            <strong>{stats.nombre_pme}</strong>
            <small>Entreprises suivies</small>
          </div>
        </article>


        <article className="metric-card">
          <div className="metric-icon metric-icon-users">
            👥
          </div>

          <div className="metric-content">
            <span>Utilisateurs</span>
            <strong>{stats.nombre_utilisateurs}</strong>
            <small>Tous les rôles</small>
          </div>
        </article>


        <article className="metric-card">
          <div className="metric-icon metric-icon-sector">
            📊
          </div>

          <div className="metric-content">
            <span>Secteurs actifs</span>
            <strong>
              {stats.repartition_par_secteur?.length || 0}
            </strong>
            <small>Répartition déclarée</small>
          </div>
        </article>

      </section>


      {/* =========================
          CONTENU PRINCIPAL
      ========================= */}

      <section className="dashboard-grid">

        {/* =========================
            REPARTITION
        ========================= */}

        <article className="dashboard-card sector-card">

          <div className="card-header">
            <div>
              <span className="section-label">
                Activité
              </span>

              <h2>Répartition sectorielle</h2>
            </div>

            <span className="card-count">
              {stats.repartition_par_secteur?.length || 0} secteurs
            </span>
          </div>


          <div className="sector-list">

            {stats.repartition_par_secteur?.length > 0 ? (
              stats.repartition_par_secteur.map((secteur) => (
                <div
                  className="sector-row"
                  key={secteur.secteur || "non-precise"}
                >
                  <div className="sector-info">
                    <span className="sector-dot"></span>

                    <span>
                      {secteur.secteur || "Non précisé"}
                    </span>
                  </div>

                  <strong>{secteur.total}</strong>
                </div>
              ))
            ) : (
              <div className="empty-sector">
                <span>📊</span>
                <p>Aucune donnée sectorielle disponible.</p>
              </div>
            )}

          </div>

        </article>


        {/* =========================
            ACTIONS RAPIDES
        ========================= */}

        <article className="dashboard-card quick-actions-card">

          <div className="card-header">
            <div>
              <span className="section-label">
                Navigation
              </span>

              <h2>Actions rapides</h2>
            </div>
          </div>


          <div className="quick-links">

            <Link to="/admin/utilisateurs" className="quick-link">
              <div className="quick-link-icon">
                👥
              </div>

              <div className="quick-link-content">
                <strong>Gérer les utilisateurs</strong>
                <span>Comptes et rôles</span>
              </div>

              <span className="quick-arrow">→</span>
            </Link>


            <Link to="/admin/seuils" className="quick-link">
              <div className="quick-link-icon">
                ⚙️
              </div>

              <div className="quick-link-content">
                <strong>Ajuster les seuils</strong>
                <span>Paramètres de la plateforme</span>
              </div>

              <span className="quick-arrow">→</span>
            </Link>


            <Link to="/chatbot" className="quick-link">
              <div className="quick-link-icon">
                🤖
              </div>

              <div className="quick-link-content">
                <strong>Base de l'assistant</strong>
                <span>Gérer les connaissances</span>
              </div>

              <span className="quick-arrow">→</span>
            </Link>

          </div>

        </article>

      </section>

    </div>
  );
}

export default AdminDashboard;