const express = require("express");

const {
    getRecipientProfile,
    createBloodRequest,
    getMyBloodRequests
} = require("../controllers/recipientController");

const {
    verifyToken,
    checkRole
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================
// GET RECIPIENT PROFILE
// =====================================

router.get(
    "/profile",
    verifyToken,
    checkRole("recipient"),
    getRecipientProfile
);


// =====================================
// CREATE BLOOD REQUEST
// =====================================

router.post(
    "/requests",
    verifyToken,
    checkRole("recipient"),
    createBloodRequest
);


// =====================================
// GET MY BLOOD REQUESTS
// =====================================

router.get(
    "/requests",
    verifyToken,
    checkRole("recipient"),
    getMyBloodRequests
);


module.exports = router;