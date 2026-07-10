import { Router } from "express";
import {
  createSubmission,
  listSubmissions,
  updateSubmissionStatus,
} from "../controllers/contactController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", createSubmission);
router.get("/", requireAuth, listSubmissions);
router.patch("/:id", requireAuth, updateSubmissionStatus);

export default router;
