const express = require("express");

const {
    getBloodStock
} = require("../controllers/bloodController");


const router = express.Router();


// Get blood stock

router.get(
    "/stock",
    getBloodStock
);


module.exports = router;