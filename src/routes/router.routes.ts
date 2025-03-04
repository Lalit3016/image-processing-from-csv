import { Router } from "express";
import statusRouter from "./status.routes";
import uploadRouter from "./upload.routes";

const router = Router({ mergeParams: true });

router.use("/", statusRouter, uploadRouter);

export default router;
