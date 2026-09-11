import axiosClient from "./axiosClient";


const enregistrerSession = (data) => {
  localStorage.setItem(
    "access_token",
    data.access
  );

  localStorage.setItem(
    "refresh_token",
    data.refresh
  );

  localStorage.setItem(
    "role",
    data.role
  );

  localStorage.setItem(
    "user_id",
    data.user_id
  );
};


export const connexion = async (
  email,
  password
) => {
  const { data } =
    await axiosClient.post(
      "/connexion/",
      {
        email,
        password,
      }
    );

  enregistrerSession(data);

  return data;
};


export const inscription = async (
  formulaire
) => {
  const { data } =
    await axiosClient.post(
      "/inscription/",
      formulaire
    );

  enregistrerSession(data);

  return data;
};


export const deconnexion = () => {
  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "refresh_token"
  );

  localStorage.removeItem(
    "role"
  );

  localStorage.removeItem(
    "user_id"
  );
};


export const estConnecte = () => {
  return !!localStorage.getItem(
    "access_token"
  );
};


export const destinationAccueil = (
  role = localStorage.getItem("role")
) => {

  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "CONSULTANT") {
    return "/consultant";
  }

  return "/questionnaire";
};