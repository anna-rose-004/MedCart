//  routes/events.js
const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  //  GET all events (no user filtering)
  router.get("/", (req, res) => {
    const sql = "SELECT id, date, event FROM events";
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  });

  //  POST add new event with user_id
  router.post("/", (req, res) => {
    const { date, event, user_id } = req.body;
    if (!date || !event || !user_id) {
      return res.status(400).json({ error: "Date, event, and user ID are required." });
    }

    const sql = "INSERT INTO events (date, event, user_id) VALUES (?, ?, ?)";
    db.query(sql, [date, event, user_id], (err) => {
      if (err) {
        console.error("Error inserting event:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Event saved successfully." });
    });
  });

  //  DELETE event
  router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM events WHERE id = ?";
    db.query(sql, [id], (err) => {
      if (err) {
        console.error("Error deleting event:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(200).json({ message: "Event deleted successfully." });
    });
  });

  return router;
};
