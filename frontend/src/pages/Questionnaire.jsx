import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestionnaireActif, demarrerEvaluation, soumettreReponses } from "../api/referentielApi";
import "./Questionnaire.css";

function Questionnaire() {
  const navigate = useNavigate();
  const [referentiel, setReferentiel] = useState(null);
  const [evaluationId, setEvaluationId] = useState(null);
  const [themeIndex, setThemeIndex] = useState(0);
  const [reponses, setReponses] = useState({}); // { questionId: choixId }
  const [chargement, setChargement] = useState(true);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const [dataReferentiel, dataEvaluation] = await Promise.all([
          getQuestionnaireActif(),
          demarrerEvaluation(),
        ]);
        setReferentiel(dataReferentiel);
        setEvaluationId(dataEvaluation.id);
      } catch {
        setErreur("Impossible de charger le questionnaire. Vérifiez votre connexion.");
      } finally {
        setChargement(false);
      }
    }
    init();
  }, []);

  if (chargement) {
    return <div className="etat-page">Chargement du questionnaire…</div>;
  }

  if (erreur) {
    return <div className="etat-page etat-erreur">{erreur}</div>;
  }

  const themes = referentiel.themes;
  const themeActuel = themes[themeIndex];
  const totalQuestions = themes.reduce((acc, t) => acc + t.questions.length, 0);
  const nbRepondues = Object.keys(reponses).length;
  const progression = Math.round((nbRepondues / totalQuestions) * 100);

  const choisirReponse = (questionId, choixId) => {
    setReponses((prev) => ({ ...prev, [questionId]: choixId }));
  };

  const themeComplet = themeActuel.questions.every((q) => reponses[q.id] !== undefined);

  const handleSuivant = () => {
    if (themeIndex < themes.length - 1) {
      setThemeIndex(themeIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrecedent = () => {
    if (themeIndex > 0) {
      setThemeIndex(themeIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSoumettre = async () => {
    setEnvoiEnCours(true);
    setErreur("");
    try {
      const payload = Object.entries(reponses).map(([questionId, choixId]) => ({
        question_id: Number(questionId),
        choix_id: choixId,
      }));
      const resultat = await soumettreReponses(evaluationId, payload);
      if (resultat.termine) {
        navigate(`/resultats/${evaluationId}`);
      } else {
        setErreur(`Il manque encore ${resultat.total_questions - resultat.nb_reponses} réponse(s).`);
      }
    } catch {
      setErreur("Erreur lors de l'envoi des réponses. Réessayez.");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const dernierTheme = themeIndex === themes.length - 1;
  const toutRepondu = nbRepondues === totalQuestions;

  return (
    <div className="questionnaire-page">
      <header className="questionnaire-header">
        <span className="eyebrow">Auto-évaluation de maturité cybersécurité</span>
        <h1>{referentiel.nom}</h1>
        <div className="barre-progression">
          <div className="barre-progression-remplie" style={{ width: `${progression}%` }} />
        </div>
        <p className="progression-texte">{nbRepondues} / {totalQuestions} questions répondues</p>
      </header>

      <nav className="dossier-onglets">
        {themes.map((theme, index) => {
          const complet = theme.questions.every((q) => reponses[q.id] !== undefined);
          return (
            <button
              key={theme.id}
              className={`onglet ${index === themeIndex ? "onglet-actif" : ""} ${complet ? "onglet-complet" : ""}`}
              onClick={() => setThemeIndex(index)}
            >
              <span className="onglet-numero">{String(index + 1).padStart(2, "0")}</span>
              <span className="onglet-nom">{theme.nom}</span>
              {complet && <span className="onglet-check">✓</span>}
            </button>
          );
        })}
      </nav>

      <main className="questions-liste">
        {themeActuel.questions.map((question) => (
          <article key={question.id} className="question-carte">
            <div className="question-entete">
              <span className="question-numero">Q{question.numero}</span>
              <p className="question-texte">{question.texte}</p>
            </div>
            <div className="choix-liste">
              {question.choix.map((choix) => (
                <label
                  key={choix.id}
                  className={`choix-ligne ${reponses[question.id] === choix.id ? "choix-selectionne" : ""}`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={reponses[question.id] === choix.id}
                    onChange={() => choisirReponse(question.id, choix.id)}
                  />
                  <span className="choix-niveau">N{choix.valeur}</span>
                  <span className="choix-texte">{choix.texte}</span>
                </label>
              ))}
            </div>
          </article>
        ))}
      </main>

      {erreur && <p className="message-erreur">{erreur}</p>}

      <footer className="questionnaire-footer">
        <button className="btn btn-secondaire" onClick={handlePrecedent} disabled={themeIndex === 0}>
          ← Thème précédent
        </button>

        {!dernierTheme ? (
          <button className="btn btn-primaire" onClick={handleSuivant} disabled={!themeComplet}>
            Thème suivant →
          </button>
        ) : (
          <button
            className="btn btn-primaire"
            onClick={handleSoumettre}
            disabled={!toutRepondu || envoiEnCours}
          >
            {envoiEnCours ? "Envoi en cours…" : "Terminer l'évaluation"}
          </button>
        )}
      </footer>
    </div>
  );
}

export default Questionnaire;