const express = require('express');
const Account = require("../models/SignupModel");
const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
    try {
        const items = await Account.find();
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Update an existing user
router.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { name, username, age, cnic } = req.body;

    try {
        let updateData = { name, username, age, cnic };
        const updateItem = await Account.findByIdAndUpdate(id, updateData, { new: true });
        if (!updateItem) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User updated successfully", updateItem });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete a user
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedItem = await Account.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;