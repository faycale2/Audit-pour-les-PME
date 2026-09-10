// src/components/RouteProtegee.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RouteProtegee({ children, allowedRoles = [] }) {
  const { isAuthenticated, role } = useAuth();

  console.log("🔒 RouteProtegee - État:", { isAuthenticated, role });

  if (!isAuthenticated) {
    console.log("❌ Non authentifié, redirection vers /connexion");
    return <Navigate to="/connexion" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    console.log(`❌ Rôle ${role} non autorisé pour cette route`);
    return <Navigate to="/" replace />;
  }

  console.log("✅ Accès autorisé");
  return children;
}

export default RouteProtegee;