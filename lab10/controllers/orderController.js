const pool = require("../db/mysqlDb");

async function findOrder(orderId) {
  const [orders] = await pool.query("SELECT * FROM orders WHERE orderId = ?", [orderId]);
  const order = orders[0];

  if (!order) {
    return null;
  }

  const [items] = await pool.query(
    `SELECT order_items.orderItemId, order_items.menuId, order_items.qty, order_items.note,
            order_items.price, order_items.subtotal, menus.name AS menuName
     FROM order_items
     INNER JOIN menus ON order_items.menuId = menus.menuId
     WHERE order_items.orderId = ?
     ORDER BY order_items.orderItemId`,
    [orderId]
  );

  return formatOrder(order, items);
}

function formatOrder(order, items) {
  return {
    orderId: order.orderId,
    id: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    deliveryDate: formatDate(order.deliveryDate),
    deliveryTime: String(order.deliveryTime).slice(0, 5),
    address: order.address,
    total: Number(order.total),
    createdAt: order.createdAt,
    items: items.map((item) => ({
      orderItemId: item.orderItemId,
      menuId: item.menuId,
      qty: item.qty,
      note: item.note || "",
      price: Number(item.price),
      subtotal: Number(item.subtotal),
      menu: {
        menuId: item.menuId,
        id: item.menuId,
        name: item.menuName,
      },
    })),
  };
}

function formatDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

async function getOrders(req, res) {
  try {
    const [orders] = await pool.query("SELECT * FROM orders ORDER BY orderId DESC");
    const result = [];

    for (const order of orders) {
      const fullOrder = await findOrder(order.orderId);
      result.push(fullOrder);
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Database error" });
  }
}

async function getOrderById(req, res) {
  try {
    const order = await findOrder(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Database error" });
  }
}

async function createOrder(req, res) {
  const { customerName, phone, deliveryDate, deliveryTime, address, items } = req.body;

  if (!customerName || !phone || !deliveryDate || !deliveryTime || !address || !Array.isArray(items)) {
    return res.status(400).json({ error: "order data is incomplete" });
  }

  const cleanItems = items
    .map((item) => ({
      menuId: Number(item.menuId),
      qty: Number(item.qty || 1),
      note: item.note || "",
    }))
    .filter((item) => item.menuId && item.qty > 0);

  if (cleanItems.length === 0) {
    return res.status(400).json({ error: "please select at least one menu" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const menuIds = cleanItems.map((item) => item.menuId);
    const placeholders = menuIds.map(() => "?").join(",");
    const [menus] = await connection.query(
      `SELECT menuId, name, price FROM menus WHERE menuId IN (${placeholders})`,
      menuIds
    );

    if (menus.length !== menuIds.length) {
      await connection.rollback();
      return res.status(400).json({ error: "some menuId does not exist" });
    }

    const total = cleanItems.reduce((sum, item) => {
      const menu = menus.find((row) => row.menuId === item.menuId);
      return sum + Number(menu.price) * item.qty;
    }, 0);

    const [orderResult] = await connection.query(
      `INSERT INTO orders (customerName, phone, deliveryDate, deliveryTime, address, total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customerName.trim(), phone.trim(), deliveryDate, deliveryTime, address.trim(), total]
    );

    const orderId = orderResult.insertId;
    const itemValues = cleanItems.map((item) => {
      const menu = menus.find((row) => row.menuId === item.menuId);
      const price = Number(menu.price);
      return [orderId, item.menuId, item.qty, item.note, price, price * item.qty];
    });

    await connection.query(
      `INSERT INTO order_items (orderId, menuId, qty, note, price, subtotal)
       VALUES ?`,
      [itemValues]
    );

    await connection.commit();
    const order = await findOrder(orderId);
    res.status(201).json(order);
  } catch (error) {
    await connection.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Database error" });
  } finally {
    connection.release();
  }
}

async function deleteOrder(req, res) {
  try {
    const [result] = await pool.query("DELETE FROM orders WHERE orderId = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order deleted", orderId: Number(req.params.id) });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Database error" });
  }
}

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  deleteOrder,
};
