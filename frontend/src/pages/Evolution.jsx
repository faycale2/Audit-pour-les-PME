import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { getEvolutionTendance, getComparatifBenchmark } from "../api/referentielApi";
import "./Evolution.css";

function Evolution() {
  const [evolution, setEvolution] = useState(null);
  const [comparatif, setComparatif] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function charger() {
      try {
        const [dataEvolution, dataComparatif] = await Promise.all([
          getEvolutionTendance(),
          getComparatifBenchmark(),
        ]);
        setEvolution(dataEvolution);
        setComparatif(dataComparatif);
      } catch (err) {
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

  if (tendance.disponible) {
    donneesGraphique.push({
      date: "Projection",
      scoreProjete: tendance.score_projete_prochaine_evaluation,
    });
  }

  return (
    <div className="evolution-page">
      <span className="eyebrow">Analyse comparative et prédictive</span>
      <h1>Évolution de votre maturité</h1>

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
                <Line type="monotone" dataKey="score" stroke="var(--teal-600)" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                <Line
                  type="monotone" dataKey="scoreProjete" stroke="var(--gold-500)"
                  strokeWidth={2} strokeDasharray="5 5" dot={{ r: 5 }} connectNulls
                />
                <ReferenceLine y={tendance.score_maximum} stroke="var(--paper-100)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {tendance.disponible ? (
        <section className="section-bloc">
          <h2>Tendance</h2>
          <div className="tendance-carte">
            <div className={`tendance-badge tendance-${tendance.tendance === "En progression" ? "hausse" : tendance.tendance === "En régression" ? "baisse" : "stable"}`}>
              {tendance.tendance}
            </div>
            <p>
              Score projeté pour la prochaine évaluation :{" "}
              <span className="mono valeur-forte">{tendance.score_projete_prochaine_evaluation}</span> / {tendance.score_maximum}
            </p>
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

      <section className="section-bloc">
        <h2>Positionnement par rapport au marché</h2>
        <div className="comparatif-grille">
          <div className="comparatif-carte comparatif-vous">
            <span className="comparatif-label">Votre dernier score</span>
            <span className="comparatif-valeur mono">{comparatif.score_pme}</span>
          </div>
          <div className="comparatif-carte">
            <span className="comparatif-label">Moyenne secteur ({comparatif.benchmark_secteur.secteur})</span>
            <span className="comparatif-valeur mono">
              {comparatif.benchmark_secteur.score_moyen ?? "—"}
            </span>
            <span className="comparatif-note">{comparatif.benchmark_secteur.nb_evaluations_comparees} évaluation(s)</span>
          </div>
          <div className="comparatif-carte">
            <span className="comparatif-label">Moyenne globale</span>
            <span className="comparatif-valeur mono">
              {comparatif.benchmark_global.score_moyen ?? "—"}
            </span>
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