import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "@banking-platform/database";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password } = req.body;

    // Basic validation
    if (!email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists with email or phone",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};