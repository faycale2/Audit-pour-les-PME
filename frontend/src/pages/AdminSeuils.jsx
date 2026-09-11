
import { useEffect, useState } from "react";
import { getSeuils, updateSeuils } from "../api/adminApi";
import "./AdminSeuils.css";

function AdminSeuils() {
  const [seuils, setSeuils] = useState({
    seuil_niveau2: 24,
    seuil_niveau3: 47,
    seuil_niveau4: 70,
    seuil_niveau5: 93,
  });

  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => {
    const chargerSeuils = async () => {
      try {
        setChargement(true);
        setErreur("");

        const data = await getSeuils();
        setSeuils(data);
      } catch (error) {
        setErreur("Impossible de charger les seuils.");
      } finally {
        setChargement(false);
      }
    };

    chargerSeuils();
  }, []);

  const handleChange = (nom, valeur) => {
    setSeuils((anciens) => ({
      ...anciens,
      [nom]: Number(valeur),
    }));

    setMessage("");
    setErreur("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setErreur("");

    const valeurs = [
      seuils.seuil_niveau2,
      seuils.seuil_niveau3,
      seuils.seuil_niveau4,
      seuils.seuil_niveau5,
    ];

    const croissants = valeurs.every(
      (valeur, index) =>
        index === 0 || valeur > valeurs[index - 1]
    );

    if (!croissants) {
      setErreur(
        "Les seuils doivent être strictement croissants."
      );
      return;
    }

    try {
      setEnregistrement(true);

      const data = await updateSeuils(seuils);

      setSeuils(data);
      setMessage("Les seuils ont été mis à jour avec succès.");
    } catch (error) {
      setErreur(
        error.response?.data?.detail ||
          "Impossible de mettre à jour les seuils."
      );
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <div className="seuils-page">
      <header className="seuils-header">
        <span className="seuils-eyebrow">Moteur de scoring</span>

        <h1>Seuils de maturité</h1>

        <p>
          Définissez les bornes utilisées pour classer les
          résultats des PME.
        </p>
      </header>

      {message && (
        <div className="seuils-alert seuils-alert-success">
          ✓ {message}
        </div>
      )}

      {erreur && (
        <div className="seuils-alert seuils-alert-error">
          {erreur}
        </div>
      )}

      <div className="seuils-card">
        <div className="seuils-card-header">
          <h2>Configuration des seuils</h2>
          <p>
            Chaque niveau commence à partir du score indiqué.
          </p>
        </div>

        {chargement ? (
          <div className="seuils-loading">
            <div className="seuils-spinner"></div>
            <p>Chargement des seuils...</p>
          </div>
        ) : (
          <form
            className="seuils-form"
            onSubmit={handleSubmit}
          >
            <div className="seuils-grid">
              {Object.entries(seuils).map(
                ([nom, valeur], index) => (
                  <div className="seuils-field" key={nom}>
                    <label htmlFor={nom}>
                      Niveau {index + 2}
                    </label>

                    <div className="seuils-input-wrapper">
                      <input
                        id={nom}
                        type="number"
                        min="0"
                        max="100"
                        value={valeur}
                        onChange={(e) =>
                          handleChange(
                            nom,
                            e.target.value
                          )
                        }
                      />

                      <span>/ 100</span>
                    </div>

                    <small>
                      Début du niveau {index + 2}
                    </small>
                  </div>
                )
              )}
            </div>

            <div className="seuils-footer">
              <p>
                Les valeurs doivent être strictement
                croissantes.
              </p>

              <button
                type="submit"
                className="seuils-button"
                disabled={enregistrement}
              >
                {enregistrement
                  ? "Enregistrement..."
                  : "Enregistrer les seuils"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminSeuils;

