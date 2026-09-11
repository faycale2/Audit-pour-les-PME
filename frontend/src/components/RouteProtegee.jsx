import { Navigate } from "react-router-dom";
import { estConnecte } from "../api/authApi";

/**
 * Empêche l'accès à une page si l'utilisateur n'est pas connecté,
 * et optionnellement si son rôle ne fait pas partie de ceux autorisés.
 * Usage : <RouteProtegee rolesAutorises={["ADMIN"]}><AdminDashboard /></RouteProtegee>
 */
function RouteProtegee({ children, rolesAutorises }) {
  if (!estConnecte()) {
    return <Navigate to="/connexion" replace />;
  }

  if (rolesAutorises) {
    const role = localStorage.getItem("role");
    if (!rolesAutorises.includes(role)) {
      const destinations = { ADMIN: "/admin", CONSULTANT: "/consultant", PME: "/questionnaire" };
      return <Navigate to={destinations[role] || "/connexion"} replace />;
    }
  }

  return children;
}

export default RouteProtegee;