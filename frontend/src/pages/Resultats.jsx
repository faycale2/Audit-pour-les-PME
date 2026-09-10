// src/pages/Resultats.jsx - Version Premium
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getResultatsEvaluation, getRapportPdfUrl } from "../api/referentielApi";
import "./Resultats.css";

const NOMS_DOMAINES = { ISO_27001: "ISO/IEC 27001", NIST_CSF: "NIST CSF", LOI_09_08: "Loi 09-08" };
const LEVEL_COLORS = {
  1: { bg: '#FFE5E5', text: '#D94444' },
  2: { bg: '#FFF3CD', text: '#E8A838' },
  3: { bg: '#D1ECF1', text: '#1E88E5' },
  4: { bg: '#D4EDDA', text: '#0E8C5A' },
  5: { bg: '#C3E6CB', text: '#0A6B47' },
};

function Resultats() {
  const { evaluationId } = useParams();
  const [resultats, setResultats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function charger() {
      try {
        const data = await getResultatsEvaluation(evaluationId);
        setResultats(data);
      } catch {
        setErreur("Impossible de charger les résultats.");
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, [evaluationId]);

  if (chargement) return <div className="loading-container">Calcul des résultats...</div>;
  if (erreur) return <div className="error-container">{erreur}</div>;

  const { score_total, score_maximum, maturite, scores_par_theme, scores_par_domaine } = resultats;
  const pourcentageGlobal = Math.round((score_total / score_maximum) * 100);
  const level = maturite.niveau;
  const levelColor = LEVEL_COLORS[level] || LEVEL_COLORS[3];

  const telechargerPdf = async () => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(getRapportPdfUrl(evaluationId), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport_audit_${evaluationId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="resultats-page">
      <div className="resultats-header">
        <span className="eyebrow">Rapport d'évaluation</span>
        <h1>Résultats de votre audit</h1>
      </div>

      {/* Score Card */}
      <div className="score-card-premium">
        <div className={`score-circle level-${level}`}>
          <span className="level-number">{level}</span>
          <span className="level-label">/ 5</span>
        </div>
        <div className="score-details">
          <div className="level-title">{maturite.libelle}</div>
          <div className="score-value">
            <strong>{score_total}</strong> / {score_maximum} points ({pourcentageGlobal}%)
          </div>
          <div style={{ 
            width: '100%', 
            height: '4px', 
            background: '#EDF2F7', 
            borderRadius: '2px',
            marginTop: '8px'
          }}>
            <div style={{
              width: `${pourcentageGlobal}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${levelColor.text}, ${levelColor.text}dd)`,
              borderRadius: '2px',
              transition: 'width 1s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Scores par thème */}
      <div className="result-section">
        <h3>Scores par thème</h3>
        <table className="result-table">
          <thead>
            <tr><th>Thème</th><th>Score</th><th>%</th></tr>
          </thead>
          <tbody>
            {scores_par_theme.map((t) => (
              <tr key={t.theme_code}>
                <td>{t.theme_nom}</td>
                <td>{t.score} / {t.score_max}</td>
                <td>
                  <span className="theme-score-bar">
                    <span className="fill" style={{ 
                      width: `${t.pourcentage}%`,
                      background: `linear-gradient(90deg, #1E88E5, #42A5F5)`
                    }} />
                  </span>
                  {t.pourcentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scores par domaine */}
      <div className="result-section">
        <h3>Scores par domaine normatif</h3>
        <table className="result-table">
          <thead>
            <tr><th>Domaine</th><th>Score</th><th>%</th></tr>
          </thead>
          <tbody>
            {Object.entries(scores_par_domaine)
              .filter(([, d]) => d.score_max > 0)
              .map(([code, d]) => (
                <tr key={code}>
                  <td>{NOMS_DOMAINES[code] || code}</td>
                  <td>{d.score} / {d.score_max}</td>
                  <td>
                    <span className="theme-score-bar">
                      <span className="fill" style={{ 
                        width: `${d.pourcentage}%`,
                        background: `linear-gradient(90deg, #D4B85A, #C9A84C)`
                      }} />
                    </span>
                    {d.pourcentage}%
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="actions-row">
        <Link to="/evolution" className="btn btn-evolution">
          📈 Voir mon évolution
        </Link>
        <button className="btn btn-pdf" onClick={telechargerPdf}>
          📄 Télécharger le rapport PDF
        </button>
      </div>
    </div>
  );
}

export default Resultats;