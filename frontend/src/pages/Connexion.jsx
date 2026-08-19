import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connexion } from "../api/authApi";

function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    try {
      await connexion(email, password);
      navigate("/questionnaire");
    } catch {
      setErreur("Email ou mot de passe incorrect.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Mot de passe</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        {erreur && <p style={{ color: "red" }}>{erreur}</p>}
        <button type="submit" style={{ padding: "8px 16px" }}>
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default Connexion;