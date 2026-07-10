import axiosClient from "./axiosClient";

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return axiosClient
    .post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};
