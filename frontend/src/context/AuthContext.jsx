// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import { estConnecte, deconnexion } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => estConnecte());
  const [role, setRole] = useState(() => localStorage.getItem("role") || null);

  // Fonction de connexion - appelée après une connexion réussie
  const login = (userRole) => {
    setIsAuthenticated(true);
    setRole(userRole);
  };

  // Fonction de déconnexion
  const logout = () => {
    deconnexion();
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// The hook must stay in this context module to expose the provider's context.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};