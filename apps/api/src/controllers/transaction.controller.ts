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

    if (fromAccount.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const result = await db.$transaction(async (tx) => {
      const updatedSender = await tx.account.update({
        where: { id: fromAccount.id },
        data: {
          balance: { decrement: amount },
        },
      });

      const updatedReceiver = await tx.account.update({
        where: { id: toAccountId },
        data: {
          balance: { increment: amount },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          fromAccountId: fromAccount.id,
          toAccountId,
          amount,
          status: "SUCCESS",
          idempotencyKey,
        },
      });

      return transaction;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Transfer failed" });
  }
};