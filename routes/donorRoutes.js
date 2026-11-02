const express = require("express");

const {
    getDonorProfile,
    addDonation,
    getDonationHistory
} = require("../controllers/donorController");

const {
    verifyToken
} = require("../middleware/authMiddleware");


const router = express.Router();


// Get donor profile
router.get(
    "/profile",
    verifyToken,
    getDonorProfile
);


// Add donation
router.post(
    "/donate",
    verifyToken,
    addDonation
);


// Donation history
router.get(
    "/donations",
    verifyToken,
    getDonationHistory
);


module.exports = router;