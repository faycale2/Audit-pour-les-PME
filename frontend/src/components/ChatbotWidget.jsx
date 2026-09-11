
import { useState } from "react";

import { demanderChatbot } from "../api/chatbotApi";

import "./ChatbotWidget.css";

function ChatbotWidget() {
  const [ouvert, setOuvert] = useState(false);
  const [message, setMessage] = useState("");
  const [historique, setHistorique] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const suggestions = [
    "Comment améliorer mes sauvegardes ?",
    "Comment protéger les accès distants ?",
    "Que faire en cas d'incident ?",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    const question = message;

    setMessage("");
    setErreur("");
    setChargement(true);

    setHistorique((h) => [
      ...h,
      {
        role: "user",
        texte: question,
      },
    ]);

    try {
      const data = await demanderChatbot(question);

      setHistorique((h) => [
        ...h,
        {
          role: "bot",
          texte: data.reponse,
        },
      ]);
    } catch (error) {
      console.error(error);

      setErreur(
        "L'assistant est momentanément indisponible. Réessayez dans un instant."
      );
    } finally {
      setChargement(false);
    }
  };

  const choisirSuggestion = (suggestion) => {
    setMessage(suggestion);
    setErreur("");
  };

  return (
    <>
      {/* =========================
          BOUTON FLOTTANT
      ========================= */}

      <button
        type="button"
        className={`chatbot-fab ${ouvert ? "chatbot-fab-ouvert" : ""}`}
        onClick={() => setOuvert((o) => !o)}
        aria-label={
          ouvert ? "Fermer l'assistant" : "Ouvrir l'assistant"
        }
      >
        {ouvert ? "✕" : "💬"}
      </button>


      {/* =========================
          PANNEAU CHATBOT
      ========================= */}

      <aside
        className={`chatbot-panel ${
          ouvert ? "chatbot-panel-ouvert" : ""
        }`}
      >

        {/* HEADER */}

        <div className="chatbot-panel-header">

          <div className="chatbot-title">
            <div className="chatbot-header-icon">
              AC
            </div>

            <div>
              <strong>Copilote cybersécurité</strong>
              <span>Assistant intelligent</span>
            </div>
          </div>

          <button
            type="button"
            className="chatbot-close"
            onClick={() => setOuvert(false)}
            aria-label="Fermer"
          >
            ✕
          </button>

        </div>


        {/* ZONE MESSAGES */}

        <div className="chatbot-messages">

          {historique.length === 0 && (
            <div className="assistant-welcome">

              <div className="assistant-icon">
                AC
              </div>

              <h2>
                Bonjour 👋
              </h2>

              <p>
                Comment puis-je vous aider aujourd'hui ?
              </p>

              <span className="welcome-hint">
                Choisissez un sujet ou écrivez directement votre question.
              </span>


              <div className="suggestion-list">

                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => choisirSuggestion(suggestion)}
                  >
                    <span>{suggestion}</span>
                    <strong>→</strong>
                  </button>
                ))}

              </div>

            </div>
          )}


          {/* HISTORIQUE */}

          {historique.map((m, i) => (
            <div
              key={i}
              className={`message-bulle message-${m.role}`}
            >
              <span className="message-role">
                {m.role === "user" ? "Vous" : "Assistant"}
              </span>

              <p>{m.texte}</p>
            </div>
          ))}


          {/* CHARGEMENT */}

          {chargement && (
            <div className="message-bulle message-bot">

              <span className="message-role">
                Assistant
              </span>

              <p className="typing">
                Recherche dans la base de connaissances
                <span className="typing-dots">...</span>
              </p>

            </div>
          )}

        </div>


        {/* ERREUR */}

        {erreur && (
          <div className="chatbot-error">
            <span>⚠️</span>
            {erreur}
          </div>
        )}


        {/* FORMULAIRE */}

        <form
          className="chatbot-form"
          onSubmit={handleSubmit}
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrivez votre question..."
            disabled={chargement}
          />

          <button
            type="submit"
            disabled={chargement || !message.trim()}
            aria-label="Envoyer"
          >
            ↗
          </button>
        </form>

      </aside>
    </>
  );
}

export default ChatbotWidget;

