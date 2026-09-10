// src/pages/admin/GestionSeuils.jsx
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./GestionSeuils.css"; // 👈 Import du CSS séparé

function GestionSeuils() {
  const [seuils, setSeuils] = useState({
    seuil_niveau2: 24,
    seuil_niveau3: 47,
    seuil_niveau4: 70,
    seuil_niveau5: 93,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function fetchSeuils() {
      try {
        const { data } = await axiosClient.get("/admin/seuils/");
        setSeuils(data);
      } catch {
        setMessage({ type: "error", text: "Erreur de chargement" });
      } finally {
        setLoading(false);
      }
    }
    fetchSeuils();
  }, []);

  const handleChange = (e) => {
    setSeuils({
      ...seuils,
      [e.target.name]: parseInt(e.target.value) || 0,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await axiosClient.put("/admin/seuils/", seuils);
      setMessage({ type: "success", text: "Seuils mis à jour avec succès !" });
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="gestion-seuils">
      <div className="seuils-header">
        <h2>Configuration des seuils de maturité</h2>
        <p>
          Définissez les bornes pour chaque niveau de maturité (1 à 5).
          Les seuils doivent être croissants et compris entre 0 et 116.
        </p>
      </div>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="seuils-grid">
        <div className="seuil-card">
          <label>Niveau 1 → Niveau 2</label>
          <div className="seuil-input">
            <input
              type="number"
              name="seuil_niveau2"
              value={seuils.seuil_niveau2}
              onChange={handleChange}
              min="0"
              max="116"
            />
            <span className="arrow">📈</span>
          </div>
          <small>Score minimum pour atteindre le Niveau 2</small>
        </div>

        <div className="seuil-card">
          <label>Niveau 2 → Niveau 3</label>
          <div className="seuil-input">
            <input
              type="number"
              name="seuil_niveau3"
              value={seuils.seuil_niveau3}
              onChange={handleChange}
              min="0"
              max="116"
            />
            <span className="arrow">📈</span>
          </div>
          <small>Score minimum pour atteindre le Niveau 3</small>
        </div>

        <div className="seuil-card">
          <label>Niveau 3 → Niveau 4</label>
          <div className="seuil-input">
            <input
              type="number"
              name="seuil_niveau4"
              value={seuils.seuil_niveau4}
              onChange={handleChange}
              min="0"
              max="116"
            />
            <span className="arrow">📈</span>
          </div>
          <small>Score minimum pour atteindre le Niveau 4</small>
        </div>

        <div className="seuil-card">
          <label>Niveau 4 → Niveau 5</label>
          <div className="seuil-input">
            <input
              type="number"
              name="seuil_niveau5"
              value={seuils.seuil_niveau5}
              onChange={handleChange}
              min="0"
              max="116"
            />
            <span className="arrow">📈</span>
          </div>
          <small>Score minimum pour atteindre le Niveau 5</small>
        </div>
      </div>

      <div className="seuils-visual">
        <h4>Visualisation des niveaux</h4>
        <div className="barre-seuils">
          <div className="barre-segment" style={{ width: `${(seuils.seuil_niveau2 / 116) * 100}%` }}>
            Niv 1
          </div>
          <div className="barre-segment" style={{ width: `${((seuils.seuil_niveau3 - seuils.seuil_niveau2) / 116) * 100}%` }}>
            Niv 2
          </div>
          <div className="barre-segment" style={{ width: `${((seuils.seuil_niveau4 - seuils.seuil_niveau3) / 116) * 100}%` }}>
            Niv 3
          </div>
          <div className="barre-segment" style={{ width: `${((seuils.seuil_niveau5 - seuils.seuil_niveau4) / 116) * 100}%` }}>
            Niv 4
          </div>
          <div className="barre-segment" style={{ width: `${((116 - seuils.seuil_niveau5) / 116) * 100}%` }}>
            Niv 5
          </div>
        </div>
      </div>

      <button className="btn-save" onClick={handleSave} disabled={saving}>
        {saving ? "Enregistrement..." : "💾 Enregistrer les seuils"}
      </button>
    </div>
  );
}

export default GestionSeuils;