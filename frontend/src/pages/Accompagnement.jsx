import { useEffect, useState } from "react";

import {
  creerDemandeSuivi,
  getConsultantsDisponibles,
  getDemandesSuivi,
  supprimerDemandeSuivi,
} from "../api/assistanceApi";

import "./Accompagnement.css";

function Accompagnement() {
  const [demandes, setDemandes] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [consultantSelectionne, setConsultantSelectionne] = useState("");
  const [messageDemande, setMessageDemande] = useState("");

  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);

  // Filtre
  const [filtreStatut, setFiltreStatut] = useState("TOUS");

  // Suppression
  const [demandeASupprimer, setDemandeASupprimer] = useState(null);
  const [suppression, setSuppression] = useState(false);

  useEffect(() => {
    Promise.all([
      getDemandesSuivi(),
      getConsultantsDisponibles(),
    ])
      .then(([listeDemandes, listeConsultants]) => {
        setDemandes(listeDemandes);
        setConsultants(listeConsultants);
      })
      .catch((error) => {
        console.error(error);

        setErreur(
          "Impossible de charger les informations d'accompagnement."
        );
      })
      .finally(() => {
        setChargement(false);
      });
  }, []);

  const envoyer = async (event) => {
    event.preventDefault();

    if (!consultantSelectionne || !messageDemande.trim()) {
      return;
    }

    setEnvoi(true);
    setErreur("");
    setMessage("");

    try {
      const demande = await creerDemandeSuivi(
        consultantSelectionne,
        messageDemande.trim()
      );

      setDemandes((anciennes) => [demande, ...anciennes]);

      setConsultantSelectionne("");
      setMessageDemande("");

      setMessage(
        "Votre demande a été envoyée au consultant sélectionné."
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

  // Ouvre la fenêtre de confirmation
  const demanderSuppression = (demande) => {
    setDemandeASupprimer(demande);
    setErreur("");
  };

  // Ferme la fenêtre
  const annulerSuppression = () => {
    if (suppression) {
      return;
    }

    setDemandeASupprimer(null);
  };

  // Suppression réelle
  const confirmerSuppression = async () => {
    if (!demandeASupprimer) {
      return;
    }

    setSuppression(true);
    setErreur("");

    try {
      await supprimerDemandeSuivi(demandeASupprimer.id);

      setDemandes((anciennes) =>
        anciennes.filter(
          (demande) => demande.id !== demandeASupprimer.id
        )
      );

      setDemandeASupprimer(null);
    } catch (error) {
      console.error(error);

      setErreur(
        error.response?.data?.detail ||
          "La demande n'a pas pu être supprimée."
      );
    } finally {
      setSuppression(false);
    }
  };

  // Demandes filtrées
  const demandesFiltrees = demandes.filter((demande) => {
    if (filtreStatut === "TOUS") {
      return true;
    }

    return demande.statut === filtreStatut;
  });

  if (chargement) {
    return (
      <div className="etat-page">
        Chargement de votre accompagnement...
      </div>
    );
  }

  return (
    <>
      <div className="role-page accompagnement-page">
        <header className="page-heading">
          <div>
            <span className="eyebrow">
              Lien direct avec un expert
            </span>

            <h1>Mon accompagnement</h1>

            <p>
              Choisissez un consultant et présentez-lui votre
              besoin afin de demander un accompagnement.
            </p>
          </div>

          <div className="heading-count">
            <strong>{demandes.length}</strong>
            <span>demandes</span>
          </div>
        </header>

        {erreur && (
          <div className="accompagnement-alert accompagnement-alert-error">
            <span className="alert-icon">!</span>
            <span>{erreur}</span>
          </div>
        )}

        <section className="support-layout">
          {/* =====================================================
              NOUVELLE DEMANDE
          ====================================================== */}

          <form
            className="support-form"
            onSubmit={envoyer}
          >
            <span className="card-kicker">
              Nouvelle demande
            </span>

            <h2>Demander un accompagnement</h2>

            <p className="support-form-intro">
              Sélectionnez le consultant que vous souhaitez
              solliciter puis décrivez votre besoin.
            </p>

            <label htmlFor="consultant">
              Consultant
            </label>

            <select
              id="consultant"
              value={consultantSelectionne}
              onChange={(event) =>
                setConsultantSelectionne(event.target.value)
              }
              disabled={envoi}
              required
            >
              <option value="">
                Sélectionnez un consultant
              </option>

              {consultants.map((consultant) => (
                <option
                  key={consultant.id}
                  value={consultant.id}
                >
                  {consultant.first_name ||
                  consultant.last_name
                    ? `${consultant.first_name || ""} ${
                        consultant.last_name || ""
                      }`.trim()
                    : consultant.username}
                </option>
              ))}
            </select>

            {consultants.length === 0 && (
              <p className="form-note">
                Aucun consultant n'est actuellement disponible.
              </p>
            )}

            <label htmlFor="messageDemande">
              Votre demande
            </label>

            <textarea
              id="messageDemande"
              value={messageDemande}
              onChange={(event) =>
                setMessageDemande(event.target.value)
              }
              placeholder="Ex. Nous avons besoin d'aide pour sécuriser nos sauvegardes..."
              rows={6}
              required
              disabled={envoi}
            />

            <button
              type="submit"
              className="support-submit"
              disabled={
                envoi ||
                !consultantSelectionne ||
                !messageDemande.trim()
              }
            >
              {envoi
                ? "Envoi..."
                : "Envoyer la demande"}
            </button>

            {message && (
              <div className="accompagnement-alert accompagnement-alert-success">
                <span className="alert-icon">✓</span>

                <div>
                  <strong>Demande envoyée</strong>
                  <p>{message}</p>
                </div>
              </div>
            )}
          </form>

          {/* =====================================================
              HISTORIQUE
          ====================================================== */}

          <section className="support-history">
            <div className="history-header">
              <div>
                <span className="section-label">
                  Suivi de vos demandes
                </span>

                <h2>Mes demandes</h2>
              </div>

              <span className="history-count">
                {demandes.length}
              </span>
            </div>

            {/* FILTRE */}

            <div className="status-filters">
              <button
                type="button"
                className={
                  filtreStatut === "TOUS"
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() => setFiltreStatut("TOUS")}
              >
                Toutes
                <span>{demandes.length}</span>
              </button>

              <button
                type="button"
                className={
                  filtreStatut === "EN_ATTENTE"
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() =>
                  setFiltreStatut("EN_ATTENTE")
                }
              >
                En attente
                <span>
                  {
                    demandes.filter(
                      (demande) =>
                        demande.statut === "EN_ATTENTE"
                    ).length
                  }
                </span>
              </button>

              <button
                type="button"
                className={
                  filtreStatut === "ACCEPTEE"
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() =>
                  setFiltreStatut("ACCEPTEE")
                }
              >
                Acceptées
                <span>
                  {
                    demandes.filter(
                      (demande) =>
                        demande.statut === "ACCEPTEE"
                    ).length
                  }
                </span>
              </button>

              <button
                type="button"
                className={
                  filtreStatut === "REFUSEE"
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() =>
                  setFiltreStatut("REFUSEE")
                }
              >
                Refusées
                <span>
                  {
                    demandes.filter(
                      (demande) =>
                        demande.statut === "REFUSEE"
                    ).length
                  }
                </span>
              </button>
            </div>

            {demandesFiltrees.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>

                <h3>
                  {demandes.length === 0
                    ? "Aucune demande"
                    : "Aucune demande avec ce statut"}
                </h3>

                <p>
                  {demandes.length === 0
                    ? "Vos demandes d'accompagnement apparaîtront ici."
                    : "Essayez de sélectionner un autre statut."}
                </p>
              </div>
            ) : (
              <div className="support-list">
                {demandesFiltrees.map((demande) => (
                  <article
                    className="support-item"
                    key={demande.id}
                  >
                    <div className="support-item-top">
                      <span
                        className={`status status-${demande.statut.toLowerCase()}`}
                      >
                        {demande.statut.replace("_", " ")}
                      </span>

                      <div className="support-item-actions">
                        <time>
                          {new Date(
                            demande.date_creation
                          ).toLocaleDateString("fr-FR")}
                        </time>

                        <button
                          type="button"
                          className="delete-request-btn"
                          onClick={() =>
                            demanderSuppression(demande)
                          }
                          title="Supprimer la demande"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>

                    {/* CONSULTANT */}

                    {demande.consultant_nom && (
                      <div className="request-consultant">
                        <span>Consultant</span>

                        <strong>
                          {demande.consultant_nom}
                        </strong>
                      </div>
                    )}

                    {/* MESSAGE */}

                    <p className="support-question">
                      {demande.message}
                    </p>

                    {/* RÉPONSE */}

                    {demande.reponse && (
                      <div className="support-answer">
                        <div className="answer-label">
                          Réponse du consultant
                        </div>

                        <strong>
                          {demande.consultant_nom ||
                            "Consultant"}
                        </strong>

                        <p>{demande.reponse}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>

      {/* =========================================================
          MODALE DE CONFIRMATION
      ========================================================== */}

      {demandeASupprimer && (
        <div
          className="delete-modal-overlay"
          onClick={annulerSuppression}
        >
          <div
            className="delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delete-modal-icon">
              !
            </div>

            <h2>Supprimer cette demande ?</h2>

            <p>
              Cette action supprimera définitivement cette
              demande d'accompagnement de votre historique.
            </p>

            <div className="delete-modal-request">
              <span>Consultant</span>

              <strong>
                {demandeASupprimer.consultant_nom ||
                  "Consultant"}
              </strong>
            </div>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={annulerSuppression}
                disabled={suppression}
              >
                Annuler
              </button>

              <button
                type="button"
                className="modal-delete-btn"
                onClick={confirmerSuppression}
                disabled={suppression}
              >
                {suppression
                  ? "Suppression..."
                  : "Oui, supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Accompagnement;