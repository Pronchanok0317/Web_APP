const pool = require("../db/mysqlDb");

async function getTypes(req, res) {
  const keyword = (req.query.search || "").trim();
  const params = keyword ? [`%${keyword}%`] : [];
  const sql = keyword
    ? "SELECT typeId, name FROM types WHERE name LIKE ? ORDER BY typeId"
    : "SELECT typeId, name FROM types ORDER BY typeId";

  try {
    const [types] = await pool.query(sql, params);
    res.json(types);
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({ error: "Database error" });
  }
}

async function getTypeById(req, res) {
  try {
    const [rows] = await pool.query("SELECT typeId, name FROM types WHERE typeId = ?", [req.params.id]);
    const type = rows[0];

    if (!type) {
      return res.status(404).json({ error: "Type not found" });
    }

    res.json(type);
  } catch (error) {
    console.error("Error fetching type:", error);
    res.status(500).json({ error: "Database error" });
  }
}

async function createType(req, res) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const [result] = await pool.query("INSERT INTO types (name) VALUES (?)", [name.trim()]);
    res.status(201).json({ typeId: result.insertId, name: name.trim() });
  } catch (error) {
    console.error("Error creating type:", error);
    res.status(500).json({ error: "Database error" });
  }
}

async function updateType(req, res) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const [result] = await pool.query("UPDATE types SET name = ? WHERE typeId = ?", [
      name.trim(),
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Type not found" });
    }

    res.json({ typeId: Number(req.params.id), name: name.trim() });
  } catch (error) {
    console.error("Error updating type:", error);
    res.status(500).json({ error: "Database error" });
  }
}

async function deleteType(req, res) {
  try {
    const [usedRows] = await pool.query("SELECT COUNT(*) AS total FROM menus WHERE typeId = ?", [
      req.params.id,
    ]);

    if (usedRows[0].total > 0) {
      return res.status(409).json({ error: "This type is used by menus" });
    }

    const [result] = await pool.query("DELETE FROM types WHERE typeId = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Type not found" });
    }

    res.json({ message: "Type deleted", typeId: Number(req.params.id) });
  } catch (error) {
    console.error("Error deleting type:", error);
    res.status(500).json({ error: "Database error" });
  }
}

module.exports = {
  getTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
};
