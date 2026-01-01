import { Router } from "express";
import {
  changePassword,
  login,
  logout,
  refreshAccessToken,
  signup,
} from "../controllers/auth.js";
import { authenticateJwt } from "../middlewares/auth.js";
import { validate } from "../middlewares/validateZod.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from "../config/schema/auth.js";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/refresh-token", refreshAccessToken);
router.post("/signup", validate(registerSchema), signup);

router.use(authenticateJwt);
router.get("/logout", logout);
router.post("/change-password", validate(changePasswordSchema), changePassword);

export default router;
