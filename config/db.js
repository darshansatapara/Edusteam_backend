import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Neon or local Postgres
  ssl: { rejectUnauthorized: false },
});

const initDB = async () => {
  // Users (main table is users_copy)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users_copy (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      is_verified BOOLEAN DEFAULT FALSE
    );
  `);

  // Courses
  await pool.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      price NUMERIC(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Quizzes
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id SERIAL PRIMARY KEY,
      course_id INT REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Quiz Questions
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id SERIAL PRIMARY KEY,
      quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      options TEXT[] NOT NULL,
      correct_answer TEXT NOT NULL
    );
  `);

  // Enrollments
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users_copy(id) ON DELETE CASCADE,
      course_id INT REFERENCES courses(id) ON DELETE CASCADE,
      enrolled_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, course_id)
    );
  `);

  // Progress
  await pool.query(`
    CREATE TABLE IF NOT EXISTS progress (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users_copy(id) ON DELETE CASCADE,
      course_id INT REFERENCES courses(id) ON DELETE CASCADE,
      quiz_id INT REFERENCES quizzes(id) ON DELETE SET NULL,
      completed_lessons INT DEFAULT 0,
      progress_percent INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Cart
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cart (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users_copy(id) ON DELETE CASCADE,
      course_id INT REFERENCES courses(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, course_id)
    );
  `);

  console.log("✅ EduStream tables ready");

  // Insert some sample data (only if not already exists)
  await pool.query(`
    INSERT INTO courses (title, description, price)
    VALUES
      ('Web Design Fundamentals', 'Learn the basics of HTML, CSS, and responsive design.', 3999),
      ('JavaScript Mastery', 'Deep dive into modern JavaScript (ES6+).', 6499),
      ('Data Science Basics', 'Introduction to Python, Pandas, and ML fundamentals.', 8199)
    ON CONFLICT (title) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO quizzes (course_id, title)
    VALUES
      (1, 'HTML & CSS Basics'),
      (2, 'JavaScript Fundamentals'),
      (3, 'Intro to Data Science')
    ON CONFLICT DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO quiz_questions (quiz_id, question, options, correct_answer)
    VALUES
      (1, 'What does HTML stand for?', ARRAY['HyperText Markup Language', 'HighText Machine Language', 'Hyperlink Markup Language'], 'HyperText Markup Language'),
      (2, 'Which keyword declares a block-scoped variable in JS?', ARRAY['var', 'let', 'const'], 'let'),
      (3, 'Which library is common in Python for data analysis?', ARRAY['NumPy', 'TensorFlow', 'Django'], 'NumPy')
    ON CONFLICT DO NOTHING;
  `);

  console.log("✅ Sample data inserted");
};

initDB().catch((err) => console.error("❌ DB Init Error:", err));

export default pool;
