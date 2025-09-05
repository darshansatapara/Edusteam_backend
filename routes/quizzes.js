import express from "express";
import pool from "../config/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

// Get all quizzes
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM quizzes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add a quiz
router.post("/", async (req, res) => {
  const { course_id, title } = req.body;
  if (!title || !course_id) {
    return res.status(400).json({ message: "Course and title are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO quizzes (course_id, title) VALUES ($1,$2) RETURNING *",
      [course_id, title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: "Error creating quiz" });
  }
});

// Update a quiz
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    const result = await pool.query(
      "UPDATE quizzes SET title=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [title, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: "Error updating quiz" });
  }
});

// Delete a quiz
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM quizzes WHERE id=$1", [id]);
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting quiz" });
  }
});

export default router;
