import express from "express";
import pool from "../config/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

// Get user's cart
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id AS cart_id, cr.id AS course_id, cr.title, cr.price, cr.description
       FROM cart c
       JOIN courses cr ON c.course_id = cr.id
       WHERE c.user_id=$1
       ORDER BY c.id DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Fetch cart error:", err.message);
    res.status(500).json({ message: "Server error fetching cart" });
  }
});

// Add to cart
router.post("/", async (req, res) => {
  const { course_id } = req.body;

  if (!course_id) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  try {
    // ✅ Check if user exists in users_copy
    const userCheck = await pool.query("SELECT id FROM users_copy WHERE id=$1", [
      req.user.id,
    ]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid user" });
    }

    // ✅ Check if course exists
    const courseCheck = await pool.query("SELECT id FROM courses WHERE id=$1", [
      course_id,
    ]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ✅ Insert
    const result = await pool.query(
      `INSERT INTO cart (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING
       RETURNING *`,
      [req.user.id, course_id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "Already in cart" });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Cart insert error:", err.message);
    res.status(500).json({ message: "Server error adding to cart" });
  }
});

// Checkout
router.post("/checkout", async (req, res) => {
  try {
    await pool.query("DELETE FROM cart WHERE user_id=$1", [req.user.id]);
    res.json({ message: "✅ Checkout successful! Courses purchased." });
  } catch (err) {
    console.error("❌ Checkout error:", err.message);
    res.status(500).json({ message: "Server error during checkout" });
  }
});

export default router;
