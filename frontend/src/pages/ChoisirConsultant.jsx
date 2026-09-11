import { useEffect, useState } from "react";

import {
  creerDemandeSuivi,
  getConsultantsDisponibles,
  getDemandesSuivi,
} from "../api/assistanceApi";

import "./ChoisirConsultant.css";

function ChoisirConsultant() {
  const [consultants, setConsultants] = useState([]);
  const [demandes, setDemandes] = useState([]);

  const [choix, setChoix] = useState("");
  const [messageDemande, setMessageDemande] = useState("");

  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);

  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const chargerDonnees = async () => {
      setChargement(true);
      setErreur("");

      try {
        const [consultantsData, demandesData] =
          await Promise.all([
            getConsultantsDisponibles(),
            getDemandesSuivi(),
          ]);

        setConsultants(consultantsData || []);
        setDemandes(demandesData || []);
      } catch (error) {
        console.error(error);

        setErreur(
          error.response?.data?.detail ||
            "Impossible de charger les informations."
        );
      } finally {
        setChargement(false);
      }
    };

    chargerDonnees();
  }, []);

  /*
   * Dernière demande de suivi
   *
   * Les statuts du backend sont :
   * EN_ATTENTE
   * ACCEPTEE
   * REFUSEE
   */
  const demandeActuelle =
    demandes.length > 0 ? demandes[0] : null;

  const statut = demandeActuelle?.statut || null;

  const envoyer = async (event) => {
    event.preventDefault();

    if (!choix) {
      setErreur("Veuillez sélectionner un consultant.");
      return;
    }

    if (!messageDemande.trim()) {
      setErreur("Veuillez décrire votre besoin.");
      return;
    }

    setEnvoi(true);
    setMessage("");
    setErreur("");

    try {
      const nouvelleDemande = await creerDemandeSuivi(
        choix,
        messageDemande.trim()
      );

      setDemandes((anciennes) => [
        nouvelleDemande,
        ...anciennes,
      ]);

      setChoix("");
      setMessageDemande("");

      setMessage(
        "Votre demande d'accompagnement a été envoyée au consultant."
      );
    } catch (error) {
      console.error(error);

      setErreur(
        error.response?.data?.detail ||
          "La demande n'a pas pu être envoyée."
      );
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) {
    return (
      <div className="consultant-page">
        <div className="consultant-loading">
          <div className="consultant-spinner" />

          <p>
            Chargement de votre accompagnement...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Récupérer le nom du consultant de la demande actuelle
   */
  const consultantActuel = demandeActuelle
    ? {
        nom:
          demandeActuelle.consultant_nom ||
          "Consultant",
        email: "",
      }
    : null;

  return (
    <div className="consultant-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="consultant-hero">
        <div className="consultant-eyebrow">
          ACCOMPAGNEMENT PERSONNALISÉ
        </div>

        <h1>
          Votre accompagnement
          <br />
          <span>cybersécurité</span>
        </h1>

        <p>
          Choisissez un expert qui pourra vous accompagner
          dans l'amélioration de la sécurité de votre PME.
        </p>
      </header>


      {/* =====================================================
          ERREUR
      ====================================================== */}

      {erreur && (
        <div className="consultant-alert consultant-alert-error">
          <span className="alert-icon">!</span>

          <div>
            <strong>Une erreur est survenue</strong>

            <p>{erreur}</p>
          </div>
        </div>
      )}


      {/* =====================================================
          DEMANDE ACTUELLE
      ====================================================== */}

      {demandeActuelle && (
        <section className="consultant-current-card">

          <div className="current-header">

            <div>
              <span className="section-label">
                MA DEMANDE
              </span>

              <h2>
                {statut === "EN_ATTENTE"
                  ? "Demande en attente"
                  : statut === "ACCEPTEE"
                  ? "Accompagnement actif"
                  : statut === "REFUSEE"
                  ? "Demande refusée"
                  : "Votre demande"}
              </h2>
            </div>

            {statut && (
              <span
                className={`status-badge status-${statut.toLowerCase()}`}
              >
                {statut === "EN_ATTENTE" &&
                  "● En attente"}

                {statut === "ACCEPTEE" &&
                  "● Accompagnement actif"}

                {statut === "REFUSEE" &&
                  "● Demande refusée"}
              </span>
            )}
          </div>


          <div className="consultant-profile">

            <div className="consultant-avatar">
              {consultantActuel?.nom
                ?.charAt(0)
                ?.toUpperCase() || "C"}
            </div>

            <div className="consultant-info">

              <h3>
                {consultantActuel?.nom}
              </h3>

              <span>
                Expert en cybersécurité
              </span>

            </div>
          </div>


          {/* MESSAGE ENVOYÉ */}

          {demandeActuelle.message && (
            <div className="pending-message">
              <strong>Votre demande</strong>

              <p>
                {demandeActuelle.message}
              </p>
            </div>
          )}


          {/* EN ATTENTE */}

          {statut === "EN_ATTENTE" && (
            <div className="pending-message">

              <strong>
                Demande en attente
              </strong>

              <p>
                Votre demande a été envoyée au consultant.
                Vous serez informé dès qu'il aura accepté
                ou refusé votre demande.
              </p>

            </div>
          )}


          {/* ACCEPTÉE */}

          {statut === "ACCEPTEE" && (
            <div className="accepted-message">

              <strong>
                Votre accompagnement est actif
              </strong>

              <p>
                Le consultant a accepté votre demande.
                Vous pouvez maintenant échanger avec lui
                et bénéficier de votre accompagnement.
              </p>

            </div>
          )}


          {/* REFUSÉE */}

          {statut === "REFUSEE" && (
            <div className="rejected-message">

              <strong>
                Le consultant n'a pas accepté votre demande.
              </strong>

              <p>
                Vous pouvez sélectionner un autre consultant
                disponible.
              </p>

            </div>
          )}

        </section>
      )}


      {/* =====================================================
          CHOIX DU CONSULTANT
      ====================================================== */}

      {(!demandeActuelle ||
        statut === "REFUSEE") && (
        <section className="consultant-choice-card">

          <div className="choice-header">

            <span className="section-label">
              CHOISIR UN CONSULTANT
            </span>

            <h2>
              Trouvez votre expert
            </h2>

            <p>
              Sélectionnez le consultant qui correspond
              le mieux aux besoins de votre entreprise.
            </p>

          </div>


          <form onSubmit={envoyer}>

            {/* CONSULTANT */}

            <div className="consultant-field">

              <label htmlFor="consultant">
                Consultant disponible
              </label>

              <select
                id="consultant"
                value={choix}
                onChange={(event) =>
                  setChoix(event.target.value)
                }
                disabled={envoi}
                required
              >

                <option value="">
                  Sélectionner un consultant
                </option>

                {consultants.map((consultant) => (
                  <option
                    value={consultant.id}
                    key={consultant.id}
                  >
                    {consultant.first_name ||
                    consultant.last_name
                      ? `${consultant.first_name || ""} ${
                          consultant.last_name || ""
                        }`.trim()
                      : consultant.username}
                    {" · "}
                    {consultant.email}
                  </option>
                ))}

              </select>

            </div>


            {/* MESSAGE */}

            <div className="consultant-field">

              <label htmlFor="messageDemande">
                Présentez votre besoin
              </label>

              <textarea
                id="messageDemande"
                value={messageDemande}
                onChange={(event) =>
                  setMessageDemande(event.target.value)
                }
                placeholder="Expliquez brièvement pourquoi vous souhaitez être accompagné par ce consultant..."
                rows={5}
                disabled={envoi}
                required
              />

            </div>


            {/* BOUTON */}

            <button
              type="submit"
              disabled={
                envoi ||
                !choix ||
                !messageDemande.trim()
              }
              className="consultant-submit"
            >
              {envoi
                ? "Envoi de la demande..."
                : "Envoyer la demande"}
            </button>

          </form>


          {/* SUCCÈS */}

          {message && (
            <div className="consultant-alert consultant-alert-success">

              <span className="alert-icon">
                ✓
              </span>

              <div>

                <strong>
                  Demande envoyée
                </strong>

                <p>
                  {message}
                </p>

              </div>

            </div>
          )}

        </section>
      )}

    </div>
  );
}

export default ChoisirConsultant;