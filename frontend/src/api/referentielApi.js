import axiosClient from "./axiosClient";

export const getQuestionnaireActif = () =>
  axiosClient.get("/referentiel/questionnaire/").then((res) => res.data);

export const demarrerEvaluation = () =>
  axiosClient.post("/referentiel/evaluations/demarrer/").then((res) => res.data);

export const soumettreReponses = (evaluationId, reponses) =>
  axiosClient
    .post(`/referentiel/evaluations/${evaluationId}/reponses/`, { reponses })
    .then((res) => res.data);

export const getResultatsEvaluation = (evaluationId) =>
  axiosClient
    .get(`/referentiel/evaluations/${evaluationId}/resultats/`)
    .then((res) => res.data);

export const getRapportPdfUrl = (evaluationId) =>
  `http://127.0.0.1:8000/api/referentiel/evaluations/${evaluationId}/rapport-pdf/`;