import {
  useEffect,
  useState,
} from "react";

import { getHistoriquePme } from "../api/adminApi";
import "./HistoriquePme.css";


function HistoriquePme({
  pme,
}) {
  const [data, setData] =
    useState(null);

  const [chargement, setChargement] =
    useState(true);

  const [erreur, setErreur] =
    useState("");


  useEffect(() => {
    if (!pme?.id) {
      return;
    }

    setChargement(true);
    setErreur("");

    getHistoriquePme(pme.id)
      .then(setData)
      .catch((error) => {
        setErreur(
          error.response?.data?.detail ||
          "Impossible de charger l'historique."
        );
      })
      .finally(() => {
        setChargement(false);
      });

  }, [pme?.id]);


  if (!pme) {
    return null;
  }


  if (chargement) {
    return (
      <section className="historique-pme">
        <p className="note-info">
          Chargement de l'historique...
        </p>
      </section>
    );
  }


  if (erreur) {
    return (
      <section className="historique-pme">
        <p className="form-error">
          {erreur}
        </p>
      </section>
    );
  }


  const evaluations =
    data?.evaluations || [];


  const dernier =
    evaluations.length
      ? evaluations[evaluations.length - 1]
      : null;


  const premier =
    evaluations.length
      ? evaluations[0]
      : null;


  const evolution =
    premier && dernier
      ? Number(dernier.score) -
        Number(premier.score)
      : 0;


  return (
    <section className="historique-pme">

      <header className="historique-header">
        <div>
          <span className="eyebrow">
            Suivi de maturité
          </span>

          <h2>
            {data?.pme?.nom_entreprise ||
              pme.nom_entreprise}
          </h2>

          <p>
            {data?.pme?.secteur ||
              pme.secteur ||
              "Secteur non renseigné"}
          </p>
        </div>
      </header>


      {/* =================================================
          INDICATEURS
      ================================================= */}

      <div className="historique-metrics">

        <div className="historique-metric">
          <span>
            Score actuel
          </span>

          <strong>
            {dernier?.score ?? "--"}
          </strong>

          <small>
            / 116
          </small>
        </div>


        <div className="historique-metric">
          <span>
            Niveau actuel
          </span>

          <strong>
            {dernier?.niveau_maturite ||
              "--"}
          </strong>
        </div>


        <div className="historique-metric">
          <span>
            Évolution
          </span>

          <strong>
            {evolution > 0
              ? `+${evolution}`
              : evolution}
          </strong>

          <small>
            points
          </small>
        </div>

      </div>


      {/* =================================================
          ÉVOLUTION
      ================================================= */}

      <div className="historique-section">

        <div className="historique-section-title">
          <div>
            <h3>
              Évolution de la maturité
            </h3>

            <p>
              Historique des évaluations
              terminées.
            </p>
          </div>
        </div>


        {evaluations.length === 0 ? (
          <p className="note-info">
            Aucune évaluation terminée
            pour cette PME.
          </p>
        ) : (
          <div className="historique-list">

            {evaluations.map(
              (evaluation, index) => {

                const score =
                  Number(
                    evaluation.score
                  );

                const largeur =
                  Math.min(
                    100,
                    Math.max(
                      0,
                      (score / 116) * 100
                    )
                  );


                const precedent =
                  evaluations[index - 1];


                const variation =
                  precedent
                    ? score -
                      Number(
                        precedent.score
                      )
                    : null;


                return (
                  <article
                    key={evaluation.id}
                    className="historique-item"
                  >

                    <div className="historique-item-top">

                      <div>
                        <strong>
                          Évaluation{" "}
                          {index + 1}
                        </strong>

                        <span>
                          {evaluation.date_fin
                            ? new Date(
                                evaluation.date_fin
                              ).toLocaleDateString(
                                "fr-FR"
                              )
                            : "--"}
                        </span>
                      </div>


                      <div className="historique-score">

                        <strong>
                          {score}
                        </strong>

                        <span>
                          / 116
                        </span>

                      </div>

                    </div>


                    <div className="historique-bar">
                      <div
                        className="historique-bar-fill"
                        style={{
                          width:
                            `${largeur}%`,
                        }}
                      />
                    </div>


                    <div className="historique-item-bottom">

                      <span>
                        {evaluation.niveau_maturite}
                      </span>


                      {variation !== null && (
                        <span
                          className={
                            variation > 0
                              ? "evolution-positive"
                              : variation < 0
                              ? "evolution-negative"
                              : ""
                          }
                        >
                          {variation > 0
                            ? `+${variation}`
                            : variation}{" "}
                          points
                        </span>
                      )}

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </div>

    </section>
  );
}


export default HistoriquePme;