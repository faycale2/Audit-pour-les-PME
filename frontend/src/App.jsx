import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";

import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import ConsultantDashboard from "./pages/ConsultantDashboard";
import Accompagnement from "./pages/Accompagnement";
import Messages from "./pages/Messages";
import Profil from "./pages/Profil";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import ReinitialiserMotDePasse from "./pages/ReinitialiserMotDePasse";
import AdminAssociations from "./pages/AdminAssociations";
import ChoisirConsultant from "./pages/ChoisirConsultant";
import Questionnaire from "./pages/Questionnaire";
import Resultats from "./pages/Resultats";
import Evolution from "./pages/Evolution";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSeuils from "./pages/AdminSeuils";
import AdminUtilisateurs from "./pages/AdminUtilisateurs";

import RouteProtegee from "./components/RouteProtegee";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>

      {/* ================= PAGES PUBLIQUES ================= */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/connexion"
        element={<Connexion />}
      />

      <Route
        path="/inscription"
        element={<Inscription />}
      />

      <Route
        path="/mot-de-passe-oublie"
        element={<MotDePasseOublie />}
      />

      <Route
        path="/reinitialiser-mot-de-passe"
        element={<ReinitialiserMotDePasse />}
      />


      {/* ================= PME ================= */}

      <Route
        path="/questionnaire"
        element={
          <RouteProtegee rolesAutorises={["PME"]}>
            <Layout>
              <Questionnaire />
            </Layout>
          </RouteProtegee>
        }
      />

      <Route
        path="/resultats/:evaluationId"
        element={
          <RouteProtegee
            rolesAutorises={["PME", "CONSULTANT", "ADMIN"]}
          >
            <Layout>
              <Resultats />
            </Layout>
          </RouteProtegee>
        }
      />

      <Route
        path="/evolution"
        element={
          <RouteProtegee rolesAutorises={["PME"]}>
            <Layout>
              <Evolution />
            </Layout>
          </RouteProtegee>
        }
      />

      <Route
        path="/accompagnement"
        element={
          <RouteProtegee rolesAutorises={["PME"]}>
            <Layout>
              <Accompagnement />
            </Layout>
          </RouteProtegee>
        }
      />

      <Route
        path="/messages"
        element={
          <RouteProtegee rolesAutorises={["PME"]}>
            <Layout>
              <Messages />
            </Layout>
          </RouteProtegee>
        }
      />

      <Route
        path="/choisir-consultant"
        element={
          <RouteProtegee rolesAutorises={["PME"]}>
            <Layout>
              <ChoisirConsultant />
            </Layout>
          </RouteProtegee>
        }
      />


      {/* ================= PROFIL ================= */}

      <Route
        path="/profil"
        element={
          <RouteProtegee>
            <Layout>
              <Profil />
            </Layout>
          </RouteProtegee>
        }
      />


      {/* ================= ADMIN ================= */}

      <Route
        path="/admin"
        element={
          <RouteProtegee rolesAutorises={["ADMIN"]}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </RouteProtegee>
        }
      />

      <Route
        path="/admin/seuils"
        element={
          <RouteProtegee rolesAutorises={["ADMIN"]}>
            <Layout>
              <AdminSeuils />
            </Layout>
          </RouteProtegee>
        }
      />

      <Route
        path="/admin/utilisateurs"
        element={
          <RouteProtegee rolesAutorises={["ADMIN"]}>
            <Layout>
              <AdminUtilisateurs />
            </Layout>
          </RouteProtegee>
        }
      />

      <Route
        path="/admin/associations"
        element={
          <RouteProtegee rolesAutorises={["ADMIN"]}>
            <Layout>
              <AdminAssociations />
            </Layout>
          </RouteProtegee>
        }
      />


      {/* ================= CONSULTANT ================= */}

      <Route
        path="/consultant"
        element={
          <RouteProtegee rolesAutorises={["CONSULTANT"]}>
            <Layout>
              <ConsultantDashboard />
            </Layout>
          </RouteProtegee>
        }
      />


      {/* ================= ROUTE INCONNUE ================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;