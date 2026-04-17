import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.router";
import { authMiddleware } from "./middlewares/auth.middleware";



const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/v1/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authenticated" });
});

app.use("/api/v1/auth", authRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});