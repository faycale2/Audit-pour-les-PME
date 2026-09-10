// src/components/Chatbot.jsx - Version simple avec réponses prédéfinies
import { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const responses = {
  "bonjour": "Bonjour ! Je suis l'assistant CyberPME. Comment puis-je vous aider ?",
  "aide": "Je peux vous aider avec :\n- Comprendre votre score\n- Obtenir des recommandations\n- En savoir plus sur la cybersécurité\n- Questions sur le questionnaire",
  "score": "Votre score est calculé à partir de vos réponses. Plus le score est élevé, plus votre maturité cybersécurité est bonne.",
  "recommandation": "Les recommandations sont générées automatiquement en fonction de vos réponses faibles. Consultez la page des résultats.",
  "questionnaire": "Le questionnaire comprend 29 questions réparties en 5 thèmes : Gouvernance, Accès, Sécurité Physique, Incidents et Protection des données.",
  "merci": "Avec plaisir ! N'hésitez pas si vous avez d'autres questions.",
  "default": "Je n'ai pas compris votre question. Essayez : 'bonjour', 'aide', 'score', 'recommandation', 'questionnaire'"
};

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Bonjour ! Je suis l'assistant CyberPME. Comment puis-je vous aider ?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim().toLowerCase();
    setMessages(prev => [...prev, { text: input.trim(), sender: "user" }]);
    setInput("");

    // Trouver la réponse
    let reply = responses.default;
    for (const [key, value] of Object.entries(responses)) {
      if (userMessage.includes(key)) {
        reply = value;
        break;
      }
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { text: reply, sender: "bot" }]);
    }, 400);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      {/* Bouton pour ouvrir/fermer */}
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Fenêtre du chat */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span className="chatbot-avatar">🤖</span>
            <div>
              <span className="chatbot-title">Assistant CyberPME</span>
              <span className="chatbot-status">En ligne</span>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                <span className="message-avatar">
                  {msg.sender === "bot" ? "🤖" : "👤"}
                </span>
                <div className="message-bubble">
                  <pre className="message-text">{msg.text}</pre>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question..."
            />
            <button onClick={handleSend} disabled={!input.trim()}>
              Envoyer
            </button>
          </div>

          <div className="chatbot-suggestions">
            <span>Suggestions :</span>
            <button onClick={() => setInput("bonjour")}>Bonjour</button>
            <button onClick={() => setInput("aide")}>Aide</button>
            <button onClick={() => setInput("score")}>Score</button>
            <button onClick={() => setInput("recommandation")}>Recommandations</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;