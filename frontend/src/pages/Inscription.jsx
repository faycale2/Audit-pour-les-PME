// src/pages/Inscription.jsx - Version professionnelle
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "./Inscription.css";

function Inscription() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    nom_entreprise: "",
    secteur: "",
  });
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setChargement(true);

    try {
      await axiosClient.post("/inscription/", form);
      setSucces("✅ Inscription réussie ! Vous allez être redirigé...");
      setTimeout(() => {
        navigate("/connexion");
      }, 2000);
    } catch (error) {
      const message =
        error.response?.data?.email?.[0] ||
        error.response?.data?.detail ||
        "Erreur lors de l'inscription. Veuillez réessayer.";
      setErreur(message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="inscription-page">
      <div className="inscription-container">
        {/* Colonne gauche - Formulaire */}
        <div className="inscription-form-wrapper">
          <div className="inscription-header">
            <Link to="/" className="back-link">← Retour à l'accueil</Link>
            <h1>Créer votre compte</h1>
            <p>Évaluez la maturité cybersécurité de votre entreprise en quelques minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="inscription-form">
            <div className="form-group">
              <label>Email professionnel</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="contact@monentreprise.com"
              />
            </div>

            <div className="form-group">
              <label>Mot de passe (min 8 caractères)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                placeholder="••••••••"
              />
              <span className="input-hint">Au moins 8 caractères</span>
            </div>

            <div className="form-group">
              <label>Nom de l'entreprise</label>
              <input
                type="text"
                value={form.nom_entreprise}
                onChange={(e) => setForm({ ...form, nom_entreprise: e.target.value })}
                required
                placeholder="Ma Société SARL"
              />
            </div>

            <div className="form-group">
              <label>Secteur d'activité</label>
              <select
                value={form.secteur}
                onChange={(e) => setForm({ ...form, secteur: e.target.value })}
              >
                <option value="">Sélectionnez un secteur</option>
                <option value="Technologie">Technologie</option>
                <option value="Finance">Finance / Banque</option>
                <option value="Santé">Santé / Médical</option>
                <option value="Industrie">Industrie / Manufacturing</option>
                <option value="Commerce">Commerce / Distribution</option>
                <option value="Services">Services / Conseil</option>
                <option value="Education">Éducation / Formation</option>
                <option value="Public">Secteur Public</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {erreur && <div className="message-error">{erreur}</div>}
            {succes && <div className="message-success">{succes}</div>}

            <button type="submit" className="btn-inscription" disabled={chargement}>
              {chargement ? "Création en cours..." : "Créer mon compte"}
            </button>

            <p className="form-footer">
              Déjà un compte ? <Link to="/connexion">Connectez-vous</Link>
            </p>
          </form>
        </div>

        {/* Colonne droite - Informations */}
        <div className="inscription-info">
          <div className="info-content">
            <span className="info-badge">🔒 Sécurisé • Gratuit</span>
            <h2>Pourquoi créer un compte ?</h2>
            <ul className="info-list">
              <li>
                <span className="info-icon">📋</span>
                <div>
                  <strong>Évaluation complète</strong>
                  <p>29 questions couvrant 4 thèmes stratégiques</p>
                </div>
              </li>
              <li>
                <span className="info-icon">📊</span>
                <div>
                  <strong>Rapport détaillé</strong>
                  <p>Scores par thème et par domaine normatif</p>
                </div>
              </li>
              <li>
                <span className="info-icon">📈</span>
                <div>
                  <strong>Suivi d'évolution</strong>
                  <p>Visualisez vos progrès dans le temps</p>
                </div>
              </li>
              <li>
                <span className="info-icon">📄</span>
                <div>
                  <strong>Rapport PDF</strong>
                  <p>Téléchargez votre rapport personnalisé</p>
                </div>
              </li>
            </ul>
            <div className="info-securite">
              <span>🛡️</span>
              <div>
                <strong>Vos données sont sécurisées</strong>
                <p>Conformes à la loi 09-08 sur la protection des données</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inscription;