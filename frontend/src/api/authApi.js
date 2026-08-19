import axiosClient from "./axiosClient";

export const connexion = async (email, password) => {
  const { data } = await axiosClient.post("/connexion/", { email, password });
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  localStorage.setItem("role", data.role);
  return data;
};

export const deconnexion = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("role");
};

export const estConnecte = () => !!localStorage.getItem("access_token");