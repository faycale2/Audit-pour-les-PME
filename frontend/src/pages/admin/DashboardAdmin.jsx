// src/pages/admin/DashboardAdmin.jsx - Version professionnelle
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./DashboardAdmin.css";

function DashboardAdmin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await axiosClient.get("/admin/statistiques/");
        setStats(data);
      } catch (error) {
        console.error("Erreur stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-admin">
      <div className="dashboard-header">
        <h2>Tableau de bord</h2>
        <p>Vue d'ensemble de la plateforme Audit PME</p>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon blue">🏢</div>
          <div className="stat-card-content">
            <span className="stat-value">{stats.nombre_pme}</span>
            <span className="stat-label">PME inscrites</span>
            <span className="stat-trend up">↑ 12% ce mois</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon green">👤</div>
          <div className="stat-card-content">
            <span className="stat-value">{stats.nombre_utilisateurs}</span>
            <span className="stat-label">Utilisateurs totaux</span>
            <span className="stat-trend up">↑ 8% ce mois</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon gold">📊</div>
          <div className="stat-card-content">
            <span className="stat-value">—</span>
            <span className="stat-label">Évaluations terminées</span>
            <span className="stat-trend">En croissance</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon purple">🏆</div>
          <div className="stat-card-content">
            <span className="stat-value">—</span>
            <span className="stat-label">Score moyen</span>
            <span className="stat-trend">Niveau 3</span>
          </div>
        </div>
      </div>

      {/* Répartition par secteur */}
      <div className="chart-section">
        <h3>Répartition par secteur d'activité</h3>
        <div className="sector-list">
          {stats.repartition_par_secteur.map((item, index) => {
            const percentage = (item.total / stats.nombre_pme) * 100;
            const colors = ['#1E88E5', '#42A5F5', '#64B6F7', '#90CAF9', '#BBDEFB', '#E3F2FD'];
            return (
              <div key={item.secteur || 'autre'} className="sector-item">
                <span className="sector-name">{item.secteur || "Non renseigné"}</span>
                <div className="sector-bar-wrapper">
                  <div className="sector-bar">
                    <div 
                      className="sector-bar-fill" 
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        background: colors[index % colors.length]
                      }}
                    />
                  </div>
                  <span className="sector-count">{item.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;