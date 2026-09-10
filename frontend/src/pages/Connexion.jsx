// src/pages/Connexion.jsx - Version corrigée avec style amélioré
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { connexion } from "../api/authApi";
import "./Connexion.css";

function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const data = await connexion(email, password);
      login(data.role);

      if (data.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/questionnaire");
      }
    } catch {
      setErreur("Email ou mot de passe incorrect.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="connexion-page">
      <div className="connexion-container">
        {/* ===== COLONNE GAUCHE - FORMULAIRE ===== */}
        <div className="connexion-form-wrapper">
          <div className="connexion-header">
            <Link to="/" className="back-link">← Retour à l'accueil</Link>
            <h1>Connexion</h1>
            <p>Connectez-vous pour accéder à votre espace d'audit.</p>
          </div>

          <form onSubmit={handleSubmit} className="connexion-form">
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="exemple@email.com"
              />
            </div>

            <div className="form-group">
              <div className="password-header">
                <label htmlFor="password">Mot de passe</label>
                <Link to="/mot-de-passe-oublie" className="password-forgot">
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            {erreur && (
              <div className="message-error">
                <span className="error-icon">⚠️</span>
                {erreur}
              </div>
            )}

            <button type="submit" className="btn-connexion" disabled={chargement}>
              {chargement ? "Connexion en cours..." : "Se connecter"}
            </button>

            <p className="form-footer">
              Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
            </p>
          </form>

          <div className="divider">
            <span>ou</span>
          </div>

          <div className="admin-access">
            <div className="admin-access-icon">🔐</div>
            <div className="admin-access-content">
              <strong>Espace Administrateur</strong>
              <p>Accès réservé au CMRPI et aux équipes de gouvernance</p>
            </div>
          </div>
        </div>

        {/* ===== COLONNE DROITE - BRANDING ===== */}
        <div className="connexion-brand">
          <div className="brand-content">
            <div className="brand-icon">🛡️</div>
            <h2>Audit PME</h2>
            <p className="brand-subtitle">Plateforme d'évaluation de maturité cybersécurité</p>

            <div className="brand-features">
              <div className="brand-feature">
                <span className="feature-icon">📋</span>
                <span>29 questions</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">📊</span>
                <span>5 thèmes</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">📈</span>
                <span>Évolution</span>
              </div>
              <div className="brand-feature">
                <span className="feature-icon">📄</span>
                <span>Rapport PDF</span>
              </div>
            </div>

            <div className="brand-standards">
              <span className="standard-tag">ISO 27001</span>
              <span className="standard-tag">NIST CSF</span>
              <span className="standard-tag">Loi 09-08</span>
            </div>

            <div className="brand-footer">
              <span>© 2024 Audit PME - CMRPI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Connexion;