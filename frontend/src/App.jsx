import { Routes, Route, Navigate } from "react-router-dom";
import Connexion from "./pages/Connexion";
import Questionnaire from "./pages/Questionnaire";
import Resultats from "./pages/Resultats";
import Evolution from "./pages/Evolution";
import RouteProtegee from "./components/RouteProtegee";

function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/questionnaire" element={<RouteProtegee><Questionnaire /></RouteProtegee>} />
      <Route path="/resultats/:evaluationId" element={<RouteProtegee><Resultats /></RouteProtegee>} />
      <Route path="/evolution" element={<RouteProtegee><Evolution /></RouteProtegee>} />
      <Route path="/" element={<Navigate to="/connexion" replace />} />
    </Routes>
  );
}

export default App;
