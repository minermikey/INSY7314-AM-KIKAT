// routes/employeePaymentsRoutes.js
const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment"); // We'll make this model next

// 🟢 GET all employee payments filtered by verified status
router.get("/getall", async (req, res) => {
    try {
        // Read the filter from query params (example: /api/employeepayments?verified=true)
        const { verified } = req.query;

        // Build the filter
        const filter = {};
        if (verified === "true") filter.verified = true;
        else if (verified === "false") filter.verified = false;

        // Fetch from MongoDB
        const payments = await Payment.find(filter).sort({ paymentDate: -1 });

        res.status(200).json(payments);
    } catch (error) {
        console.error("Error fetching employee payments:", error);
        res.status(500).json({ message: "Server error while fetching employee payments" });
    }
});


module.exports = router;
