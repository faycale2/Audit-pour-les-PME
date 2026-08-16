import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getResultatsEvaluation, getRapportPdfUrl } from "../api/referentielApi";
import "./Resultats.css";

const NOMS_DOMAINES = { ISO_27001: "ISO/IEC 27001", NIST_CSF: "NIST CSF", LOI_09_08: "Loi 09-08" };

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

  if (chargement) return <div className="etat-page">Calcul des résultats…</div>;
  if (erreur) return <div className="etat-page etat-erreur">{erreur}</div>;

  const { score_total, score_maximum, maturite, scores_par_theme, scores_par_domaine } = resultats;
  const pourcentageGlobal = Math.round((score_total / score_maximum) * 100);

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
      <span className="eyebrow">Rapport d'évaluation</span>
      <h1>Résultats de votre audit</h1>

      <div className="sceau-bloc">
        <div className="sceau">
          <span className="sceau-niveau">{maturite.niveau}</span>
          <span className="sceau-label">/ 5</span>
        </div>
        <div className="sceau-details">
          <p className="sceau-titre">{maturite.libelle}</p>
          <p className="sceau-score">
            <span className="mono">{score_total}</span> / {score_maximum} points ({pourcentageGlobal}%)
          </p>
        </div>
      </div>

      <section className="section-bloc">
        <h2>Scores par thème</h2>
        <table className="tableau-resultats">
          <thead>
            <tr><th>Thème</th><th>Score</th><th>%</th></tr>
          </thead>
          <tbody>
            {scores_par_theme.map((t) => (
              <tr key={t.theme_code}>
                <td>{t.theme_nom}</td>
                <td className="mono">{t.score} / {t.score_max}</td>
                <td>
                  <div className="mini-barre">
                    <div className="mini-barre-remplie" style={{ width: `${t.pourcentage}%` }} />
                  </div>
                  <span className="mono mini-pourcentage">{t.pourcentage}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section-bloc">
        <h2>Scores par domaine normatif</h2>
        <table className="tableau-resultats">
          <thead>
            <tr><th>Domaine</th><th>Score</th><th>%</th></tr>
          </thead>
          <tbody>
            {Object.entries(scores_par_domaine)
              .filter(([, d]) => d.score_max > 0)
              .map(([code, d]) => (
                <tr key={code}>
                  <td>{NOMS_DOMAINES[code] || code}</td>
                  <td className="mono">{d.score} / {d.score_max}</td>
                  <td className="mono">{d.pourcentage}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <button className="btn btn-primaire btn-pdf" onClick={telechargerPdf}>
        Télécharger le rapport PDF complet
      </button>
    </div>
  );
}

export default Resultats;