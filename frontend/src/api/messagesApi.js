import axiosClient from "./axiosClient";


export const getMessages = async (
  pmeId,
  consultantId = null
) => {
  const params = {};

  if (consultantId) {
    params.destinataire_id = consultantId;
  }

  const { data } = await axiosClient.get(
    `/messages/${pmeId}/`,
    { params }
  );

  return data;
};


export const envoyerMessage = async (
  pmeId,
  contenu,
  consultantId = null
) => {
  const payload = {
    contenu,
  };

  if (consultantId) {
    payload.destinataire_id = consultantId;
  }

  const { data } = await axiosClient.post(
    `/messages/${pmeId}/envoyer/`,
    payload
  );

  return data;
};


export const marquerMessagesLus = async (
  pmeId,
  consultantId = null
) => {
  const payload = {};

  if (consultantId) {
    payload.destinataire_id = consultantId;
  }

  const { data } = await axiosClient.patch(
    `/messages/${pmeId}/marquer-lu/`,
    payload
  );

  return data;
};


export const getMessagesNonLus = async () => {
  const { data } = await axiosClient.get(
    "/messages/non-lus/"
  );

  return data;
};