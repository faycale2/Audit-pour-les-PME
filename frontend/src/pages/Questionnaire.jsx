import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestionnaireActif, demarrerEvaluation, soumettreReponses } from "../api/referentielApi";
import "./Questionnaire.css";

function Questionnaire() {
  const navigate = useNavigate();
  const [referentiel, setReferentiel] = useState(null);
  const [evaluationId, setEvaluationId] = useState(null);
  const [themeIndex, setThemeIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reponses, setReponses] = useState({});
  const [chargement, setChargement] = useState(true);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  
  // État pour gérer l'animation de fondu
  const [questionFading, setQuestionFading] = useState(false);

  useEffect(() => {
    async function initialiser() {
      try {
        const dataReferentiel = await getQuestionnaireActif();
        setReferentiel(dataReferentiel);
        try {
          const dataEvaluation = await demarrerEvaluation();
          setEvaluationId(dataEvaluation.id);
          const reponsesExistantes = {};
          for (const reponse of dataEvaluation.reponses || []) {
            reponsesExistantes[reponse.question] = reponse.choix;
          }
          setReponses(reponsesExistantes);
          const themes = dataReferentiel.themes || [];
          let themeTrouve = 0;
          let questionTrouvee = 0;
          let trouve = false;
          themes.forEach((theme, tIndex) => {
            theme.questions.forEach((question, qIndex) => {
              if (!trouve && reponsesExistantes[question.id] === undefined) {
                themeTrouve = tIndex;
                questionTrouvee = qIndex;
                trouve = true;
              }
            });
          });
          setThemeIndex(themeTrouve);
          setQuestionIndex(questionTrouvee);
        } catch (error) {
          setErreur(error.response?.data?.detail || "Votre profil PME doit être complété avant de démarrer une évaluation.");
        }
      } catch (error) {
        const statut = error.response?.status;
        const detail = error.response?.data?.detail;
        if (statut === 401) setErreur("Votre session a expiré. Reconnectez-vous pour accéder au questionnaire.");
        else if (statut === 403) setErreur(detail || "Le questionnaire est réservé aux comptes PME.");
        else if (statut === 404) setErreur(detail || "Aucun questionnaire actif n'est disponible pour le moment.");
        else setErreur("Le serveur est inaccessible. Vérifiez que Django est lancé sur http://127.0.0.1:8000.");
      } finally { setChargement(false); }
    }
    initialiser();
  }, []);

  if (chargement) return <div className="etat-page">Chargement du questionnaire...</div>;
  if (!referentiel) return <div className="etat-page etat-erreur">{erreur || "Aucun questionnaire disponible."}</div>;
  if (!referentiel.themes?.length) return <div className="etat-page etat-erreur">Le référentiel actif ne contient aucune question.</div>;

  const themes = referentiel.themes;
  const themeActuel = themes[themeIndex];
  const questionActuelle = themeActuel.questions[questionIndex];
  const totalQuestions = themes.reduce((total, theme) => total + theme.questions.length, 0);
  const nbRepondues = Object.keys(reponses).length;
  const progression = Math.round((nbRepondues / totalQuestions) * 100);
  const reponsesTheme = themeActuel.questions.filter((question) => reponses[question.id] !== undefined).length;

  const choisirReponse = async (questionId, choixId) => {
    setReponses((precedentes) => ({ ...precedentes, [questionId]: choixId }));
    if (!evaluationId) {
      setErreur("Aucun profil PME n'est associé à votre compte. Contactez l'administrateur.");
      return;
    }
    setEnvoiEnCours(true);
    setErreur("");
    try {
      // 1. Déclencher l'animation de sortie
      setQuestionFading(true);

      const resultat = await soumettreReponses(evaluationId, [{ question_id: questionId, choix_id: choixId }]);
      
      // 2. Attendre la fin de l'animation (350ms) pour changer de question ou naviguer
      setTimeout(() => {
        setQuestionFading(false);
        if (resultat.termine) {
          navigate(`/resultats/${evaluationId}`);
        } else if (questionIndex < themeActuel.questions.length - 1) {
          setQuestionIndex((index) => index + 1);
        } else if (themeIndex < themes.length - 1) {
          setThemeIndex((index) => index + 1);
          setQuestionIndex(0);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 350);

    } catch (error) {
      setErreur(error.response?.data?.detail || "La réponse n'a pas pu être enregistrée.");
      setQuestionFading(false);
    } finally { 
      setEnvoiEnCours(false); 
    }
  };

  const precedent = () => {
    if (questionIndex > 0) setQuestionIndex((index) => index - 1);
    else if (themeIndex > 0) {
      setThemeIndex((index) => index - 1);
      setQuestionIndex(themes[themeIndex - 1].questions.length - 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="questionnaire-page">
      {erreur && <div className="message-erreur">{erreur}</div>}
      <header className="questionnaire-header">
        <div className="questionnaire-intro">
          <div>
            <span className="eyebrow">Parcours de maturité / 01</span>
            <h1>Construisons votre niveau de sécurité.</h1>
            <p>{referentiel.nom} · une étape à la fois, avec des réponses concrètes.</p>
          </div>
          <div className="progression-cercle">
            <strong>{progression}%</strong>
            <span>global</span>
          </div>
        </div>
        <div className="progression-meta">
          <span>Progression globale</span>
          <strong>{nbRepondues} / {totalQuestions} réponses</strong>
        </div>
        <div className="barre-progression">
          <div className="barre-progression-remplie" style={{ width: `${progression}%` }} />
        </div>
      </header>
      
      <nav className="dossier-onglets">
        {themes.map((theme, index) => { 
          const complet = theme.questions.every((question) => reponses[question.id] !== undefined); 
          const accessible = index === 0 || themes.slice(0, index).every((item) => item.questions.every((question) => reponses[question.id] !== undefined)); 
          return (
            <button key={theme.id} className={`onglet ${index === themeIndex ? "onglet-actif" : ""} ${complet ? "onglet-complet" : ""}`} onClick={() => accessible && setThemeIndex(index)} disabled={!accessible}>
              <span className="onglet-numero">{String(index + 1).padStart(2, "0")}</span>
              <span className="onglet-nom">{theme.nom}</span>
              {complet && <span className="onglet-check">OK</span>}
              {!accessible && <span className="onglet-lock">à venir</span>}
            </button>
          ); 
        })}
      </nav>

      <main className="questions-liste">
        <div className="theme-banner">
          <div>
            <span className="theme-index">THÈME {String(themeIndex + 1).padStart(2, "0")} · QUESTION {questionIndex + 1}/{themeActuel.questions.length}</span>
            <h2>{themeActuel.nom}</h2>
            <p>{themeActuel.description}</p>
          </div>
          <div className="theme-score">
            <strong>{reponsesTheme}/{themeActuel.questions.length}</strong>
            <span>répondues</span>
          </div>
        </div>

        {/* AJOUT DE LA CLASSE question-carte-fading ICI */}
        <article className={`question-carte question-carte-active ${questionFading ? "question-carte-fading" : ""}`}>
          <div className="question-entete">
            <span className="question-numero">Q{questionActuelle.numero}</span>
            <div>
              <p className="question-texte">{questionActuelle.texte}</p>
              <span className="question-hint">Votre réponse est enregistrée automatiquement.</span>
            </div>
          </div>
          <div className="choix-liste">
            {questionActuelle.choix.map((choix) => (
              <label key={choix.id} className={`choix-ligne ${reponses[questionActuelle.id] === choix.id ? "choix-selectionne" : ""}`}>
                <input 
                  type="radio" 
                  name={`question-${questionActuelle.id}`} 
                  checked={reponses[questionActuelle.id] === choix.id} 
                  onChange={() => choisirReponse(questionActuelle.id, choix.id)} 
                  disabled={envoiEnCours} 
                />
                <span className="choix-niveau">N{choix.valeur}</span>
                <span className="choix-texte">{choix.texte}</span>
              </label>
            ))}
          </div>
        </article>
      </main>

      <footer className="questionnaire-footer">
        <button className="btn btn-secondaire" onClick={precedent} disabled={themeIndex === 0 && questionIndex === 0}>Question précédente</button>
        <span className="auto-save-note">{envoiEnCours ? "Enregistrement..." : "Réponse enregistrée automatiquement"}</span>
      </footer>
    </div>
  );
}

export default Questionnaire;