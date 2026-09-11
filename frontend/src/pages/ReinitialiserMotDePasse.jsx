import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { reinitialiserMotDePasse } from "../api/profilApi";

function ReinitialiserMotDePasse() {
  const navigate = useNavigate(); const [donnees, setDonnees] = useState({ token: "", nouveau_mot_de_passe: "" }); const [message, setMessage] = useState(""); const [erreur, setErreur] = useState("");
  const envoyer = async (event) => { event.preventDefault(); try { const resultat = await reinitialiserMotDePasse(donnees); setMessage(resultat.detail); setTimeout(() => navigate("/connexion"), 1200); } catch (error) { setErreur(error.response?.data?.detail || "Token invalide ou expiré."); } };
  return <main className="auth-page"><section className="auth-panel"><span className="eyebrow">Récupération sécurisée</span><h1>Nouveau mot de passe</h1><form className="auth-form" onSubmit={envoyer}><label>Token reçu<input value={donnees.token} onChange={(event) => setDonnees({ ...donnees, token: event.target.value })} required /></label><label>Nouveau mot de passe<input type="password" minLength="8" value={donnees.nouveau_mot_de_passe} onChange={(event) => setDonnees({ ...donnees, nouveau_mot_de_passe: event.target.value })} required /></label><button>Réinitialiser</button></form>{message && <p className="success-message">{message}</p>}{erreur && <p className="form-error">{erreur}</p>}<p className="auth-switch"><Link to="/connexion">Retour connexion</Link></p></section></main>;
}
export default ReinitialiserMotDePasse;
