import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  connexion,
  estConnecte,
  destinationAccueil,
} from "../api/authApi";
import "./Connexion.css";

function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const navigate = useNavigate();

  if (estConnecte()) {
    return (
      <Navigate
        to={destinationAccueil()}
        replace
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErreur("");
    setEnvoi(true);

    try {
      const data = await connexion(email, password);
      navigate(destinationAccueil(data.role));
    } catch {
      setErreur("Email ou mot de passe incorrect.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel connexion-panel">

        <header className="auth-header">
          <span className="eyebrow">
            Audit cybersécurité PME
          </span>

          <h1>Connexion</h1>

          <p className="auth-intro">
            Accédez à votre évaluation de maturité, vos résultats
            et votre accompagnement.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <div className="form-section">
            <div className="form-section-title">
              Vos identifiants
            </div>

            <label>
              Email professionnel

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="exemple@entreprise.com"
                required
                autoComplete="username"
              />
            </label>

            <label>
              Mot de passe

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Votre mot de passe"
                required
                autoComplete="current-password"
              />
            </label>
          </div>

          {erreur && (
            <p className="form-error">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={envoi}
          >
            {envoi ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="connexion-links">
          <p className="auth-switch">
            <Link to="/mot-de-passe-oublie">
              Mot de passe oublié ?
            </Link>
          </p>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <p className="auth-switch">
            Pas encore de compte ?
            <Link to="/inscription">
              Créer mon espace
            </Link>
          </p>
        </div>

      </section>
    </main>
  );
}

export default Connexion;