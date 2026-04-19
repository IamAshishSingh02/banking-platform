import { Request, Response } from "express";
import { db } from "@banking-platform/database";

export const transfer = async (req: any, res: Response) => {
  try {
    const { toAccountId, amount, idempotencyKey } = req.body;
    const userId = req.user.userId;

    if (!toAccountId || !amount || !idempotencyKey) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Check idempotency
    const existing = await db.transaction.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      return res.json(existing);
    }

    const fromAccount = await db.account.findFirst({
      where: { userId },
    });

    if (!fromAccount) {
      return res.status(404).json({ error: "Sender account not found" });
    }

    const result = await db.$transaction(async (tx) => {
      const sender = await tx.account.findUnique({
        where: { id: fromAccount.id },
      });

      if (!sender) {
        throw new Error("Sender not found");
      }

      if (sender.balance < amount) {
        throw new Error("Insufficient balance");
      }

      const updatedSender = await tx.account.updateMany({
        where: {
          id: sender.id,
          version: sender.version,
        },
        data: {
          balance: { decrement: amount },
          version: { increment: 1 },
        },
      });

      if (updatedSender.count === 0) {
        throw new Error("Concurrent update detected, retry");
      }

      const updatedReceiver = await tx.account.update({
        where: { id: toAccountId },
        data: {
          balance: { increment: amount },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          fromAccountId: sender.id,
          toAccountId,
          amount,
          status: "SUCCESS",
          idempotencyKey,
        },
      });

      return transaction;
    });

    res.json(result);
  } catch (error: any) {
    console.error(error);

    if (error.message === "Insufficient balance") {
      return res.status(400).json({ error: error.message });
    }

    if (error.message === "Concurrent update detected, retry") {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: "Transfer failed" });
  }
};