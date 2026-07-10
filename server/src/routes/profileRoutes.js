import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", getProfile);
router.put("/", requireAuth, updateProfile);

export default router;
