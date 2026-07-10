import axiosClient from "./axiosClient";

export const listCourses = (all = false) =>
  axiosClient.get("/courses", { params: all ? { all: "true" } : {} }).then((res) => res.data);

export const getCourseBySlug = (slug) =>
  axiosClient.get(`/courses/${slug}`).then((res) => res.data);

export const createCourse = (data) =>
  axiosClient.post("/courses", data).then((res) => res.data);

export const updateCourse = (id, data) =>
  axiosClient.put(`/courses/${id}`, data).then((res) => res.data);

export const deleteCourse = (id) =>
  axiosClient.delete(`/courses/${id}`).then((res) => res.data);
