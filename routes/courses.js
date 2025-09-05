import express from "express";
import pool from "../config/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

// Get all courses
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new course
router.post("/", async (req, res) => {
  const { title, description, price } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });

  try {
    const result = await pool.query(
      "INSERT INTO courses (title, description, price) VALUES ($1,$2,$3) RETURNING *",
      [title, description || "", price || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: "Error creating course" });
  }
});

// Update a course
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, price } = req.body;
  try {
    const result = await pool.query(
      "UPDATE courses SET title=$1, description=$2, price=$3, updated_at=NOW() WHERE id=$4 RETURNING *",
      [title, description, price, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: "Error updating course" });
  }
});

// Delete a course
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM courses WHERE id=$1", [id]);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting course" });
  }
});

export default router;
