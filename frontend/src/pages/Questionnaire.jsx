// src/pages/Questionnaire.jsx - Version Premium
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestionnaireActif, demarrerEvaluation, soumettreReponses } from "../api/referentielApi";
import "./Questionnaire.css";

function Questionnaire() {
  const navigate = useNavigate();
  const [referentiel, setReferentiel] = useState(null);
  const [evaluationId, setEvaluationId] = useState(null);
  const [themeIndex, setThemeIndex] = useState(0);
  const [reponses, setReponses] = useState({});
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
      } catch (error) {
        console.error("Erreur:", error);
        setErreur("Impossible de charger le questionnaire. Vérifiez votre connexion.");
      } finally {
        setChargement(false);
      }
    }
    init();
  }, []);

  if (chargement) return <div className="loading-container">Chargement...</div>;
  if (erreur) return <div className="error-container">{erreur}</div>;

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
      setErreur("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const dernierTheme = themeIndex === themes.length - 1;
  const toutRepondu = nbRepondues === totalQuestions;

  return (
    <div className="questionnaire-page">
      {/* Header */}
      <header className="questionnaire-header">
        <span className="eyebrow">Auto-évaluation de maturité</span>
        <h1>{referentiel.nom}</h1>
      </header>

      {/* Progression */}
      <div className="progression-container">
        <div className="progression-bar">
          <div className="progression-fill" style={{ width: `${progression}%` }} />
        </div>
        <div className="progression-text">
          <span>{nbRepondues} / {totalQuestions} questions</span>
          <span className="done">{progression}%</span>
        </div>
      </div>

      {/* Onglets */}
      <div className="theme-tabs">
        {themes.map((theme, index) => {
          const complet = theme.questions.every((q) => reponses[q.id] !== undefined);
          return (
            <button
              key={theme.id}
              className={`theme-tab ${index === themeIndex ? 'active' : ''}`}
              onClick={() => setThemeIndex(index)}
            >
              <span className="tab-number">{String(index + 1).padStart(2, "0")}</span>
              <span>{theme.nom}</span>
              {complet && <span className="tab-check">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="questions-list">
        {themeActuel.questions.map((question) => (
          <div 
            key={question.id} 
            className={`question-card ${reponses[question.id] !== undefined ? 'answered' : ''}`}
          >
            <div className="question-header">
              <span className="question-number">Q{question.numero}</span>
              <p className="question-text">{question.texte}</p>
            </div>
            <div className="choices-list">
              {question.choix.map((choix) => (
                <label
                  key={choix.id}
                  className={`choice-item ${reponses[question.id] === choix.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={reponses[question.id] === choix.id}
                    onChange={() => choisirReponse(question.id, choix.id)}
                  />
                  <span className="choice-level">N{choix.valeur}</span>
                  <span className="choice-text">{choix.texte}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {erreur && <div className="error-message">{erreur}</div>}

      {/* Footer */}
      <div className="questionnaire-footer">
        <button 
          className="btn btn-secondary" 
          onClick={handlePrecedent} 
          disabled={themeIndex === 0}
        >
          ← Précédent
        </button>

        {!dernierTheme ? (
          <button 
            className="btn btn-primary" 
            onClick={handleSuivant} 
            disabled={!themeComplet}
          >
            Suivant →
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={handleSoumettre}
            disabled={!toutRepondu || envoiEnCours}
          >
            {envoiEnCours ? "Envoi..." : "✅ Terminer l'évaluation"}
          </button>
        )}
      </div>
    </div>
  );
}

export default Questionnaire;