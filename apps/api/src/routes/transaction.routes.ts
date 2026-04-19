import { Router } from "express";
import { transfer } from "../controllers/transaction.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

router.post("/transfer", authMiddleware, transfer);

export default router;