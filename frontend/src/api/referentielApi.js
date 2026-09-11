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
  `${axiosClient.defaults.baseURL}/referentiel/evaluations/${evaluationId}/rapport-pdf/`;

export const getEvolutionTendance = () =>
  axiosClient.get("/referentiel/pme/evolution/").then((res) => res.data);

export const getComparatifBenchmark = () =>
  axiosClient.get("/referentiel/pme/comparatif/").then((res) => res.data);

export const getTendanceParTheme = () =>
  axiosClient.get("/referentiel/pme/tendance-par-theme/").then((res) => res.data);

export const getPredictionProgression = () =>
  axiosClient.get("/referentiel/pme/prediction/").then((res) => res.data);