import { Router } from "express";
import { authenticateJwt } from "../middlewares/auth.js";
import { validate } from "../middlewares/validateZod.js";
import { commonDeleteSchema } from "../config/schema/common.js";
import {
  createMessageSchema,
  editMessageSchema,
} from "../config/schema/messages.js";
import {
  createMessage,
  deleteMessage,
  editMessage,
  getMessages,
} from "../controllers/messages.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", getMessages);
router.post("/create", validate(createMessageSchema), createMessage);

router.put("/edit/:id", validate(editMessageSchema), editMessage);
router.delete("/delete/:id", validate(commonDeleteSchema), deleteMessage);

export default router;
