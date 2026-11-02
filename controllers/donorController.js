const db = require("../config/db");


// ==========================================
// GET DONOR PROFILE
// ==========================================

const getDonorProfile = async (req, res) => {

    try {

        const userId = req.user.userId;


        const [donors] = await db.query(
            `SELECT
                donors.donor_id,
                users.name,
                users.email,
                users.phone,
                donors.blood_group,
                donors.age,
                donors.gender,
                donors.address,
                donors.last_donation_date,
                donors.eligibility_status
             FROM donors
             JOIN users
             ON donors.user_id = users.user_id
             WHERE donors.user_id = ?`,
            [userId]
        );


        if (donors.length === 0) {

            return res.status(404).json({
                message: "Donor profile not found"
            });

        }


        res.json(donors[0]);


    } catch (error) {

        console.log(
            "Get Donor Profile Error:",
            error
        );


        res.status(500).json({
            message: "Server error"
        });

    }

};


// ==========================================
// ADD DONATION
// ==========================================

const addDonation = async (req, res) => {

    try {

        const userId = req.user.userId;

        const {
            quantity,
            donationDate
        } = req.body;


        console.log("DONATION DATE RECEIVED:", donationDate);
console.log("TODAY DATE:", new Date().toISOString().split("T")[0]);

        // ===============================
        // BASIC VALIDATION
        // ===============================

        if (!quantity || !donationDate) {

            return res.status(400).json({
                message:
                    "Quantity and donation date are required"
            });

        }


        // ===============================
        // QUANTITY VALIDATION
        // ===============================

        const donationQuantity =
            Number(quantity);

        if (
            !Number.isInteger(donationQuantity) ||
            donationQuantity <= 0
        ) {

            return res.status(400).json({
                message:
                    "Donation quantity must be a positive whole number"
            });

        }


        // ===============================
        // MAXIMUM QUANTITY VALIDATION
        // ===============================

        if (donationQuantity > 5) {

            return res.status(400).json({
                message:
                    "Donation quantity cannot exceed 5 units"
            });

        }


        // ===============================
        // DONATION DATE VALIDATION
        // ===============================

        const selectedDate =
            new Date(`${donationDate}T00:00:00`);

        if (
            isNaN(selectedDate.getTime())
        ) {

            return res.status(400).json({
                message:
                    "Please enter a valid donation date"
            });

        }


        // ===============================
        // PREVENT PAST DATES
        // ===============================

        const today = new Date();

        const todayDate =
            today.toISOString().split("T")[0];

        if (donationDate < todayDate) {

            return res.status(400).json({
                message:
                    "Donation date cannot be in the past"
            });

        }


        // ===============================
        // GET DONOR INFORMATION
        // ===============================

        const [donors] = await db.query(
            `SELECT
                donor_id,
                blood_group,
                eligibility_status
             FROM donors
             WHERE user_id = ?`,
            [userId]
        );


        if (donors.length === 0) {

            return res.status(404).json({
                message:
                    "Donor profile not found"
            });

        }


        const donor =
            donors[0];


        // ===============================
        // CHECK ELIGIBILITY
        // ===============================

        if (
            donor.eligibility_status !==
            "Eligible"
        ) {

            return res.status(400).json({
                message:
                    "You are currently not eligible to donate blood"
            });

        }


        // ===============================
        // CHECK EXISTING BOOKINGS
        // ===============================

        const [existingDonations] =
            await db.query(
                `SELECT
                    donation_id,
                    donation_date,
                    status
                 FROM donations
                 WHERE donor_id = ?
                 AND donation_date > CURDATE()
                 AND status ='scheduled'
                 ORDER BY donation_date ASC
                 LIMIT 1`,
                [donor.donor_id]
            );


        if (existingDonations.length > 0) {

            const existing =
                existingDonations[0];

            return res.status(400).json({
                message:
                    `You already have a donation scheduled or pending for ${existing.donation_date}. Please complete that donation before booking another one.`
            });

        }


        // ===============================
        // DETERMINE DONATION STATUS
        // ===============================

        let donationStatus = "Pending";

        if (donationDate > todayDate) {

            donationStatus = "Scheduled";

        }


        // ===============================
        // INSERT DONATION
        // ===============================

        const [result] = await db.query(
            `INSERT INTO donations
            (
                donor_id,
                blood_group,
                quantity,
                donation_date,
                status
            )



            VALUES (?, ?, ?, ?, ?)`,
            [
                donor.donor_id,
                donor.blood_group,
                donationQuantity,
                donationDate,
                donationStatus
            ]
        );


        const [checkInserted] = await db.query(
    `SELECT donation_id, donation_date, status
     FROM donations
     WHERE donation_id = ?`,
    [result.insertId]
);

console.log(
    "INSERTED DONATION FROM DATABASE:",
    checkInserted[0]
);


        // ===============================
        // UPDATE LAST DONATION DATE
        // ===============================

        if (donationDate === todayDate) {

            await db.query(
                `UPDATE donors
                 SET last_donation_date = ?
                 WHERE donor_id = ?`,
                [
                    donationDate,
                    donor.donor_id
                ]
            );

        }


        // ===============================
        // SUCCESS RESPONSE
        // ===============================

        if (donationStatus === "Scheduled") {

            return res.status(201).json({

                message:
                    "Donation scheduled successfully",

                donationId:
                    result.insertId

            });

        }


        res.status(201).json({

            message:
                "Donation recorded successfully",

            donationId:
                result.insertId

        });


    } catch (error) {

        console.log(
            "Add Donation Error:",
            error
        );


        res.status(500).json({
            message:
                "Server error while recording donation"
        });

    }

};
// ==========================================
// GET DONATION HISTORY
// ==========================================

const getDonationHistory = async (req, res) => {

    try {

        const userId = req.user.userId;


        const [donations] = await db.query(
            `SELECT
                donations.donation_id,
                donations.blood_group,
                donations.quantity,
                donations.donation_date,
                donations.status
             FROM donations
             JOIN donors
             ON donations.donor_id =
                donors.donor_id
             WHERE donors.user_id = ?
             ORDER BY donations.donation_date DESC`,
            [userId]
        );


        res.json(donations);


    } catch (error) {

        console.log(
            "Donation History Error:",
            error
        );


        res.status(500).json({
            message:
                "Server error"
        });

    }

};


module.exports = {

    getDonorProfile,
    addDonation,
    getDonationHistory

};