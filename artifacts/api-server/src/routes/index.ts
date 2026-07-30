import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import contactRouter from "./contact.js";
import publicRouter from "./public.js";
import adminRouter from "./admin/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);
router.use("/content", publicRouter);
router.use("/admin", adminRouter);

export default router;
