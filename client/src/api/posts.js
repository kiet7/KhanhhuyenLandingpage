import axiosClient from "./axiosClient";

export const listPosts = (all = false) =>
  axiosClient.get("/posts", { params: all ? { all: "true" } : {} }).then((res) => res.data);

export const getPostBySlug = (slug) =>
  axiosClient.get(`/posts/${slug}`).then((res) => res.data);

export const createPost = (data) =>
  axiosClient.post("/posts", data).then((res) => res.data);

export const updatePost = (id, data) =>
  axiosClient.put(`/posts/${id}`, data).then((res) => res.data);

export const deletePost = (id) =>
  axiosClient.delete(`/posts/${id}`).then((res) => res.data);
