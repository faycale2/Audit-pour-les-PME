import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
  Link,
} from "react-router-dom";

import {
  getPmesConsultant,
} from "../api/adminApi";

import {
  getDemandesSuivi,
  traiterDemandeSuivi,
  supprimerDemandeSuivi,
  terminerAccompagnement,
} from "../api/assistanceApi";

import {
  getMessagesNonLus,
} from "../api/messagesApi";

import Conversation from "../components/Conversation";
import HistoriquePme from "../components/HistoriquePme";
import "./ConsultantDashboard.css";


function ConsultantDashboard() {

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  const section =
    searchParams.get("section") ||
    "pmes";


  const [pmes, setPmes] =
    useState([]);

  const [demandes, setDemandes] =
    useState([]);

  const [messagesNonLus, setMessagesNonLus] =
    useState(0);

  const [chargement, setChargement] =
    useState(true);

  const [erreur, setErreur] =
    useState("");


  const [
    pmeSelectionnee,
    setPmeSelectionnee,
  ] = useState(null);

  const [
    pmeHistorique,
    setPmeHistorique,
  ] = useState(null);


  const [
    reponses,
    setReponses,
  ] = useState({});


  // ========================================================
  // FILTRE DES DEMANDES
  // ========================================================

  const [
    filtreStatut,
    setFiltreStatut,
  ] = useState("TOUS");


  // ========================================================
  // SUPPRESSION
  // ========================================================

  const [
    demandeASupprimer,
    setDemandeASupprimer,
  ] = useState(null);

  const [
    suppression,
    setSuppression,
  ] = useState(false);

  // ========================================================
  // FIN D'ACCOMPAGNEMENT
  // ========================================================

  const [
    demandePourFinAccompagnement,
    setDemandePourFinAccompagnement,
  ] = useState(null);

  const [
    finAccompagnement,
    setFinAccompagnement,
  ] = useState(false);


  // ========================================================
  // CHARGEMENT DES DONNÉES
  // ========================================================

  useEffect(() => {

    Promise.all([
      getPmesConsultant(),
      getDemandesSuivi(),
      getMessagesNonLus(),
    ])
      .then(
        ([
          listePmes,
          listeDemandes,
          nonLus,
        ]) => {

          setPmes(listePmes || []);

          setDemandes(
            listeDemandes || []
          );

          setMessagesNonLus(
            nonLus?.total || 0
          );


          if (
            listePmes?.length &&
            !pmeSelectionnee
          ) {

            setPmeSelectionnee(
              listePmes[0]
            );

          }

        }
      )
      .catch((error) => {

        console.error(error);

        setErreur(
          error.response?.data?.detail ||
            "Impossible de charger votre espace consultant."
        );

      })
      .finally(() => {

        setChargement(false);

      });

  }, []);


  // ========================================================
  // CHANGER DE SECTION
  // ========================================================

  const changerSection = (
    nouvelleSection
  ) => {

    setSearchParams({
      section: nouvelleSection,
    });

  };


  // ========================================================
  // TRAITER UNE DEMANDE DE SUIVI
  // ========================================================

  const traiter = async (
    demande,
    statut
  ) => {

    const texte =
      reponses[demande.id]?.trim() || "";


    setErreur("");


    try {

      const actualisee =
        await traiterDemandeSuivi(
          demande.id,
          {
            statut,
            reponse: texte,
          }
        );


      // Mettre à jour la demande

      setDemandes(
        (anciennes) =>
          anciennes.map(
            (item) =>
              item.id === demande.id
                ? actualisee
                : item
          )
      );


      // Nettoyer la réponse

      setReponses(
        (anciennes) => ({
          ...anciennes,
          [demande.id]: "",
        })
      );


      // ====================================================
      // SI ACCEPTÉE
      // ====================================================

      if (statut === "ACCEPTEE") {

        try {

          const listePmes =
            await getPmesConsultant();


          setPmes(
            listePmes || []
          );


          if (
            !pmeSelectionnee &&
            listePmes?.length
          ) {

            setPmeSelectionnee(
              listePmes[0]
            );

          }

        } catch (error) {

          console.error(
            "Impossible de recharger les PME :",
            error
          );

        }

      }

    } catch (error) {

      console.error(error);

      setErreur(
        statut === "ACCEPTEE"
          ? "La demande n'a pas pu être acceptée."
          : "La demande n'a pas pu être refusée."
      );

    }

  };


  // ========================================================
  // ACCEPTER
  // ========================================================

  const accepterDemande = (
    demande
  ) => {

    traiter(
      demande,
      "ACCEPTEE"
    );

  };


  // ========================================================
  // REFUSER
  // ========================================================

  const refuserDemande = (
    demande
  ) => {

    traiter(
      demande,
      "REFUSEE"
    );

  };


  // ========================================================
  // OUVRIR LA MODALE DE SUPPRESSION
  // ========================================================

  const demanderSuppression = (
    demande
  ) => {

    setDemandeASupprimer(
      demande
    );

    setErreur("");

  };


  // ========================================================
  // ANNULER LA SUPPRESSION
  // ========================================================

  const annulerSuppression = () => {

    if (suppression) {
      return;
    }

    setDemandeASupprimer(null);

  };


  // ========================================================
  // CONFIRMER LA SUPPRESSION
  // ========================================================

  const confirmerSuppression = async () => {

    if (!demandeASupprimer) {
      return;
    }

    setSuppression(true);
    setErreur("");

    try {

      await supprimerDemandeSuivi(
        demandeASupprimer.id
      );


      setDemandes(
        (anciennes) =>
          anciennes.filter(
            (demande) =>
              demande.id !==
              demandeASupprimer.id
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


  // ========================================================
  // OUVRIR LA MODALE DE FIN D'ACCOMPAGNEMENT
  // ========================================================

  const demanderFinAccompagnement = (demande) => {
    setDemandePourFinAccompagnement(demande);
    setErreur("");
  };

  // ========================================================
  // ANNULER LA FIN D'ACCOMPAGNEMENT
  // ========================================================

  const annulerFinAccompagnement = () => {
    if (finAccompagnement) {
      return;
    }

    setDemandePourFinAccompagnement(null);
  };

  // ========================================================
  // CONFIRMER LA FIN D'ACCOMPAGNEMENT
  // ========================================================

  const confirmerFinAccompagnement = async () => {
    if (!demandePourFinAccompagnement) {
      return;
    }

    setFinAccompagnement(true);
    setErreur("");

    try {
      await terminerAccompagnement(
        demandePourFinAccompagnement.pme_id
      );

      // Retirer la PME du portefeuille actif
      const listePmes = pmes.filter(
        (pme) =>
          pme.id !== demandePourFinAccompagnement.pme_id
      );

      setPmes(listePmes);

      // Si la PME terminée était sélectionnée,
      // sélectionner une autre PME si elle existe.
      if (
        pmeSelectionnee?.id ===
        demandePourFinAccompagnement.pme_id
      ) {
        setPmeSelectionnee(listePmes[0] || null);
      }

      if (
        pmeHistorique?.id ===
        demandePourFinAccompagnement.pme_id
      ) {
        setPmeHistorique(listePmes[0] || null);
      }

      setDemandePourFinAccompagnement(null);
    } catch (error) {
      console.error(error);

      setErreur(
        error.response?.data?.detail ||
          "L'accompagnement n'a pas pu être terminé."
      );
    } finally {
      setFinAccompagnement(false);
    }
  };

  // ========================================================
  // DEMANDES FILTRÉES
  // ========================================================

  const demandesFiltrees =
    demandes.filter((demande) => {

      if (filtreStatut === "TOUS") {
        return true;
      }

      return (
        demande.statut ===
        filtreStatut
      );

    });


  // ========================================================
  // COMPTEURS
  // ========================================================

  const nombreEnAttente =
    demandes.filter(
      (demande) =>
        demande.statut ===
        "EN_ATTENTE"
    ).length;

  const nombreAcceptees =
    demandes.filter(
      (demande) =>
        demande.statut ===
        "ACCEPTEE"
    ).length;

  const nombreRefusees =
    demandes.filter(
      (demande) =>
        demande.statut ===
        "REFUSEE"
    ).length;


  // ========================================================
  // CHARGEMENT
  // ========================================================

  if (chargement) {

    return (
      <div className="etat-page">
        Chargement du portefeuille...
      </div>
    );

  }


  // ========================================================
  // ERREUR
  // ========================================================

  if (erreur) {

    return (
      <div className="etat-page etat-erreur">
        {erreur}
      </div>
    );

  }


  return (

    <>
      <div className="role-page">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="page-heading">

          <div>

            <span className="eyebrow">
              Espace consultant
            </span>


            <h1>

              {section === "pmes" &&
                "Portefeuille PME"}

              {section === "historique" &&
                "Historique PME"}

              {section === "messagerie" &&
                "Messagerie"}

              {section === "demandes" &&
                "Demandes d'accompagnement"}

            </h1>


            <p>

              {section === "pmes" &&
                "Suivez les PME que vous accompagnez."}

              {section === "historique" &&
                "Analysez l'évolution de la maturité de vos PME."}

              {section === "messagerie" &&
                "Échangez directement avec vos PME."}

              {section === "demandes" &&
                "Répondez aux demandes de vos PME."}

            </p>

          </div>


          <strong className="heading-count">
            {pmes.length} PME
          </strong>

        </header>


        {/* =================================================
            MES PME
        ================================================= */}

        {section === "pmes" && (

          <>

            {pmes.length === 0 ? (

              <section className="empty-state">

                <h2>
                  Aucune PME assignée
                </h2>

                <p>
                  Les entreprises qui vous
                  seront attribuées apparaîtront ici.
                </p>

              </section>

            ) : (

              <div className="data-grid">

                {pmes.map((pme) => (

                  <article
                    className="data-card"
                    key={pme.id}
                  >

                    <div className="card-top">

                      <div>

                        <span className="card-kicker">
                          {pme.secteur ||
                            "Secteur non renseigné"}
                        </span>

                        <h2>
                          {pme.nom_entreprise}
                        </h2>

                      </div>


                      <span
                        className={
                          pme.evaluation_en_cours
                            ? "status status-warn"
                            : "status status-ok"
                        }
                      >

                        {pme.evaluation_en_cours
                          ? "Évaluation en cours"
                          : "À jour"}

                      </span>

                    </div>


                    <div className="metric-row">

                      <div>

                        <span>
                          Dernier score
                        </span>

                        <strong>
                          {pme.dernier_score ??
                            "--"}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Maturité
                        </span>

                        <strong>
                          {pme.niveau_maturite ??
                            "--"}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Dernière évaluation
                        </span>

                        <strong>

                          {pme.date_derniere_evaluation
                            ? new Date(
                                pme.date_derniere_evaluation
                              ).toLocaleDateString(
                                "fr-FR"
                              )
                            : "Jamais"}

                        </strong>

                      </div>

                    </div>


                    <div className="card-actions">

                      <button
                        type="button"
                        className="lien-detail"
                        onClick={() => {

                          setPmeHistorique(pme);

                          changerSection(
                            "historique"
                          );

                        }}
                      >
                        Voir l'historique →
                      </button>


                      {pme.derniere_evaluation_id && (

                        <Link
                          to={`/resultats/${pme.derniere_evaluation_id}`}
                        >
                          Derniers résultats
                        </Link>

                      )}

                    </div>

                  </article>

                ))}

              </div>

            )}

          </>

        )}


        {/* =================================================
            HISTORIQUE
        ================================================= */}

        {section === "historique" && (

          <div className="consultant-section">

            {pmes.length === 0 ? (

              <p className="note-info">
                Aucune PME assignée.
              </p>

            ) : (

              <>

                <label className="conversation-selector">

                  PME

                  <select
                    value={
                      pmeHistorique?.id ||
                      ""
                    }
                    onChange={(event) => {

                      const pme =
                        pmes.find(
                          (item) =>
                            String(item.id) ===
                            event.target.value
                        );

                      setPmeHistorique(
                        pme || null
                      );

                    }}
                  >

                    {pmes.map((pme) => (

                      <option
                        key={pme.id}
                        value={pme.id}
                      >
                        {pme.nom_entreprise}
                      </option>

                    ))}

                  </select>

                </label>


                {pmeHistorique ? (

                  <HistoriquePme
                    pme={pmeHistorique}
                  />

                ) : (

                  <p className="note-info">
                    Sélectionnez une PME.
                  </p>

                )}

              </>

            )}

          </div>

        )}


        {/* =================================================
            MESSAGERIE
        ================================================= */}

        {section === "messagerie" && (

          <div className="messagerie-consultant">

            {pmes.length === 0 ? (

              <p className="note-info">
                Aucune PME assignée.
              </p>

            ) : (

              <>

                <label className="conversation-selector">

                  PME

                  <select
                    value={
                      pmeSelectionnee?.id ||
                      ""
                    }
                    onChange={(event) => {

                      const pme =
                        pmes.find(
                          (item) =>
                            String(item.id) ===
                            event.target.value
                        );

                      setPmeSelectionnee(
                        pme || null
                      );

                    }}
                  >

                    {pmes.map((pme) => (

                      <option
                        key={pme.id}
                        value={pme.id}
                      >
                        {pme.nom_entreprise}
                      </option>

                    ))}

                  </select>

                </label>


                {pmeSelectionnee ? (

                  <Conversation
                    pmeId={
                      pmeSelectionnee.id
                    }
                    titre={
                      `Échange avec ${pmeSelectionnee.nom_entreprise}`
                    }
                  />

                ) : (

                  <p className="note-info">
                    Sélectionnez une PME.
                  </p>

                )}

              </>

            )}

          </div>

        )}


        {/* =================================================
            DEMANDES DE SUIVI
        ================================================= */}

        {section === "demandes" && (

          <section className="requests-section">

            {/* =================================================
                FILTRES
            ================================================= */}

            <div className="consultant-request-filters">

              <button
                type="button"
                className={
                  filtreStatut === "TOUS"
                    ? "consultant-filter-btn active"
                    : "consultant-filter-btn"
                }
                onClick={() =>
                  setFiltreStatut("TOUS")
                }
              >
                Toutes

                <span>
                  {demandes.length}
                </span>
              </button>


              <button
                type="button"
                className={
                  filtreStatut === "EN_ATTENTE"
                    ? "consultant-filter-btn active"
                    : "consultant-filter-btn"
                }
                onClick={() =>
                  setFiltreStatut("EN_ATTENTE")
                }
              >
                En attente

                <span>
                  {nombreEnAttente}
                </span>
              </button>


              <button
                type="button"
                className={
                  filtreStatut === "ACCEPTEE"
                    ? "consultant-filter-btn active"
                    : "consultant-filter-btn"
                }
                onClick={() =>
                  setFiltreStatut("ACCEPTEE")
                }
              >
                Acceptées

                <span>
                  {nombreAcceptees}
                </span>
              </button>


              <button
                type="button"
                className={
                  filtreStatut === "REFUSEE"
                    ? "consultant-filter-btn active"
                    : "consultant-filter-btn"
                }
                onClick={() =>
                  setFiltreStatut("REFUSEE")
                }
              >
                Refusées

                <span>
                  {nombreRefusees}
                </span>
              </button>

            </div>


            {/* =================================================
                LISTE
            ================================================= */}

            {demandesFiltrees.length === 0 ? (

              <p className="note-info">
                {demandes.length === 0
                  ? "Aucune demande d'accompagnement."
                  : "Aucune demande avec ce statut."}
              </p>

            ) : (

              demandesFiltrees.map((demande) => (

                <article
                  className="request-card"
                  key={demande.id}
                >

                  <div className="support-item-top">

                    <div>

                      <span className="card-kicker">
                        Demande d'accompagnement
                      </span>

                      <strong>
                        {demande.pme_nom}
                      </strong>

                    </div>


                    <div className="consultant-request-top-right">

                      <span
                        className={`status status-${demande.statut.toLowerCase()}`}
                      >

                        {demande.statut.replace(
                          "_",
                          " "
                        )}

                      </span>

                      {demande.statut === "ACCEPTEE" && (
                        <button
                          type="button"
                          className="consultant-end-btn"
                          onClick={() =>
                            demanderFinAccompagnement(
                              demande
                            )
                          }
                          title="Mettre fin à l'accompagnement"
                        >
                          Mettre fin
                        </button>
                      )}

                      <button
                        type="button"
                        className="consultant-delete-btn"
                        onClick={() =>
                          demanderSuppression(
                            demande
                          )
                        }
                        title="Supprimer la demande"
                      >
                        Supprimer
                      </button>

                    </div>

                  </div>


                  <p className="request-date">

                    Reçue le{" "}

                    {new Date(
                      demande.date_creation
                    ).toLocaleDateString(
                      "fr-FR"
                    )}

                  </p>


                  {/* MESSAGE DE LA PME */}

                  <div className="request-message">

                    <span>
                      Demande de la PME
                    </span>

                    <p>
                      {demande.message}
                    </p>

                  </div>


                  {/* =================================================
                      DEMANDE EN ATTENTE
                  ================================================== */}

                  {demande.statut === "EN_ATTENTE" ? (

                    <div className="request-decision">

                      <label
                        htmlFor={`reponse-${demande.id}`}
                      >
                        Votre réponse
                      </label>


                      <textarea
                        id={`reponse-${demande.id}`}
                        value={
                          reponses[
                            demande.id
                          ] || ""
                        }
                        onChange={(event) =>
                          setReponses(
                            (anciennes) => ({
                              ...anciennes,
                              [demande.id]:
                                event.target.value,
                            })
                          )
                        }
                        placeholder="Ajoutez un message pour la PME (facultatif)..."
                        rows={4}
                      />


                      <div className="request-actions">

                        <button
                          type="button"
                          className="request-btn request-btn-refuse"
                          onClick={() =>
                            refuserDemande(
                              demande
                            )
                          }
                        >
                          Refuser
                        </button>


                        <button
                          type="button"
                          className="request-btn request-btn-accept"
                          onClick={() =>
                            accepterDemande(
                              demande
                            )
                          }
                        >
                          Accepter la demande
                        </button>

                      </div>

                    </div>

                  ) : (

                    /* =================================================
                       DEMANDE DÉJÀ TRAITÉE
                    ================================================== */

                    demande.reponse && (

                      <div className="support-answer">

                        <strong>
                          Votre réponse
                        </strong>

                        <p>
                          {demande.reponse}
                        </p>

                      </div>

                    )

                  )}

                </article>

              ))

            )}

          </section>

        )}

      </div>


      {/* =========================================================
          MODALE DE CONFIRMATION - FIN D'ACCOMPAGNEMENT
      ========================================================== */}

      {demandePourFinAccompagnement && (
        <div
          className="consultant-delete-modal-overlay"
          onClick={annulerFinAccompagnement}
        >
          <div
            className="consultant-delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="consultant-delete-modal-icon">
              !
            </div>

            <h2>
              Mettre fin à l'accompagnement ?
            </h2>

            <p>
              Cette action mettra fin à votre accompagnement
              avec cette PME. La demande et l'historique
              des évaluations seront conservés.
            </p>

            <div className="consultant-delete-modal-request">
              <span>
                PME
              </span>

              <strong>
                {demandePourFinAccompagnement.pme_nom}
              </strong>
            </div>

            <div className="consultant-delete-modal-actions">
              <button
                type="button"
                className="consultant-modal-cancel-btn"
                onClick={annulerFinAccompagnement}
                disabled={finAccompagnement}
              >
                Annuler
              </button>

              <button
                type="button"
                className="consultant-modal-delete-btn"
                onClick={confirmerFinAccompagnement}
                disabled={finAccompagnement}
              >
                {finAccompagnement
                  ? "Traitement..."
                  : "Oui, mettre fin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODALE DE CONFIRMATION
      ========================================================== */}

      {demandeASupprimer && (

        <div
          className="consultant-delete-modal-overlay"
          onClick={annulerSuppression}
        >

          <div
            className="consultant-delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="consultant-delete-modal-icon">
              !
            </div>


            <h2>
              Supprimer cette demande ?
            </h2>


            <p>
              Cette action supprimera définitivement
              cette demande de votre liste.
            </p>


            <div className="consultant-delete-modal-request">

              <span>
                PME
              </span>

              <strong>
                {demandeASupprimer.pme_nom}
              </strong>

            </div>


            <div className="consultant-delete-modal-actions">

              <button
                type="button"
                className="consultant-modal-cancel-btn"
                onClick={annulerSuppression}
                disabled={suppression}
              >
                Annuler
              </button>


              <button
                type="button"
                className="consultant-modal-delete-btn"
                onClick={
                  confirmerSuppression
                }
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


export default ConsultantDashboard;