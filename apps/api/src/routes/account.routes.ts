import {Router} from "express";
import {
  createAccount,
  deposit,
  withdraw,
} from "../controllers/account.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

router.post("/", authMiddleware, createAccount);
router.post("/deposit", authMiddleware, deposit);
router.post("/withdraw", authMiddleware, withdraw);

export default router;