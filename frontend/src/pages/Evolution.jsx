import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  getEvolutionTendance, getComparatifBenchmark, getTendanceParTheme, getPredictionProgression,
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
      } catch {
        setErreur("Impossible de charger l'analyse. Avez-vous déjà terminé une évaluation ?");
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  if (chargement) return <div className="etat-page">Analyse en cours…</div>;
  if (erreur) return <div className="etat-page etat-erreur">{erreur}</div>;

  const { historique, tendance } = evolution;

  const donneesGraphique = historique.map((point) => ({
    date: new Date(point.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    score: point.score_total,
  }));

  return (
    <div className="evolution-page">
      <span className="eyebrow">Analyse comparative et prédictive</span>
      <h1>Évolution de votre maturité</h1>

      {/* --- Historique --- */}
      <section className="section-bloc">
        <h2>Historique des scores</h2>
        {historique.length < 2 ? (
          <p className="note-info">
            Une seule évaluation terminée pour l'instant — repassez le questionnaire pour voir
            apparaître une courbe d'évolution.
          </p>
        ) : (
          <div className="graphique-conteneur">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={donneesGraphique} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--paper-100)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fontFamily: "var(--font-mono)" }} />
                <YAxis domain={[0, tendance.score_maximum || 116]} tick={{ fontSize: 12, fontFamily: "var(--font-mono)" }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="var(--teal-600)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* --- Tendance globale (corrigée) --- */}
      {tendance.disponible ? (
        <section className="section-bloc">
          <h2>Tendance globale</h2>
          <div className="tendance-carte">
            <div className={`tendance-badge tendance-${tendance.tendance === "En progression" ? "hausse" : tendance.tendance === "En régression" ? "baisse" : "stable"}`}>
              {tendance.tendance}
            </div>
            <p>
              Score estimé aujourd'hui (à partir de la tendance) :{" "}
              <span className="mono valeur-forte">{tendance.score_estime_aujourdhui}</span> / {tendance.score_maximum}
            </p>
            <p className="note-methode">{tendance.methode}</p>
            {!tendance.confiance_fiable && (
              <p className="note-avertissement">
                Peu de points de mesure — cette tendance est indicative, pas définitive.
              </p>
            )}
            {tendance.confiance_r2 < 0.5 && (
              <p className="note-avertissement">
                La progression n'est pas parfaitement régulière (indice d'ajustement : {tendance.confiance_r2}) —
                à interpréter avec prudence.
              </p>
            )}
          </div>
        </section>
      ) : (
        <section className="section-bloc">
          <p className="note-info">{tendance.raison}</p>
        </section>
      )}

      {/* --- Tendance par thème --- */}
      {tendanceThemes?.disponible && (
        <section className="section-bloc">
          <h2>Tendance par thème</h2>
          <div className="themes-tendance-liste">
            {Object.entries(tendanceThemes.par_theme).map(([nom, t]) => (
              <div key={nom} className="theme-tendance-ligne">
                <span className="theme-tendance-nom">{nom}</span>
                <span className={`tendance-badge tendance-mini tendance-${t.tendance === "En progression" ? "hausse" : t.tendance === "En régression" ? "baisse" : "stable"}`}>
                  {t.tendance}
                </span>
                <span className="mono theme-tendance-valeur">{t.dernier_pourcentage}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- Prédiction --- */}
      {prediction?.disponible && (
        <section className="section-bloc">
          <h2>Prédiction de progression (6 mois)</h2>
          <div className="prediction-carte">
            <div className="prediction-jauge">
              <div
                className="prediction-jauge-remplie"
                style={{ width: `${Math.round(prediction.probabilite_progression_6_mois * 100)}%` }}
              />
            </div>
            <p className="mono valeur-forte">
              {Math.round(prediction.probabilite_progression_6_mois * 100)}% de probabilité
            </p>
            <p>{prediction.interpretation}</p>
            <p className="note-avertissement">{prediction.avertissement_methodologique}</p>
          </div>
        </section>
      )}

      {/* --- Comparatif marché --- */}
      <section className="section-bloc">
        <h2>Positionnement par rapport au marché</h2>
        <div className="comparatif-grille">
          <div className="comparatif-carte comparatif-vous">
            <span className="comparatif-label">Votre dernier score</span>
            <span className="comparatif-valeur mono">{comparatif.score_pme}</span>
          </div>
          <div className="comparatif-carte">
            <span className="comparatif-label">Moyenne secteur ({comparatif.benchmark_secteur.secteur})</span>
            <span className="comparatif-valeur mono">{comparatif.benchmark_secteur.score_moyen ?? "—"}</span>
            <span className="comparatif-note">{comparatif.benchmark_secteur.nb_evaluations_comparees} évaluation(s)</span>
          </div>
          <div className="comparatif-carte">
            <span className="comparatif-label">Moyenne globale</span>
            <span className="comparatif-valeur mono">{comparatif.benchmark_global.score_moyen ?? "—"}</span>
            <span className="comparatif-note">{comparatif.benchmark_global.nb_evaluations_comparees} évaluation(s)</span>
          </div>
        </div>
      </section>

      <Link to="/questionnaire" className="btn btn-secondaire lien-retour">
        ← Repasser une évaluation
      </Link>
    </div>
  );
}

export default Evolution;