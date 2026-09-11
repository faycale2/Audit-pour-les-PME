import { useEffect, useState } from "react";

import { getProfil } from "../api/adminApi";
import axiosClient from "../api/axiosClient";
import {
  changerMotDePasse,
  mettreAJourPhoto,
} from "../api/profilApi";

import "./Profil.css";

function Profil() {
  const [profil, setProfil] = useState(null);
  const [photo, setPhoto] = useState(null);

  const [motDePasse, setMotDePasse] = useState({
    ancien_mot_de_passe: "",
    nouveau_mot_de_passe: "",
  });

  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const [chargementPhoto, setChargementPhoto] = useState(false);
  const [chargementMotDePasse, setChargementMotDePasse] = useState(false);

  useEffect(() => {
    getProfil()
      .then(setProfil)
      .catch(() => {
        setErreur("Impossible de charger le profil.");
      });
  }, []);

  /*
   * =========================
   * PHOTO DE PROFIL
   * =========================
   */

  const envoyerPhoto = async (event) => {
    event.preventDefault();

    if (!photo) {
      setErreur("Sélectionnez une image.");
      return;
    }

    setMessage("");
    setErreur("");

    if (!photo.type.startsWith("image/")) {
      setErreur("Sélectionnez un fichier image.");
      return;
    }

    if (photo.size > 5 * 1024 * 1024) {
      setErreur("L'image doit faire moins de 5 Mo.");
      return;
    }

    try {
      setChargementPhoto(true);

      const resultat = await mettreAJourPhoto(photo);

      /*
       * Le backend peut retourner directement le profil,
       * l'objet PME, l'objet consultant ou simplement
       * une réponse contenant photo_url.
       */

      setProfil((ancienProfil) => {
        if (!ancienProfil) {
          return ancienProfil;
        }

        if (resultat?.pme) {
          return {
            ...ancienProfil,
            ...resultat,
            pme: {
              ...ancienProfil.pme,
              ...resultat.pme,
            },
          };
        }

        if (resultat?.consultant) {
          return {
            ...ancienProfil,
            ...resultat,
            consultant: {
              ...ancienProfil.consultant,
              ...resultat.consultant,
            },
          };
        }

        if (resultat?.photo_url) {
          return {
            ...ancienProfil,
            photo_url: resultat.photo_url,
          };
        }

        /*
         * Si le backend retourne directement une chaîne
         * correspondant à l'URL de la photo.
         */
        if (typeof resultat === "string") {
          return {
            ...ancienProfil,
            photo_url: resultat,
          };
        }

        return ancienProfil;
      });

      setPhoto(null);
      setMessage("Photo de profil mise à jour.");

      /*
       * Permet de remettre l'input file à zéro.
       */
      event.target.reset?.();
    } catch (error) {
      setErreur(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "La photo n'a pas pu être envoyée."
      );
    } finally {
      setChargementPhoto(false);
    }
  };

  /*
   * =========================
   * MOT DE PASSE
   * =========================
   */

  const modifierMotDePasse = async (event) => {
    event.preventDefault();

    setMessage("");
    setErreur("");

    try {
      setChargementMotDePasse(true);

      await changerMotDePasse(motDePasse);

      setMotDePasse({
        ancien_mot_de_passe: "",
        nouveau_mot_de_passe: "",
      });

      setMessage("Mot de passe modifié avec succès.");
    } catch (error) {
      setErreur(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Le mot de passe n'a pas pu être modifié."
      );
    } finally {
      setChargementMotDePasse(false);
    }
  };

  /*
   * =========================
   * CHARGEMENT
   * =========================
   */

  if (!profil) {
    return (
      <div className="profile-page-state">
        <div className="profile-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  /*
   * =========================
   * INFORMATIONS DU PROFIL
   * =========================
   */

  const mediaBase = axiosClient.defaults.baseURL.replace(
    /\/api\/?$/,
    ""
  );

  const nomAffiche =
    profil.pme?.nom_entreprise ||
    profil.consultant?.nom ||
    profil.nom ||
    profil.username ||
    "Utilisateur";

  const photoUrl =
  profil.photo_url ||
  profil.pme?.photo_url ||
  null;

  const initiale = nomAffiche
    .slice(0, 1)
    .toUpperCase();

  return (
    <div className="profile-page">
      {/* =========================
          HEADER
      ========================= */}

      <header className="profile-header">
        <div>
          <span className="eyebrow">
            Espace personnel
          </span>

          <h1>Mon profil</h1>

          <p>
            Gérez votre identité, votre photo et la
            sécurité de votre accès.
          </p>
        </div>
      </header>

      {/* =========================
          MESSAGES
      ========================= */}

      {(message || erreur) && (
        <div
          className={
            erreur
              ? "profile-alert error"
              : "profile-alert success"
          }
        >
          <span className="alert-icon">
            {erreur ? "!" : "✓"}
          </span>

          <span>{erreur || message}</span>
        </div>
      )}

      {/* =========================
          CONTENU
      ========================= */}

      <div className="profile-grid">
        {/* =========================
            IDENTITÉ
        ========================= */}

        <section className="profile-card profile-identity-card">
          <div className="profile-card-header">
            <div>
              <span className="card-kicker">
                Identité
              </span>

              <h2>Mon profil</h2>
            </div>
          </div>

          <div className="profile-identity">
            <div className="profile-avatar-large">
              {photoUrl ? (
                <img
                  src={`${mediaBase}${photoUrl}`}
                  alt="Photo de profil"
                />
              ) : (
                <span>{initiale}</span>
              )}
            </div>

            <div className="profile-identity-info">
              <h3>{nomAffiche}</h3>

              <p>{profil.email}</p>

              <span className="profile-role">
                {profil.role || "Utilisateur"}
              </span>
            </div>
          </div>

          {/* =========================
              CHANGEMENT PHOTO
          ========================= */}

          <form
            className="photo-form"
            onSubmit={envoyerPhoto}
          >
            <div className="form-section-title">
              Photo de profil
            </div>

            <p className="form-help">
              JPG, PNG ou WebP · 5 Mo maximum
            </p>

            <label className="file-input-wrapper">
              <span className="file-input-label">
                {photo
                  ? photo.name
                  : "Choisir une nouvelle photo"}
              </span>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const fichier =
                    event.target.files?.[0] || null;

                  setPhoto(fichier);
                  setMessage("");
                  setErreur("");
                }}
                disabled={chargementPhoto}
              />
            </label>

            <button
              type="submit"
              className="profile-primary-button"
              disabled={!photo || chargementPhoto}
            >
              {chargementPhoto
                ? "Enregistrement..."
                : "Enregistrer la photo"}
            </button>
          </form>
        </section>

        {/* =========================
            SÉCURITÉ
        ========================= */}

        <form
          className="profile-card password-card"
          onSubmit={modifierMotDePasse}
        >
          <div className="profile-card-header">
            <div>
              <span className="card-kicker">
                Sécurité
              </span>

              <h2>Changer le mot de passe</h2>

              <p>
                Utilisez un nouveau mot de passe d'au
                moins 8 caractères.
              </p>
            </div>

            <div className="security-icon">
              🔒
            </div>
          </div>

          <div className="password-fields">
            <label>
              <span>Mot de passe actuel</span>

              <input
                type="password"
                value={
                  motDePasse.ancien_mot_de_passe
                }
                onChange={(event) =>
                  setMotDePasse({
                    ...motDePasse,
                    ancien_mot_de_passe:
                      event.target.value,
                  })
                }
                placeholder="Votre mot de passe actuel"
                required
                disabled={chargementMotDePasse}
              />
            </label>

            <label>
              <span>Nouveau mot de passe</span>

              <input
                type="password"
                minLength="8"
                value={
                  motDePasse.nouveau_mot_de_passe
                }
                onChange={(event) =>
                  setMotDePasse({
                    ...motDePasse,
                    nouveau_mot_de_passe:
                      event.target.value,
                  })
                }
                placeholder="Votre nouveau mot de passe"
                required
                disabled={chargementMotDePasse}
              />
            </label>
          </div>

          <div className="password-footer">
            <p>
              Le nouveau mot de passe doit contenir au
              minimum 8 caractères.
            </p>

            <button
              type="submit"
              className="profile-primary-button"
              disabled={chargementMotDePasse}
            >
              {chargementMotDePasse
                ? "Modification..."
                : "Modifier le mot de passe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profil;