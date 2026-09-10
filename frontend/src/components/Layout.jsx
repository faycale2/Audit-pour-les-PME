import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout() {
  const { logout } = useAuth();

  return (
    <div>
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        padding: "16px 24px", 
        borderBottom: "1px solid #e5e4e7",
        background: "#fff"
      }}>
        <Link to="/questionnaire" style={{ 
          textDecoration: "none", 
          fontWeight: 600, 
          color: "#0A1628",
          fontSize: "18px"
        }}>
          🛡️ Audit PME
        </Link>
        <button onClick={logout} style={{
          padding: "8px 16px",
          border: "1px solid #e5e4e7",
          borderRadius: "6px",
          background: "transparent",
          cursor: "pointer",
          fontSize: "14px"
        }}>
          Déconnexion
        </button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;