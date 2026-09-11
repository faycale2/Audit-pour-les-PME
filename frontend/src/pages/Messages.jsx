import { useEffect, useState } from "react";
import { getProfil } from "../api/adminApi";
import Conversation from "../components/Conversation";
import "./Messages.css";

function Messages() {
  const [profil, setProfil] = useState(null);
  const [erreur, setErreur] = useState("");
  const [consultantId, setConsultantId] = useState("");

  useEffect(() => {
    getProfil()
      .then((data) => {
        console.log("PROFIL MESSAGES :", data);
        setProfil(data);

        if (data.consultants && data.consultants.length > 0) {
          setConsultantId(String(data.consultants[0].consultant_id));
        }
      })
      .catch((error) => {
        console.error("Erreur chargement profil :", error);

        const detail =
          error.response?.data?.detail ||
          "Impossible de charger vos consultants.";

        setErreur(detail);
      });
  }, []);

  if (erreur) {
    return (
      <div className="role-page">
        <div className="messages-alert messages-alert-error">
          {erreur}
        </div>
      </div>
    );
  }

  if (!profil) {
    return (
      <div className="role-page messages-page">
        <header className="page-heading messages-heading">
          <div>
            <span className="eyebrow">Échange sécurisé</span>
            <h1>Messages</h1>
            <p>
              Échangez directement avec votre consultant.
            </p>
          </div>
        </header>

        <div className="messages-skeleton">
          <div className="skeleton-line skeleton-line-short" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line-medium" />
        </div>
      </div>
    );
  }

  const consultants = profil.consultants || [];

  if (consultants.length === 0) {
    return (
      <div className="role-page messages-page">
        <header className="page-heading messages-heading">
          <div>
            <span className="eyebrow">Échange sécurisé</span>
            <h1>Messages</h1>
            <p>
              Échangez directement avec votre consultant.
            </p>
          </div>
        </header>

        <section className="messages-empty">
          <div className="messages-empty-icon">✉</div>

          <h2>Aucun consultant assigné</h2>

          <p>
            Vous devez d'abord choisir un consultant pour
            pouvoir démarrer une conversation.
          </p>
        </section>
      </div>
    );
  }

  const consultantActuel =
    consultants.find(
      (consultant) =>
        String(consultant.consultant_id) === String(consultantId)
    ) || consultants[0];

  const nomConsultant =
    consultantActuel.consultant_nom ||
    `${consultantActuel.first_name || ""} ${
      consultantActuel.last_name || ""
    }`.trim() ||
    "Consultant";

  return (
    <div className="role-page messages-page">
      <header className="page-heading messages-heading">
        <div>
          <span className="eyebrow">Échange sécurisé</span>

          <h1>Messages</h1>

          <p>
            Échangez directement avec votre consultant.
          </p>
        </div>

        <div className="messages-count">
          <strong>{consultants.length}</strong>
          <span>
            {consultants.length > 1
              ? "consultants associés"
              : "consultant associé"}
          </span>
        </div>
      </header>

      {consultants.length > 1 && (
        <div className="conversation-selector-card">
          <div className="conversation-selector-info">
            <span className="section-label">Destinataire</span>
            <strong>Choisir un consultant</strong>
          </div>

          <label className="conversation-selector">
            <select
              value={consultantActuel.consultant_id}
              onChange={(event) =>
                setConsultantId(event.target.value)
              }
            >
              {consultants.map((consultant) => (
                <option
                  key={consultant.consultant_id}
                  value={consultant.consultant_id}
                >
                  {consultant.consultant_nom ||
                    `${consultant.first_name || ""} ${
                      consultant.last_name || ""
                    }`.trim() ||
                    "Consultant"}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="messages-conversation-wrapper">
        {profil.pme?.id ? (
          <Conversation
            pmeId={profil.pme.id}
            consultantId={consultantActuel.consultant_id}
            titre={nomConsultant}
          />
        ) : (
          <p className="messages-form-error">
            Profil PME introuvable — impossible d'ouvrir
            la conversation.
          </p>
        )}
      </div>
    </div>
  );
}

export default Messages;