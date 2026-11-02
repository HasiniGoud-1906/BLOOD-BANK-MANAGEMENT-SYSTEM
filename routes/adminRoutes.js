const express = require("express");

const {
    getDashboardStats,
    getPendingDonations,
    getScheduledDonations,
    getDonationHistory,
    updateDonationStatus,
    getPendingBloodRequests,
    updateBloodRequestStatus
} = require("../controllers/adminController");

const {
    verifyToken,
    checkRole
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================
// ADMIN DASHBOARD STATISTICS
// =====================================

router.get(
    "/stats",
    verifyToken,
    checkRole("admin"),
    getDashboardStats
);


// =====================================
// PENDING DONATIONS
// =====================================

router.get(
    "/donations",
    verifyToken,
    checkRole("admin"),
    getPendingDonations
);
router.get(
    "/donations/scheduled",
    verifyToken,
    checkRole("admin"),
    getScheduledDonations
);
router.get(
    "/donations/history",
    verifyToken,
    checkRole("admin"),
    getDonationHistory
);


// =====================================
// APPROVE / REJECT DONATION
// =====================================

router.put(
    "/donations/:id/status",
    verifyToken,
    checkRole("admin"),
    updateDonationStatus
);


// =====================================
// PENDING BLOOD REQUESTS
// =====================================

router.get(
    "/requests",
    verifyToken,
    checkRole("admin"),
    getPendingBloodRequests
);


// =====================================
// APPROVE / REJECT BLOOD REQUEST
// =====================================

router.put(
    "/requests/:id/status",
    verifyToken,
    checkRole("admin"),
    updateBloodRequestStatus
);


module.exports = router;