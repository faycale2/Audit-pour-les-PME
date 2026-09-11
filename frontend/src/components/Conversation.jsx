import { useEffect, useState } from "react";
import {
  envoyerMessage,
  getMessages,
  marquerMessagesLus,
} from "../api/messagesApi";
import "./Conversation.css";

function Conversation({
  pmeId,
  consultantId,
  titre = "Conversation",
}) {
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [autorise, setAutorise] = useState(true);

  const charger = async () => {
    try {
      const data = await getMessages(pmeId, consultantId);

      setMessages(data);
      setErreur("");
      setAutorise(true);

      await marquerMessagesLus(pmeId, consultantId);
    } catch (error) {
      const detail =
        error.response?.data?.detail ||
        "Conversation indisponible.";

      setErreur(detail);

      if (
        error.response?.status === 403 ||
        error.response?.status === 401
      ) {
        setAutorise(false);
      }
    }
  };

  useEffect(() => {
    charger();

    const intervalle = window.setInterval(() => {
      if (autorise) {
        charger();
      }
    }, 12000);

    return () => window.clearInterval(intervalle);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pmeId, consultantId]);

  const envoyer = async (event) => {
    event.preventDefault();

    if (!contenu.trim() || envoi || !autorise) return;

    setEnvoi(true);
    setErreur("");

    try {
      const message = await envoyerMessage(
        pmeId,
        contenu.trim(),
        consultantId
      );

      setMessages((anciens) => [...anciens, message]);
      setContenu("");
    } catch (error) {
      setErreur(
        error.response?.data?.detail ||
          "Le message n'a pas pu être envoyé."
      );
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <section className="conversation">
      <div className="conversation-head">
        <div className="conversation-title">
          <span className="section-label">Conversation</span>
          <h2>{titre}</h2>
        </div>

        <span
          className={`conversation-status ${
            autorise
              ? "conversation-status-ok"
              : "conversation-status-error"
          }`}
        >
          <span className="status-dot" />
          {autorise ? "Actualisé" : "Indisponible"}
        </span>
      </div>

      {!autorise ? (
        <div className="conversation-error">
          Vous n'êtes pas autorisé à accéder à cette conversation.
        </div>
      ) : (
        <>
          <div className="conversation-messages">
            {messages.length === 0 ? (
              <div className="conversation-empty">
                <div className="conversation-empty-icon">✉</div>

                <strong>Aucun message</strong>

                <p>
                  Commencez la conversation avec votre consultant.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`conversation-bulle ${
                    message.expediteur ===
                    Number(localStorage.getItem("user_id"))
                      ? "conversation-moi"
                      : "conversation-autre"
                  }`}
                >
                  <p>{message.contenu}</p>

                  <time>
                    {new Date(
                      message.date_envoi
                    ).toLocaleString("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </time>
                </div>
              ))
            )}
          </div>

          {erreur && (
            <div className="conversation-form-error">
              {erreur}
            </div>
          )}

          <form
            className="conversation-form"
            onSubmit={envoyer}
          >
            <input
              value={contenu}
              onChange={(event) =>
                setContenu(event.target.value)
              }
              placeholder="Écrire un message..."
              disabled={envoi}
            />

            <button
              type="submit"
              disabled={envoi || !contenu.trim()}
            >
              {envoi ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}

export default Conversation;