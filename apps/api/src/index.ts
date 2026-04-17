import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { db } from "@banking-platform/database";
import authRoutes from "./routes/auth.router";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/v1/auth", authRoutes);

app.get("/users", async (req, res) => {
  try {
    const users = await db.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});