import express from "express";
import pool from "../config/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

// Dashboard stats for logged-in user
router.get("/", async (req, res) => {
  try {
    const { id: userId } = req.user;

    const enrolledCourses = await pool.query(
      "SELECT COUNT(*) FROM enrollments WHERE id=$1",
      [userId]
    );

    const completedQuizzes = await pool.query(
      "SELECT COUNT(*) FROM progress WHERE id=$1 AND progress_percent=100",
      [userId]
    );

    const avgProgress = await pool.query(
      "SELECT COALESCE(AVG(progress_percent),0) FROM progress WHERE id=$1",
      [userId]
    );

    res.json({
      enrolledCourses: parseInt(enrolledCourses.rows[0].count, 10),
      completedQuizzes: parseInt(completedQuizzes.rows[0].count, 10),
      progress: parseInt(avgProgress.rows[0].coalesce, 10),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
