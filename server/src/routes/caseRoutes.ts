import { Router } from "express";
import {
  addComment,
  assignCase,
  createCase,
  getCase,
  listCases,
  reviewCase,
  startCase,
  submitCase,
  uploadDocument
} from "../controllers/caseController.js";
import { authorize, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import {
  assignCaseSchema,
  commentSchema,
  createCaseSchema,
  idParamSchema,
  listCasesQuerySchema,
  reviewSchema,
  statusSchema
} from "../validation/schemas.js";

export const caseRouter = Router();

caseRouter.use(protect);
caseRouter
  .route("/")
  .get(validate(listCasesQuerySchema, "query"), listCases)
  .post(authorize("manager"), validate(createCaseSchema), createCase);

caseRouter
  .route("/:id")
  .get(validate(idParamSchema, "params"), getCase);

caseRouter.post(
  "/:id/assign",
  authorize("manager"),
  validate(idParamSchema, "params"),
  validate(assignCaseSchema),
  assignCase
);

caseRouter.post(
  "/:id/start",
  authorize("agent"),
  validate(idParamSchema, "params"),
  validate(statusSchema),
  startCase
);

caseRouter.post(
  "/:id/submit",
  authorize("agent"),
  validate(idParamSchema, "params"),
  validate(statusSchema),
  submitCase
);

caseRouter.post(
  "/:id/review",
  authorize("manager"),
  validate(idParamSchema, "params"),
  validate(reviewSchema),
  reviewCase
);

caseRouter.post(
  "/:id/comments",
  validate(idParamSchema, "params"),
  validate(commentSchema),
  addComment
);

caseRouter.post(
  "/:id/documents",
  authorize("agent"),
  validate(idParamSchema, "params"),
  upload.single("file"),
  uploadDocument
);
