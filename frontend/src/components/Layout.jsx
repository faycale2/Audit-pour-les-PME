import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatbotWidget from "./ChatbotWidget";
import "./Layout.css";

function Layout({ children }) {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        menuOuvert={menuOuvert}
        onToggle={() => setMenuOuvert((ouvert) => !ouvert)}
      />

      <main
        className={`app-content ${
          menuOuvert ? "app-content-expanded" : "app-content-collapsed"
        }`}
        onClick={() => {
          if (menuOuvert) {
            setMenuOuvert(false);
          }
        }}
      >
        {children}
      </main>

      <ChatbotWidget />
    </div>
  );
}

export default Layout;