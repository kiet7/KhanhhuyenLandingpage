import axiosClient from "./axiosClient";

export const submitContact = (data) =>
  axiosClient.post("/contact", data).then((res) => res.data);

export const listSubmissions = () =>
  axiosClient.get("/contact").then((res) => res.data);

export const updateSubmissionStatus = (id, status) =>
  axiosClient.patch(`/contact/${id}`, { status }).then((res) => res.data);
