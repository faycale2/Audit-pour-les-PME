// src/pages/admin/AdminLayout.jsx - Version professionnelle
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

const navigation = [
  { to: "/admin/dashboard", label: "Tableau de bord", icon: "📊" },
  { to: "/admin/seuils", label: "Seuils de maturité", icon: "⚙️" },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: "👥" },
  { to: "/admin/referentiel", label: "Référentiel", icon: "📚" },
];

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/connexion");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🛡️</div>
          <div className="brand-text">
            <span className="brand-title">Audit PME</span>
            <span className="brand-badge">Admin</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="link-icon">{item.icon}</span>
              <span className="link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <span>🚪</span> Déconnexion
        </button>
      </aside>

      {/* Main content */}
      <main className="admin-content">
        <header className="admin-header">
          <h1>Espace Administration</h1>
          <div className="admin-user">
            <div className="user-avatar">👤</div>
            <div>
              <span className="user-name">Administrateur</span>
              <span className="user-role">CMRPI</span>
            </div>
          </div>
        </header>
        <div className="admin-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;