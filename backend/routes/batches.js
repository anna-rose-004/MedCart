
// routes/batches.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // GET live inventory: join batches with medicines to get medicine details
  router.get('/withMedicines', (req, res) => {
    const sql = `
      SELECT b.batch_id, b.batch_number, b.expiry_date, b.total_units, b.price, 
             m.medicine_id, m.name AS medicine_name
      FROM batches b
      JOIN medicines m ON b.medicine_id = m.medicine_id
      ORDER BY b.batch_id DESC
    `;
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
  

  // POST a scanned batch from QR code
  router.post('/scan', (req, res) => {
    const {
      batch_number,
      expiry_date,
      medicine_name,
      total_units,
      manufacturer,
      dosage_form,
      category,
      description,
      price
    } = req.body;

    // Validate required fields
    if (!batch_number || !expiry_date || !medicine_name || !total_units || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Lookup medicine in the medicines table by name
const findMedicineSql = 'SELECT medicine_id FROM medicines WHERE name = ? LIMIT 1';
db.query(findMedicineSql, [medicine_name], (err, medicineResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (medicineResults.length === 0) {
        return res.status(404).json({ error: 'Medicine not found' });
    }
    const medicine_id = medicineResults[0].medicine_id;

    // Check if batch already exists for the same medicine
    const checkBatchSql = 'SELECT batch_id FROM batches WHERE batch_number = ? AND medicine_id = ? LIMIT 1';
    db.query(checkBatchSql, [batch_number, medicine_id], (err, batchResults) => {
        if (err) return res.status(500).json({ error: err.message });
        if (batchResults.length > 0) {
            return res.status(409).json({ error: 'Duplicate entry: Batch already exists for this medicine', batch_id: batchResults[0].batch_id });
        }

        // Insert new batch
        const insertSql = `
          INSERT INTO batches (batch_number, expiry_date, medicine_id, name, total_units, price)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(insertSql, [batch_number, expiry_date, medicine_id, medicine_name, total_units, price], (err2, result) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ success: true, batch_id: result.insertId });
        });
    });
});
  }
  );

  return router;
};