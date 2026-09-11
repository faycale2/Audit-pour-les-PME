import { useState } from "react";
import { Link } from "react-router-dom";
import { demanderReinitialisation } from "../api/profilApi";

function MotDePasseOublie() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState("");
  const envoyer = async (event) => { event.preventDefault(); const resultat = await demanderReinitialisation(email); setMessage(resultat.detail); };
  return <main className="auth-page"><section className="auth-panel"><span className="eyebrow">Récupération sécurisée</span><h1>Mot de passe oublié</h1><p className="auth-intro">Saisissez votre email. Le token est envoyé dans la console Django en développement.</p><form className="auth-form" onSubmit={envoyer}><label>Email professionnel<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button>Recevoir un token</button></form>{message && <p className="success-message">{message}</p>}<p className="auth-switch"><Link to="/reinitialiser-mot-de-passe">J'ai déjà un token</Link> · <Link to="/connexion">Retour connexion</Link></p></section></main>;
}
export default MotDePasseOublie;
