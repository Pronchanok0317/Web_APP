const pool = require("../db/mysqlDb");

function formatMenu(row) {
  return {
    menuId: row.menuId,
    id: row.menuId,
    name: row.name,
    price: Number(row.price),
    isBestSeller: Boolean(row.isBestSeller),
    typeId: row.typeId,
    type: {
      typeId: row.typeId,
      id: row.typeId,
      name: row.typeName,
    },
    code: `TH-${String(row.menuId).padStart(3, "0")}`,
    image: imageForMenu(row.name),
    description: descriptionForMenu(row.name),
  };
}

function imageForMenu(name) {
  const images = {
    "ส้มตำไทย": "/images/Somtam.jpg",
    "ผัดไทยกุ้งสด": "/images/PadThai.jpg",
    "ต้มยำกุ้งน้ำข้น": "/images/Tomyum.jpg",
    "ไก่ทอดสมุนไพร": "/images/ChickenFried.jpg",
  };

  return images[name] || "/images/lotus.png";
}

function descriptionForMenu(name) {
  const descriptions = {
    "ส้มตำไทย": "ส้มตำรสจัดจ้าน ครบรสเปรี้ยว หวาน เค็ม เผ็ด ตำสดใหม่ทุกจาน",
    "ผัดไทยกุ้งสด": "เส้นผัดไทยเหนียวนุ่ม ผัดกับซอสสูตรพิเศษ เสิร์ฟพร้อมกุ้งสด",
    "ต้มยำกุ้งน้ำข้น": "ต้มยำกุ้งน้ำข้นรสเข้มข้น หอมสมุนไพรไทย เปรี้ยวเผ็ดกลมกล่อม",
    "ไก่ทอดสมุนไพร": "ไก่ทอดหมักเครื่องเทศและสมุนไพรไทย กรอบนอกนุ่มใน",
  };

  return descriptions[name] || "เมนูประจำร้านอาหารสัตตบุษย์";
}

async function getMenus(req, res) {
  const keyword = (req.query.search || "").trim();
  const params = keyword ? [`%${keyword}%`] : [];
  const sql = `
    SELECT menus.menuId, menus.name, menus.price, menus.isBestSeller, menus.typeId, types.name AS typeName
    FROM menus
    INNER JOIN types ON menus.typeId = types.typeId
    ${keyword ? "WHERE menus.name LIKE ?" : ""}
    ORDER BY menus.menuId
  `;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(formatMenu));
  } catch (error) {
    console.error("Error fetching menus:", error);
    res.status(500).json({ error: "Database error" });
  }
}

async function getMenuById(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT menus.menuId, menus.name, menus.price, menus.isBestSeller, menus.typeId, types.name AS typeName
       FROM menus
       INNER JOIN types ON menus.typeId = types.typeId
       WHERE menus.menuId = ?`,
      [req.params.id]
    );
    const menu = rows[0];

    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }

    res.json(formatMenu(menu));
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ error: "Database error" });
  }
}

async function createMenu(req, res) {
  const { name, typeId, price, isBestSeller } = req.body;

  if (!name || !typeId || !price) {
    return res.status(400).json({ error: "name, typeId and price are required" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO menus (name, price, isBestSeller, typeId) VALUES (?, ?, ?, ?)",
      [name.trim(), Number(price), isBestSeller ? 1 : 0, Number(typeId)]
    );
    req.params.id = result.insertId;
    return getMenuById(req, res);
  } catch (error) {
    console.error("Error creating menu:", error);
    res.status(500).json({ error: "Database error" });
  }
}

async function updateMenu(req, res) {
  const { name, typeId, price, isBestSeller } = req.body;

  if (!name || !typeId || !price) {
    return res.status(400).json({ error: "name, typeId and price are required" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE menus SET name = ?, price = ?, isBestSeller = ?, typeId = ? WHERE menuId = ?",
      [name.trim(), Number(price), isBestSeller ? 1 : 0, Number(typeId), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menu not found" });
    }

    return getMenuById(req, res);
  } catch (error) {
    console.error("Error updating menu:", error);
    res.status(500).json({ error: "Database error" });
  }
}

async function deleteMenu(req, res) {
  try {
    const [result] = await pool.query("DELETE FROM menus WHERE menuId = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menu not found" });
    }

    res.json({ message: "Menu deleted", menuId: Number(req.params.id) });
  } catch (error) {
    console.error("Error deleting menu:", error);
    res.status(500).json({ error: "Database error" });
  }
}

module.exports = {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
};
