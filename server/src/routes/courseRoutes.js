import { Router } from "express";
import {
  listCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", listCourses);
router.get("/:slug", getCourseBySlug);
router.post("/", requireAuth, createCourse);
router.put("/:id", requireAuth, updateCourse);
router.delete("/:id", requireAuth, deleteCourse);

export default router;
