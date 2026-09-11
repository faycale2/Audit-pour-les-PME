import axiosClient from "./axiosClient";

export const mettreAJourPhoto = (fichier) => {
  const formulaire = new FormData();
  formulaire.append("photo_profil", fichier);
  return axiosClient.put("/profil/photo/", formulaire).then((response) => response.data);
};

export const changerMotDePasse = (donnees) =>
  axiosClient.post("/profil/changer-mot-de-passe/", donnees).then((response) => response.data);

export const demanderReinitialisation = (email) =>
  axiosClient.post("/mot-de-passe-oublie/", { email }).then((response) => response.data);

export const reinitialiserMotDePasse = (donnees) =>
  axiosClient.post("/reinitialiser-mot-de-passe/", donnees).then((response) => response.data);
