import { Navigate } from "react-router-dom";
import { estConnecte } from "../api/authApi";

/**
 * Empêche l'accès à une page si l'utilisateur n'est pas connecté.
 * Usage : <RouteProtegee><MaPage /></RouteProtegee>
 */
function RouteProtegee({ children }) {
  if (!estConnecte()) {
    return <Navigate to="/connexion" replace />;
  }
  return children;
}

export default RouteProtegee;