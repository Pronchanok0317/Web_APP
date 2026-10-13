const express = require("express");
const path = require("path");

const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const typeRoutes = require("./routes/typeRoutes");

const app = express();
const PORT = process.env.PORT || 5010;
const HOST = "127.0.0.1";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get(["/", "/home"], (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/menu", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "menu.html"));
});

app.get("/order", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "order.html"));
});

app.get("/api", (req, res) => {
  res.json({
    message: "Lab10 Restaurant API is running",
    endpoints: ["/api/types", "/api/menus", "/api/orders"],
  });
});

app.use("/api/types", typeRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Lab10 is running on http://${HOST}:${PORT}`);
});

server.on("error", (error) => {
  console.error("Cannot start server:", error.message);
});
