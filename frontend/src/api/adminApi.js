import axiosClient from "./axiosClient";

// ===============================
// STATISTIQUES
// ===============================

export const getStatistiques = async () => {
  const { data } = await axiosClient.get(
    "/admin/statistiques/"
  );

  return data;
};

// ===============================
// SEUILS
// ===============================

export const getSeuils = async () => {
  const { data } = await axiosClient.get(
    "/admin/seuils/"
  );

  return data;
};

export const updateSeuils = async (seuils) => {
  const { data } = await axiosClient.put(
    "/admin/seuils/",
    seuils
  );

  return data;
};

// ===============================
// UTILISATEURS
// ===============================

export const getUtilisateurs = async () => {
  const { data } = await axiosClient.get(
    "/admin/utilisateurs/"
  );

  return data;
};

export const modifierRole = async (userId, role) => {
  const { data } = await axiosClient.patch(
    `/admin/utilisateurs/${userId}/`,
    {
      role,
    }
  );

  return data;
};

export const supprimerUtilisateur = async (userId) => {
  await axiosClient.delete(`/admin/utilisateurs/${userId}/`);
};

// ===============================
// PROFIL
// ===============================

export const getProfil = async () => {
  const { data } = await axiosClient.get(
    "/profil/"
  );

  return data;
};

// ===============================
// CONSULTANT
// ===============================

export const getPmesConsultant = async () => {
  const { data } = await axiosClient.get(
    "/consultant/pmes/"
  );

  return data;
};

export const getHistoriquePme = async (pmeId) => {
  const { data } = await axiosClient.get(
    `/consultant/pme/${pmeId}/historique/`
  );

  return data;
};

// ===============================
// ASSOCIATIONS
// ===============================

export const getAssociations = async () => {
  const { data } = await axiosClient.get(
    "/admin/associations/"
  );

  return data;
};

export const creerAssociation = async (
  pmeId,
  consultantId
) => {
  const { data } = await axiosClient.post(
    "/admin/associations/",
    {
      pme_id: pmeId,
      consultant_id: consultantId,
    }
  );

  return data;
};

export const supprimerAssociation = async (
  associationId
) => {
  const { data } = await axiosClient.delete(
    `/admin/associations/${associationId}/`
  );

  return data;
};

// ===============================
// PME
// ===============================

export const getPmes = async () => {
  const { data } = await axiosClient.get(
    "/admin/pmes/"
  );

  return data;
};