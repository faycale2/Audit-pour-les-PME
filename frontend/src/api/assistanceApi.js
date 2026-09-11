import axiosClient from "./axiosClient";

// ========================================================
// QUESTIONS
// ========================================================

// Récupérer les questions / demandes d'accompagnement
export const getDemandes = () =>
  axiosClient
    .get("/accompagnement/")
    .then((response) => response.data);

// Traiter une question
export const traiterDemande = (id, donnees) =>
  axiosClient
    .patch(`/accompagnement/${id}/`, donnees)
    .then((response) => response.data);


// ========================================================
// CONSULTANTS
// ========================================================

// Récupérer les consultants disponibles
export const getConsultantsDisponibles = () =>
  axiosClient
    .get("/consultants/disponibles/")
    .then((response) => response.data);


// ========================================================
// DEMANDES DE SUIVI
// ========================================================

// Récupérer les demandes de suivi
export const getDemandesSuivi = () =>
  axiosClient
    .get("/demandes-suivi/")
    .then((response) => response.data);

// Envoyer une demande officielle de suivi à un consultant
export const creerDemandeSuivi = (consultantId, message) =>
  axiosClient
    .post("/demandes-suivi/", {
      consultant: consultantId,
      message,
    })
    .then((response) => response.data);

// Accepter ou refuser une demande de suivi
export const traiterDemandeSuivi = (id, donnees) =>
  axiosClient
    .patch(`/demandes-suivi/${id}/`, donnees)
    .then((response) => response.data);

// Compatibilité temporaire avec l'ancien Accompagnement.jsx
export const creerDemande = (consultantId, message) =>
  axiosClient
    .post("/demandes-suivi/", {
      consultant: consultantId,
      message,
    })
    .then((response) => response.data);    

export const supprimerDemandeSuivi = (id) =>
  axiosClient
    .delete(`/demandes-suivi/${id}/`)
    .then((response) => response.data);    

// Mettre fin à l'accompagnement actif avec une PME
export const terminerAccompagnement = (pmeId) =>
  axiosClient
    .delete(`/accompagnement/terminer/${pmeId}/`)
    .then((response) => response.data);    