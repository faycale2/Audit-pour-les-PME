import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { inscription } from "../api/authApi";
import "./Inscription.css";

function Inscription() {
  const navigate = useNavigate();

  const [role, setRole] = useState("PME");
  const [formulaire, setFormulaire] = useState({
    email: "",
    password: "",
    nom_entreprise: "",
    secteur: "",
    first_name: "",
    last_name: "",
  });

  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const modifier = (event) => {
    const { name, value } = event.target;

    setFormulaire((ancien) => ({
      ...ancien,
      [name]: value,
    }));
  };

  const changerRole = (nouveauRole) => {
    setRole(nouveauRole);
    setErreur("");

    setFormulaire({
      email: "",
      password: "",
      nom_entreprise: "",
      secteur: "",
      first_name: "",
      last_name: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErreur("");
    setEnvoi(true);

    try {
      let donnees;

      if (role === "PME") {
        donnees = {
          role: "PME",
          email: formulaire.email,
          password: formulaire.password,
          nom_entreprise: formulaire.nom_entreprise,
          secteur: formulaire.secteur,
        };
      } else {
        donnees = {
          role: "CONSULTANT",
          email: formulaire.email,
          password: formulaire.password,
          first_name: formulaire.first_name,
          last_name: formulaire.last_name,
        };
      }

      const data = await inscription(donnees);

      if (data.role === "CONSULTANT") {
        navigate("/consultant");
      } else {
        navigate("/questionnaire");
      }
    } catch (error) {
      const details = error.response?.data;

      if (details) {
        if (typeof details === "string") {
          setErreur(details);
        } else if (details.detail) {
          setErreur(details.detail);
        } else {
          setErreur(Object.values(details).flat().join(" "));
        }
      } else {
        setErreur("Impossible de créer le compte.");
      }
    } finally {
      setEnvoi(false);
    }
  };

  return (
  <main className="auth-page">
    <section className="auth-panel">

      <Link to="/" className="back-home-link">
        ← Retour à l'accueil
      </Link>

      <header className="auth-header">
        <div>
          <span className="eyebrow">
            Audit cybersécurité PME
          </span>

          <h1>Créer votre espace</h1>

          <p className="auth-intro">
            Choisissez votre profil pour créer votre compte.
          </p>
        </div>
      </header>

        {/* Choix du profil */}
        <section className="profile-selection">
          <div className="profile-selection-header">
            <div>
              <span className="section-label">Type de compte</span>
              <h2>Vous êtes :</h2>
            </div>

            <p>Sélectionnez votre type de compte.</p>
          </div>

          <div className="profile-cards">

            <button
              type="button"
              className={`profile-card ${
                role === "PME" ? "profile-card-active" : ""
              }`}
              onClick={() => changerRole("PME")}
            >
              <div className="profile-card-top">
                <div className="profile-icon">🏢</div>

                {role === "PME" && (
                  <div className="profile-check">✓</div>
                )}
              </div>

              <div className="profile-card-text">
                <h3>PME</h3>

                <p>
                  Je représente une entreprise et je souhaite
                  évaluer et améliorer sa cybersécurité.
                </p>
              </div>
            </button>

            <button
              type="button"
              className={`profile-card ${
                role === "CONSULTANT" ? "profile-card-active" : ""
              }`}
              onClick={() => changerRole("CONSULTANT")}
            >
              <div className="profile-card-top">
                <div className="profile-icon">👨‍💼</div>

                {role === "CONSULTANT" && (
                  <div className="profile-check">✓</div>
                )}
              </div>

              <div className="profile-card-text">
                <h3>Consultant</h3>

                <p>
                  Je suis consultant ou expert et je souhaite
                  accompagner les PME.
                </p>
              </div>
            </button>

          </div>
        </section>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="auth-form">

          {role === "PME" ? (
            <div className="form-section">
              <div className="form-section-title">
                Informations de l'entreprise
              </div>

              <label>
                Nom de l'entreprise

                <input
                  name="nom_entreprise"
                  value={formulaire.nom_entreprise}
                  onChange={modifier}
                  placeholder="Ex. Tech Solutions"
                  required
                />
              </label>

              <label>
                Secteur d'activité

                <input
                  name="secteur"
                  value={formulaire.secteur}
                  onChange={modifier}
                  placeholder="Ex. conseil, commerce, informatique..."
                />
              </label>
            </div>
          ) : (
            <div className="form-section">
              <div className="form-section-title">
                Informations personnelles
              </div>

              <div className="form-row">
                <label>
                  Prénom

                  <input
                    name="first_name"
                    value={formulaire.first_name}
                    onChange={modifier}
                    placeholder="Votre prénom"
                    required
                  />
                </label>

                <label>
                  Nom

                  <input
                    name="last_name"
                    value={formulaire.last_name}
                    onChange={modifier}
                    placeholder="Votre nom"
                    required
                  />
                </label>
              </div>
            </div>
          )}

          <div className="form-section">
            <div className="form-section-title">
              Identifiants
            </div>

            <label>
              Email professionnel

              <input
                name="email"
                type="email"
                value={formulaire.email}
                onChange={modifier}
                placeholder="exemple@entreprise.com"
                required
              />
            </label>

            <label>
              Mot de passe

              <input
                name="password"
                type="password"
                minLength="8"
                value={formulaire.password}
                onChange={modifier}
                placeholder="Minimum 8 caractères"
                required
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
            {envoi
              ? "Création..."
              : role === "PME"
              ? "Créer mon compte PME"
              : "Créer mon compte consultant"}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            Déjà inscrit ?
            <Link to="/connexion">
              Se connecter
            </Link>
          </p>
        </footer>

      </section>
    </main>
  );
}

export default Inscription;