const express = require("express");
const { compareProductPrices } = require("../controllers/compareController");

const router = express.Router();

router.get("/", compareProductPrices);

module.exports = router;
