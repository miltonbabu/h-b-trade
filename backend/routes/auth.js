const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const db = require("../config/database");
const { handleValidationErrors } = require("../middleware/validation");
const { v4: uuidv4 } = require("uuid");
const logger = require("../config/logger");

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

router.post("/login", loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.getOne("SELECT * FROM users WHERE email = ?", [
      email.toLowerCase(),
    ]);

    if (!user) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "hbtrade_secret_key",
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "hbtrade_secret_key",
    );

    const user = await db.getOne(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [decoded.id],
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    logger.error("Get user error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

router.post(
  "/change-password",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "hbtrade_secret_key",
      );
      const { currentPassword, newPassword } = req.body;

      const user = await db.getOne("SELECT * FROM users WHERE id = ?", [
        decoded.id,
      ]);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isMatch = bcrypt.compareSync(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      await db.run("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        user.id,
      ]);

      logger.info(`Password changed for user: ${user.email}`);

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      logger.error("Change password error:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
);

module.exports = router;
