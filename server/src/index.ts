import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import goalsRouter from "./routes/goals";
import usersRoutes from "./routes/users";
import challengesRouter from "./routes/challenges";
import leaderboardRouter from "./routes/leaderboard";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/v1/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/goals", goalsRouter);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/challenges", challengesRouter);
app.use("/api/v1/leaderboard", leaderboardRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
