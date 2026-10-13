const express = require("express");
const typeController = require("../controllers/typeController");

const router = express.Router();

router.get("/", typeController.getTypes);
router.get("/:id", typeController.getTypeById);
router.post("/", typeController.createType);
router.put("/:id", typeController.updateType);
router.delete("/:id", typeController.deleteType);

module.exports = router;
