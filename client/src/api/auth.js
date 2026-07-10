import axiosClient from "./axiosClient";

export const login = (username, password) =>
  axiosClient.post("/auth/login", { username, password }).then((res) => res.data);

export const logout = () => axiosClient.post("/auth/logout").then((res) => res.data);

export const getMe = () => axiosClient.get("/auth/me").then((res) => res.data);
