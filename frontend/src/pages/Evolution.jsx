// src/pages/Evolution.jsx - Version corrigée avec graphique fonctionnel
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getEvolutionTendance,
  getComparatifBenchmark,
  getTendanceParTheme,
  getPredictionProgression,
} from "../api/referentielApi";
import "./Evolution.css";

function Evolution() {
  const [evolution, setEvolution] = useState(null);
  const [comparatif, setComparatif] = useState(null);
  const [tendanceThemes, setTendanceThemes] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function charger() {
      try {
        const [dataEvolution, dataComparatif, dataThemes, dataPrediction] = await Promise.all([
          getEvolutionTendance(),
          getComparatifBenchmark(),
          getTendanceParTheme(),
          getPredictionProgression(),
        ]);
        setEvolution(dataEvolution);
        setComparatif(dataComparatif);
        setTendanceThemes(dataThemes);
        setPrediction(dataPrediction);
      } catch (error) {
        console.error("Erreur:", error);
        setErreur("Impossible de charger l'analyse. Avez-vous déjà terminé une évaluation ?");
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  if (chargement) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Analyse en cours...</p>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="error-container">
        <span className="error-icon">⚠️</span>
        <p>{erreur}</p>
        <Link to="/questionnaire" className="btn btn-primary">
          Repasser une évaluation
        </Link>
      </div>
    );
  }

  const { historique, tendance } = evolution;

  // Préparer les données pour le graphique
  const donneesGraphique = historique.map((point) => ({
    date: new Date(point.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    score: point.score_total,
    niveau: point.niveau?.libelle || `Niveau ${point.niveau?.niveau || "?"}`,
  }));

  const scoreMax = tendance?.score_maximum || 116;

  return (
    <div className="evolution-page">
      <div className="evolution-header">
        <span className="eyebrow">Analyse comparative et prédictive</span>
        <h1>Évolution de votre maturité</h1>
      </div>

      {/* ===== SECTION HISTORIQUE ===== */}
      <section className="evolution-section">
        <h2>Historique des scores</h2>

        {historique.length < 2 ? (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <p>Une seule évaluation terminée pour l'instant</p>
            <span className="empty-hint">
              Repassez le questionnaire pour voir apparaître une courbe d'évolution.
            </span>
            <Link to="/questionnaire" className="btn btn-primary">
              Repasser une évaluation
            </Link>
          </div>
        ) : (
          <div className="graphique-wrapper">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={donneesGraphique}
                margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fontFamily: "IBM Plex Mono, monospace", fill: "#6B8096" }}
                  axisLine={{ stroke: "#EDF2F7" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, scoreMax]}
                  tick={{ fontSize: 12, fontFamily: "IBM Plex Mono, monospace", fill: "#6B8096" }}
                  axisLine={{ stroke: "#EDF2F7" }}
                  tickLine={false}
                  label={{
                    value: "Score",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#6B8096", fontSize: 12, fontFamily: "Inter, sans-serif" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #EDF2F7",
                    borderRadius: "10px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{ fontWeight: 600, color: "#0D1B2A" }}
                  formatter={(value) => [`${value} / ${scoreMax}`, "Score"]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  formatter={() => "Évolution des scores"}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#1E88E5"
                  strokeWidth={3}
                  dot={{
                    r: 6,
                    stroke: "#1E88E5",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                  activeDot={{
                    r: 8,
                    stroke: "#1565C0",
                    strokeWidth: 2,
                    fill: "#1E88E5",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* ===== TENDANCE GLOBALE ===== */}
      {tendance?.disponible && (
        <section className="evolution-section">
          <h2>Tendance globale</h2>
          <div className="tendance-card">
            <div
              className={`tendance-badge ${
                tendance.tendance === "En progression"
                  ? "tendance-hausse"
                  : tendance.tendance === "En régression"
                  ? "tendance-baisse"
                  : "tendance-stable"
              }`}
            >
              {tendance.tendance === "En progression" && "📈"}
              {tendance.tendance === "En régression" && "📉"}
              {tendance.tendance === "Stable" && "➖"}
              {tendance.tendance}
            </div>

            <div className="tendance-score">
              <span className="tendance-label">Score estimé aujourd'hui</span>
              <span className="tendance-value">
                {tendance.score_estime_aujourdhui} / {tendance.score_maximum}
              </span>
            </div>

            <div className="tendance-meta">
              <span className="meta-item">
                <span className="meta-label">Méthode</span>
                <span className="meta-value">{tendance.methode}</span>
              </span>
              <span className="meta-item">
                <span className="meta-label">Confiance (R²)</span>
                <span className="meta-value">{tendance.confiance_r2}</span>
              </span>
              <span className="meta-item">
                <span className="meta-label">Évaluations</span>
                <span className="meta-value">{tendance.nb_evaluations}</span>
              </span>
            </div>

            {!tendance.confiance_fiable && (
              <div className="warning-banner">
                <span>⚠️</span>
                <span>
                  Peu de points de mesure — cette tendance est indicative, pas définitive.
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== TENDANCE PAR THÈME ===== */}
      {tendanceThemes?.disponible && (
        <section className="evolution-section">
          <h2>Tendance par thème</h2>
          <div className="themes-grid">
            {Object.entries(tendanceThemes.par_theme).map(([nom, t]) => (
              <div key={nom} className="theme-card">
                <div className="theme-header">
                  <span className="theme-name">{nom}</span>
                  <span
                    className={`theme-trend ${
                      t.tendance === "En progression"
                        ? "trend-up"
                        : t.tendance === "En régression"
                        ? "trend-down"
                        : "trend-stable"
                    }`}
                  >
                    {t.tendance === "En progression" && "↑"}
                    {t.tendance === "En régression" && "↓"}
                    {t.tendance === "Stable" && "→"}
                    {t.tendance}
                  </span>
                </div>
                <div className="theme-score">
                  <span className="theme-percent">{t.dernier_pourcentage}%</span>
                  <div className="theme-bar">
                    <div
                      className="theme-bar-fill"
                      style={{
                        width: `${t.dernier_pourcentage}%`,
                        background:
                          t.tendance === "En progression"
                            ? "linear-gradient(90deg, #0E8C5A, #10B981)"
                            : t.tendance === "En régression"
                            ? "linear-gradient(90deg, #D94444, #EF4444)"
                            : "linear-gradient(90deg, #D4B85A, #E8C96E)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== PRÉDICTION ===== */}
      {prediction?.disponible && (
        <section className="evolution-section">
          <h2>Prédiction de progression (6 mois)</h2>
          <div className="prediction-card">
            <div className="prediction-circle">
              <svg viewBox="0 0 120 120" className="prediction-svg">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#EDF2F7"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#1E88E5"
                  strokeWidth="10"
                  strokeDasharray="314.16"
                  strokeDashoffset={314.16 * (1 - prediction.probabilite_progression_6_mois)}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="55" textAnchor="middle" fontSize="24" fontWeight="700" fill="#0D1B2A">
                  {Math.round(prediction.probabilite_progression_6_mois * 100)}%
                </text>
                <text x="60" y="75" textAnchor="middle" fontSize="10" fill="#6B8096">
                  Probabilité
                </text>
              </svg>
            </div>
            <div className="prediction-content">
              <p className="prediction-text">{prediction.interpretation}</p>
              <div className="prediction-warning">
                <span>ℹ️</span>
                <span>{prediction.avertissement_methodologique}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== COMPARATIF ===== */}
      {comparatif && (
        <section className="evolution-section">
          <h2>Positionnement par rapport au marché</h2>
          <div className="comparatif-grid">
            <div className="comparatif-card vous">
              <span className="comparatif-label">Votre dernier score</span>
              <span className="comparatif-valeur">{comparatif.score_pme}</span>
              <span className="comparatif-icon">🏆</span>
            </div>
            <div className="comparatif-card">
              <span className="comparatif-label">
                Moyenne secteur ({comparatif.benchmark_secteur.secteur})
              </span>
              <span className="comparatif-valeur">
                {comparatif.benchmark_secteur.score_moyen ?? "—"}
              </span>
              <span className="comparatif-note">
                {comparatif.benchmark_secteur.nb_evaluations_comparees} évaluation(s)
              </span>
            </div>
            <div className="comparatif-card">
              <span className="comparatif-label">Moyenne globale</span>
              <span className="comparatif-valeur">
                {comparatif.benchmark_global.score_moyen ?? "—"}
              </span>
              <span className="comparatif-note">
                {comparatif.benchmark_global.nb_evaluations_comparees} évaluation(s)
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ===== ACTIONS ===== */}
      <div className="evolution-actions">
        <Link to="/questionnaire" className="btn btn-secondary">
          ← Repasser une évaluation
        </Link>
        <Link to="/resultats" className="btn btn-primary">
          Voir mes résultats →
        </Link>
      </div>
    </div>
  );
}

export default Evolution;