const express = require("express");
const db = require("../config/db");
const router = express.Router();

router.post("/store-unit", (req, res) => {
    const { unit_id, batch_id, name, nurse_id } = req.body;
    if (!unit_id || !batch_id || !name || !nurse_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const getCrashcartSql = `
    SELECT c.cart_id FROM users u 
    LEFT JOIN crashcarts c ON LOWER(u.dept) = LOWER(c.location)
    WHERE u.user_id = ? LIMIT 1`;

    db.query(getCrashcartSql, [nurse_id], (err, nurseResults) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!nurseResults.length) return res.status(404).json({ error: "No linked crash cart." });

        const crashcart_id = nurseResults[0].cart_id;

        const insertSql = `INSERT INTO unit_medicine (unit_id, batch_id, name, crashcart_id) VALUES (?, ?, ?, ?)`;
        db.query(insertSql, [unit_id, batch_id, name, crashcart_id], (err2, result) => {
            if (err2) {
                if (err2.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Medicine already added." });
                return res.status(500).json({ error: err2.message });
            }

            const updateQuantitySql = `
            UPDATE department_medicine_allocation dma
            JOIN medicines m ON dma.medicine_id = m.medicine_id
            SET dma.current_quantity = dma.current_quantity + 1
            WHERE dma.crashcart_id = ? AND LOWER(m.name) = LOWER(?)`;

            db.query(updateQuantitySql, [crashcart_id, name], (err3) => {
                if (err3) return res.status(500).json({ error: err3.message });

                checkAndTriggerRestock(crashcart_id, name);

                res.json({ success: true, message: "Medicine added and quantity updated!", id: result.insertId });
            });
        });
    });
});

function checkAndTriggerRestock(crashcart_id, medicine_name) {
    const checkSql = `
    SELECT dma.allocation_id, dma.current_quantity, dma.threshold, m.medicine_id
    FROM department_medicine_allocation dma
    JOIN medicines m ON dma.medicine_id = m.medicine_id
    WHERE dma.crashcart_id = ? AND LOWER(m.name) = LOWER(?)`;

    db.query(checkSql, [crashcart_id, medicine_name], (err, results) => {
        if (err) return console.error(err.message);
        if (!results.length) return;

        const { allocation_id, current_quantity, threshold, medicine_id } = results[0];
        if (current_quantity < threshold) {
            const insertRestock = `
            INSERT INTO restock_requests (crashcart_id, medicine_id, requested_quantity, status)
            VALUES (?, ?, ?, 'Pending')
            ON DUPLICATE KEY UPDATE requested_quantity = requested_quantity + 1, status = 'Pending'`;

            db.query(insertRestock, [crashcart_id, medicine_id, threshold - current_quantity], (err2) => {
                if (err2) console.error(err2.message);
            });
        }
    });
}

module.exports = router;
