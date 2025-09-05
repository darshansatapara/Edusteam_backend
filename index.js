import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import dashboardRoutes from "./routes/dashboard.js";
import quizzes from "./routes/quizzes.js";
import cartRoutes from "./routes/cart.js";
dotenv.config();
const app = express();

app.use(cors({
    origin: { "http://localhost:3000": true, "https://edusteam-frontend.vercel.app": true },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/quizzes", quizzes);
app.use("/api/cart", cartRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
