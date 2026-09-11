
import { useEffect, useMemo, useState } from "react";
import "./AdminUtilisateurs.css";

import {
  getUtilisateurs,
  modifierRole,
  supprimerUtilisateur,
} from "../api/adminApi";

function AdminUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);

  const [utilisateurRole, setUtilisateurRole] = useState(null);
  const [nouveauRole, setNouveauRole] = useState("");

  const [utilisateurASupprimer, setUtilisateurASupprimer] = useState(null);
  const [actionEnCours, setActionEnCours] = useState(false);

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  const chargerUtilisateurs = async () => {
    try {
      setChargement(true);
      setErreur("");

      const data = await getUtilisateurs();
      setUtilisateurs(data);
    } catch (error) {
      console.error(error);
      setErreur("Impossible de charger les utilisateurs.");
    } finally {
      setChargement(false);
    }
  };

  const utilisateursFiltres = useMemo(() => {
    const terme = recherche.toLowerCase().trim();

    if (!terme) {
      return utilisateurs;
    }

    return utilisateurs.filter(
      (u) =>
        u.username?.toLowerCase().includes(terme) ||
        u.email?.toLowerCase().includes(terme) ||
        u.role?.toLowerCase().includes(terme)
    );
  }, [utilisateurs, recherche]);

  // =========================
  // MODIFICATION DU ROLE
  // =========================

  const demanderModificationRole = (utilisateur, role) => {
    if (role === utilisateur.role) {
      return;
    }

    setUtilisateurRole(utilisateur);
    setNouveauRole(role);
    setErreur("");
    setMessage("");
  };

  const confirmerModificationRole = async () => {
    if (!utilisateurRole) return;

    try {
      setActionEnCours(true);
      setErreur("");
      setMessage("");

      const utilisateur = await modifierRole(
        utilisateurRole.id,
        nouveauRole
      );

      setUtilisateurs((anciens) =>
        anciens.map((item) =>
          item.id === utilisateurRole.id ? utilisateur : item
        )
      );

      setMessage(
        `Le rôle de ${utilisateurRole.username} a été modifié avec succès.`
      );

      setUtilisateurRole(null);
      setNouveauRole("");
    } catch (error) {
      console.error(error);
      setErreur("Le rôle n'a pas pu être modifié.");
    } finally {
      setActionEnCours(false);
    }
  };

  // =========================
  // SUPPRESSION
  // =========================

  const demanderSuppression = (utilisateur) => {
    setErreur("");
    setMessage("");
    setUtilisateurASupprimer(utilisateur);
  };

  const annulerSuppression = () => {
    if (actionEnCours) return;

    setUtilisateurASupprimer(null);
  };

  const confirmerSuppression = async () => {
    if (!utilisateurASupprimer) return;

    try {
      setActionEnCours(true);
      setErreur("");
      setMessage("");

      await supprimerUtilisateur(utilisateurASupprimer.id);

      setUtilisateurs((anciens) =>
        anciens.filter(
          (item) => item.id !== utilisateurASupprimer.id
        )
      );

      setMessage(
        `Le compte de ${utilisateurASupprimer.username} a été supprimé.`
      );

      setUtilisateurASupprimer(null);
    } catch (error) {
      console.error(error);
      setErreur("Impossible de supprimer cet utilisateur.");
    } finally {
      setActionEnCours(false);
    }
  };

  // =========================
  // OUTILS
  // =========================

  const getInitiales = (username = "") => {
    return username
      .split(" ")
      .map((mot) => mot.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "ADMIN":
        return "role-badge role-admin";

      case "CONSULTANT":
        return "role-badge role-consultant";

      case "PME":
        return "role-badge role-pme";

      default:
        return "role-badge";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "Administrateur";

      case "CONSULTANT":
        return "Consultant";

      case "PME":
        return "PME";

      default:
        return role;
    }
  };

  return (
    <div className="users-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="users-header">
        <div>
          <span className="eyebrow">Administration</span>

          <h1>Utilisateurs</h1>

          <p>
            Gérez les comptes, les responsabilités et les niveaux
            d'accès de votre plateforme.
          </p>
        </div>

        <div className="users-count">
          <strong>{utilisateurs.length}</strong>
          <span>comptes</span>
        </div>
      </header>

      {/* =========================
          MESSAGES
      ========================= */}

      {erreur && (
        <div className="alert alert-error">
          <span>⚠️</span>
          {erreur}
        </div>
      )}

      {message && (
        <div className="alert alert-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {/* =========================
          TOOLBAR
      ========================= */}

      <div className="users-toolbar">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>

        <div className="results-count">
          {utilisateursFiltres.length} utilisateur
          {utilisateursFiltres.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="users-card">
        {chargement ? (
          <div className="loading-state">
            <div className="spinner"></div>

            <p>Chargement des utilisateurs...</p>
          </div>
        ) : utilisateursFiltres.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>

            <h3>Aucun utilisateur trouvé</h3>

            <p>
              Aucun compte ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="users-table">

              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {utilisateursFiltres.map((u) => (
                  <tr key={u.id}>

                    {/* UTILISATEUR */}

                    <td>
                      <div className="user-info">

                        <div className="user-avatar">
                          {getInitiales(u.username)}
                        </div>

                        <div>
                          <strong>{u.username}</strong>

                          <span>
                            ID #{u.id}
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* EMAIL */}

                    <td>
                      <span className="email">
                        {u.email}
                      </span>
                    </td>

                    {/* ROLE */}

                    <td>
                      <div className="role-wrapper">

                        <span className={getRoleClass(u.role)}>
                          {getRoleLabel(u.role)}
                        </span>

                        <select
                          value={u.role}
                          onChange={(e) =>
                            demanderModificationRole(
                              u,
                              e.target.value
                            )
                          }
                          className="role-select"
                          disabled={actionEnCours}
                        >
                          <option value="PME">
                            PME
                          </option>

                          <option value="CONSULTANT">
                            Consultant
                          </option>

                          <option value="ADMIN">
                            Administrateur
                          </option>
                        </select>

                      </div>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="actions">

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() =>
                            demanderSuppression(u)
                          }
                          disabled={actionEnCours}
                          title="Supprimer l'utilisateur"
                        >
                          🗑️
                          <span>Supprimer</span>
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          MODALE MODIFICATION DU ROLE
      ===================================================== */}

      {utilisateurRole && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(15, 23, 42, 0.60)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999998,
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "420px",
              maxWidth: "100%",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "30px",
              boxSizing: "border-box",
              boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
              textAlign: "center",
            }}
          >

            <div
              style={{
                width: "55px",
                height: "55px",
                margin: "0 auto 18px",
                borderRadius: "50%",
                background: "#eef2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "25px",
              }}
            >
              ✏️
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                color: "#172033",
              }}
            >
              Modifier le rôle
            </h2>

            <p
              style={{
                margin: "0 0 24px",
                color: "#64748b",
                lineHeight: "1.6",
              }}
            >
              Voulez-vous vraiment modifier le rôle de{" "}
              <strong>
                {utilisateurRole.username}
              </strong>{" "}
              ?
            </p>

            <div className="role-change">
              <div>
                <span>Rôle actuel</span>

                <strong>
                  {getRoleLabel(
                    utilisateurRole.role
                  )}
                </strong>
              </div>

              <span className="arrow">
                →
              </span>

              <div>
                <span>Nouveau rôle</span>

                <strong>
                  {getRoleLabel(nouveauRole)}
                </strong>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "25px",
              }}
            >
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setUtilisateurRole(null);
                  setNouveauRole("");
                }}
                disabled={actionEnCours}
              >
                Annuler
              </button>

              <button
                type="button"
                className="confirm-btn"
                onClick={confirmerModificationRole}
                disabled={actionEnCours}
              >
                {actionEnCours
                  ? "Modification..."
                  : "Confirmer"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          MODALE SUPPRESSION
      ===================================================== */}

      {utilisateurASupprimer && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              annulerSuppression();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2147483647,
            padding: "20px",
            boxSizing: "border-box",
          }}
        >

          {/* PETITE FENÊTRE CENTRÉE */}

          <div
            style={{
              width: "380px",
              maxWidth: "calc(100vw - 40px)",
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              padding: "28px",
              boxSizing: "border-box",
              boxShadow:
                "0 25px 80px rgba(0, 0, 0, 0.30)",
              textAlign: "center",
              position: "relative",
            }}
          >

            {/* ICONE */}

            <div
              style={{
                width: "58px",
                height: "58px",
                margin: "0 auto 18px",
                borderRadius: "50%",
                backgroundColor: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "27px",
              }}
            >
              🗑️
            </div>

            {/* TITRE */}

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "21px",
                fontWeight: "700",
                color: "#172033",
              }}
            >
              Supprimer l'utilisateur ?
            </h2>

            {/* MESSAGE */}

            <p
              style={{
                margin: "0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#64748b",
              }}
            >
              Voulez-vous vraiment supprimer le compte de{" "}
              <strong
                style={{
                  color: "#172033",
                }}
              >
                {utilisateurASupprimer.username}
              </strong>{" "}
              ?
            </p>

            {/* AVERTISSEMENT */}

            <div
              style={{
                marginTop: "18px",
                padding: "11px 14px",
                borderRadius: "10px",
                backgroundColor: "#fff7ed",
                color: "#c2410c",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              ⚠️ Cette action est irréversible.
            </div>

            {/* BOUTONS */}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginTop: "24px",
              }}
            >

              <button
                type="button"
                onClick={annulerSuppression}
                disabled={actionEnCours}
                style={{
                  minWidth: "105px",
                  padding: "11px 18px",
                  border: "1px solid #d1d5db",
                  borderRadius: "9px",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: actionEnCours
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={confirmerSuppression}
                disabled={actionEnCours}
                style={{
                  minWidth: "135px",
                  padding: "11px 18px",
                  border: "none",
                  borderRadius: "9px",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: actionEnCours
                    ? "not-allowed"
                    : "pointer",
                  opacity: actionEnCours ? 0.7 : 1,
                }}
              >
                {actionEnCours
                  ? "Suppression..."
                  : "Oui, supprimer"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminUtilisateurs;

