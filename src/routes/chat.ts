import { Router } from "express";
import { authenticateJwt } from "../middlewares/auth.js";
import { validate } from "../middlewares/validateZod.js";
import { commonDeleteSchema } from "../config/schema/common.js";
import {
  createGroupMessageSchema,
  createMessageSchema,
  editGroupMessageSchema,
  editMessageSchema,
  getGroupMessagesSchema,
} from "../config/schema/messages.js";
import {
  createMessage,
  deleteMessage,
  editMessage,
  getMessages,
} from "../controllers/messages.js";
import {
  addOrRemoveUserInGroupSchema,
  createGroupSchema,
  editGroupSchema,
} from "../config/schema/groups.js";
import {
  addUserToGroup,
  createGroup,
  createGroupMessage,
  deleteGroup,
  deleteGroupMessage,
  editGroup,
  editGroupMessage,
  getGroupMessages,
  getGroups,
  removeUserFromGroup,
} from "../controllers/groupChat.js";

const router = Router();

router.use(authenticateJwt);

// Individual Chat

router.get("/get-messages", getMessages);
router.post("/send-message", validate(createMessageSchema), createMessage);
router.put("/edit-message/:id", validate(editMessageSchema), editMessage);
router.delete(
  "/delete-message/:id",
  validate(commonDeleteSchema),
  deleteMessage
);

// Group

router.get("/groups/get", getGroups);
router.post("/groups/create", validate(createGroupSchema), createGroup);
router.put("/groups/edit/:id", validate(editGroupSchema), editGroup);
router.delete("/groups/delete/:id", validate(commonDeleteSchema), deleteGroup);
router.post(
  "/groups/add-user",
  validate(addOrRemoveUserInGroupSchema),
  addUserToGroup
);
router.post(
  "/groups/remove-user",
  validate(addOrRemoveUserInGroupSchema),
  removeUserFromGroup
);

// Group Messages

router.get(
  "/groups/get-messages/:groupId",
  validate(getGroupMessagesSchema),
  getGroupMessages
);
router.post(
  "/groups/send-message",
  validate(createGroupMessageSchema),
  createGroupMessage
);
router.put(
  "/groups/edit-message/:id",
  validate(editGroupMessageSchema),
  editGroupMessage
);
router.delete(
  "/groups/delete-message/:id",
  validate(commonDeleteSchema),
  deleteGroupMessage
);

export default router;
