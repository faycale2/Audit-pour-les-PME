import axiosClient from "./axiosClient";

export const demanderChatbot = async (message) => {
  const { data } = await axiosClient.post("/chatbot/question/", { message });
  return data;
};