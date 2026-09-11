import { useEffect, useState } from "react";

import {
  creerAssociation,
  getAssociations,
  getPmes,
  supprimerAssociation,
} from "../api/adminApi";

import { getConsultantsDisponibles } from "../api/assistanceApi";

import "./AdminAssociations.css";

function AdminAssociations() {
  const [associations, setAssociations] = useState([]);
  const [pmes, setPmes] = useState([]);
  const [consultants, setConsultants] = useState([]);

  const [selection, setSelection] = useState({
    pme_id: "",
    consultant_id: "",
  });

  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(false);

  const charger = async () => {
    try {
      setChargement(true);
      setErreur("");

      const [associationsData, pmesData, consultantsData] =
        await Promise.all([
          getAssociations(),
          getPmes(),
          getConsultantsDisponibles(),
        ]);

      setAssociations(associationsData);
      setPmes(pmesData);
      setConsultants(consultantsData);
    } catch (error) {
      console.error(error);
      setErreur("Impossible de charger les associations.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const ajouter = async (event) => {
    event.preventDefault();

    try {
      setActionEnCours(true);
      setErreur("");
      setMessage("");

      await creerAssociation(
        selection.pme_id,
        selection.consultant_id
      );

      setMessage("Association enregistrée.");

      setSelection({
        pme_id: "",
        consultant_id: "",
      });

      await charger();
    } catch (error) {
      console.error(error);

      setErreur(
        error.response?.data?.detail ||
          "Association impossible."
      );
    } finally {
      setActionEnCours(false);
    }
  };

  const supprimer = async (id) => {
    try {
      setActionEnCours(true);
      setErreur("");
      setMessage("");

      await supprimerAssociation(id);

      setAssociations((items) =>
        items.filter((item) => item.id !== id)
      );

      setMessage("Association retirée.");
    } catch (error) {
      console.error(error);

      setErreur("Impossible de retirer cette association.");
    } finally {
      setActionEnCours(false);
    }
  };

  return (
    <div className="associations-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="associations-header">
        <div>
          <span className="eyebrow">
            Pilotage des relations
          </span>

          <h1>Associations PME / consultants</h1>

          <p>
            Attribuez les bons experts aux entreprises et gardez
            une vue claire des suivis.
          </p>
        </div>

        <div className="associations-count">
          <strong>{associations.length}</strong>
          <span>liens actifs</span>
        </div>
      </header>


      {/* =========================
          ALERTES
      ========================= */}

      {erreur && (
        <div className="association-alert alert-error">
          <span>⚠️</span>
          {erreur}
        </div>
      )}

      {message && (
        <div className="association-alert alert-success">
          <span>✓</span>
          {message}
        </div>
      )}


      {/* =========================
          CONTENU
      ========================= */}

      <section className="association-layout">

        {/* =========================
            NOUVELLE ASSOCIATION
        ========================= */}

        <form
          className="association-card association-form"
          onSubmit={ajouter}
        >
          <div className="card-top">
            <div>
              <span className="section-label">
                Gestion
              </span>

              <h2>Nouvelle association</h2>

              <p>
                Sélectionnez une PME et le consultant à lui attribuer.
              </p>
            </div>

            <div className="form-icon">
              🔗
            </div>
          </div>


          <div className="form-fields">

            <label>
              <span>PME</span>

              <select
                value={selection.pme_id}
                onChange={(event) =>
                  setSelection({
                    ...selection,
                    pme_id: event.target.value,
                  })
                }
                required
                disabled={actionEnCours}
              >
                <option value="">
                  Choisir une PME
                </option>

                {pmes.map((pme) => (
                  <option key={pme.id} value={pme.id}>
                    {pme.nom_entreprise} · {pme.email}
                  </option>
                ))}
              </select>
            </label>


            <label>
              <span>Consultant</span>

              <select
                value={selection.consultant_id}
                onChange={(event) =>
                  setSelection({
                    ...selection,
                    consultant_id: event.target.value,
                  })
                }
                required
                disabled={actionEnCours}
              >
                <option value="">
                  Choisir un consultant
                </option>

                {consultants.map((consultant) => (
                  <option
                    key={consultant.id}
                    value={consultant.id}
                  >
                    {consultant.nom} · {consultant.email}
                  </option>
                ))}
              </select>
            </label>

          </div>


          <button
            type="submit"
            className="associate-button"
            disabled={actionEnCours}
          >
            {actionEnCours ? "Association..." : "Associer"}
            <span>→</span>
          </button>

        </form>


        {/* =========================
            ASSOCIATIONS EXISTANTES
        ========================= */}

        <section className="association-card">

          <div className="card-top">
            <div>
              <span className="section-label">
                Suivi
              </span>

              <h2>Suivis actifs</h2>

              <p>
                Consultez les relations actuellement établies.
              </p>
            </div>

            <span className="card-count">
              {associations.length}
            </span>
          </div>


          {chargement ? (
            <div className="association-state">
              <div className="spinner"></div>
              <p>Chargement des associations...</p>
            </div>
          ) : associations.length === 0 ? (
            <div className="association-state empty">
              <div className="empty-icon">🔗</div>

              <h3>Aucune association</h3>

              <p>
                Aucune association PME / consultant pour le moment.
              </p>
            </div>
          ) : (
            <div className="association-list">

              {associations.map((association) => (
                <div
                  className="association-row"
                  key={association.id}
                >

                  <div className="person-block">
                    <div className="person-avatar pme-avatar">
                      🏢
                    </div>

                    <div>
                      <strong>
                        {association.pme_nom}
                      </strong>

                      <small>
                        {association.pme_email}
                      </small>

                      <span className="person-type">
                        PME
                      </span>
                    </div>
                  </div>


                  <div className="relation-arrow">
                    →
                  </div>


                  <div className="person-block">
                    <div className="person-avatar consultant-avatar">
                      👤
                    </div>

                    <div>
                      <strong>
                        {association.consultant.nom}
                      </strong>

                      <small>
                        {association.consultant.email}
                      </small>

                      <span className="person-type">
                        Consultant
                      </span>
                    </div>
                  </div>


                  <button
                    type="button"
                    className="remove-button"
                    onClick={() =>
                      supprimer(association.id)
                    }
                    disabled={actionEnCours}
                  >
                    🗑️
                    <span>Retirer</span>
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>

      </section>

    </div>
  );
}

export default AdminAssociations;