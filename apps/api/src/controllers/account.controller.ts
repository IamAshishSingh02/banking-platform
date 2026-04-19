import { Request, Response } from "express";
import { db } from "@banking-platform/database";

export const createAccount = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const account = await db.account.create({
      data: {
        userId,
      },
    });

    res.status(201).json(account);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deposit = async (req: any, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const account = await db.account.findFirst({
      where: { userId },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const updated = await db.account.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const withdraw = async (req: any, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const account = await db.account.findFirst({
      where: { userId },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (account.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const updated = await db.account.update({
      where: { id: account.id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};