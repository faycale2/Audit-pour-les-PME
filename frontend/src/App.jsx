// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RouteProtegee from "./components/RouteProtegee";
import Layout from "./components/Layout";
import Chatbot from "./components/Chatbot";

// Pages publiques
import Accueil from "./pages/Accueil";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";

// Pages PME
import Questionnaire from "./pages/Questionnaire";
import Resultats from "./pages/Resultats";
import Evolution from "./pages/Evolution";

// Pages Admin
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import GestionSeuils from "./pages/admin/GestionSeuils";
import GestionUtilisateurs from "./pages/admin/GestionUtilisateurs";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Accueil />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />

        {/* Routes protégées (Layout avec header) */}
        <Route element={<Layout />}>
          <Route path="/questionnaire" element={
            <RouteProtegee allowedRoles={["PME"]}>
              <Questionnaire />
            </RouteProtegee>
          } />
          <Route path="/resultats/:evaluationId" element={
            <RouteProtegee allowedRoles={["PME"]}>
              <Resultats />
            </RouteProtegee>
          } />
          <Route path="/evolution" element={
            <RouteProtegee allowedRoles={["PME"]}>
              <Evolution />
            </RouteProtegee>
          } />
        </Route>

        {/* Routes Admin */}
        <Route path="/admin" element={
          <RouteProtegee allowedRoles={["ADMIN"]}>
            <AdminLayout />
          </RouteProtegee>
        }>
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="seuils" element={<GestionSeuils />} />
          <Route path="utilisateurs" element={<GestionUtilisateurs />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>

      {/* Chatbot - visible partout sauf sur la page admin */}
      <Chatbot />
    </AuthProvider>
  );
}

export default App;
