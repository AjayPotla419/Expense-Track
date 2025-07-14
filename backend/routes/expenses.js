const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/auth");

// CREATE Expense
router.post("/", authMiddleware, async (req, res) => {
  const { title, amount, type, date } = req.body;

  console.log("💡 Received expense:", req.body);
  console.log("🔐 Authenticated User:", req.user);

  if (
    !title ||
    typeof amount !== "number" ||
    !type ||
    !date ||
    !["income", "expense"].includes(type)
  ) {
    return res.status(400).json({ message: "All fields must be valid." });
  }

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "User info missing from token" });
  }

  try {
    const expense = new Expense({
      title,
      amount,
      type,
      date,
      user: req.user.id,
    });

    await expense.save();
    console.log("✅ Expense saved:", expense);
    res.status(201).json(expense);
  } catch (err) {
    console.error("❌ Error saving expense:", err);
    res.status(500).json({ message: "Failed to save expense" });
  }
});

// GET all expenses for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error("❌ Error fetching expenses:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

// DELETE an expense by ID
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("❌ Error deleting expense:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

// EDIT an expense by ID
router.put("/:id", authMiddleware, async (req, res) => {
  const { title, amount, type, date } = req.body;

  try {
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, amount, type, date },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(updatedExpense);
  } catch (err) {
    console.error("❌ Error updating expense:", err);
    res.status(500).json({ message: "Failed to update expense" });
  }
});

module.exports = router;
