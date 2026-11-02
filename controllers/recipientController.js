const db = require("../config/db");


// =====================================
// GET RECIPIENT PROFILE
// =====================================

const getRecipientProfile = async (req, res) => {

    try {

        const userId = req.user.userId;

        const [recipients] = await db.query(
            `SELECT
                recipients.recipient_id,
                users.name,
                users.email,
                users.phone,
                recipients.blood_group_required,
                recipients.age,
                recipients.hospital,
                recipients.address
             FROM recipients
             JOIN users
                ON recipients.user_id = users.user_id
             WHERE recipients.user_id = ?`,
            [userId]
        );


        if (recipients.length === 0) {

            return res.status(404).json({
                message: "Recipient profile not found"
            });

        }


        res.json(recipients[0]);


    } catch (error) {

        console.log(
            "Recipient Profile Error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to retrieve recipient profile"
        });

    }

};

// =====================================
// CREATE BLOOD REQUEST
// =====================================

const createBloodRequest = async (req, res) => {

    try {

        const userId = req.user.userId;

        const {
            bloodGroup,
            quantity
        } = req.body;


        // ===============================
        // BASIC VALIDATION
        // ===============================

        if (!bloodGroup || !quantity) {

            return res.status(400).json({
                message:
                    "Blood group and quantity are required"
            });

        }


        // ===============================
        // VALID BLOOD GROUP
        // ===============================

        const validBloodGroups = [
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-"
        ];


        if (
            !validBloodGroups.includes(
                bloodGroup
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid blood group"
            });

        }


        // ===============================
        // QUANTITY VALIDATION
        // ===============================

        const requestQuantity =
            Number(quantity);


        if (
            !Number.isInteger(requestQuantity) ||
            requestQuantity <= 0
        ) {

            return res.status(400).json({
                message:
                    "Request quantity must be a positive whole number"
            });

        }


        // ===============================
        // MAXIMUM REQUEST QUANTITY
        // ===============================

        if (requestQuantity > 5) {

            return res.status(400).json({
                message:
                    "Blood request quantity cannot exceed 5 units"
            });

        }


        // ===============================
        // FIND RECIPIENT
        // ===============================

        const [recipients] = await db.query(
            `SELECT recipient_id
             FROM recipients
             WHERE user_id = ?`,
            [userId]
        );


        if (recipients.length === 0) {

            return res.status(404).json({
                message:
                    "Recipient profile not found"
            });

        }


        const recipientId =
            recipients[0].recipient_id;


        // ===============================
        // INSERT BLOOD REQUEST
        // ===============================

        const [result] = await db.query(
            `INSERT INTO blood_requests
            (recipient_id, blood_group, quantity)
            VALUES (?, ?, ?)`,
            [
                recipientId,
                bloodGroup,
                requestQuantity
            ]
        );


        // ===============================
        // SUCCESS RESPONSE
        // ===============================

        res.status(201).json({

            message:
                "Blood request submitted successfully",

            requestId:
                result.insertId

        });


    } catch (error) {

        console.log(
            "Blood Request Error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to submit blood request"
        });

    }

};


// =====================================
// GET MY BLOOD REQUESTS
// =====================================

const getMyBloodRequests = async (req, res) => {

    try {

        const userId = req.user.userId;


        const [requests] = await db.query(
            `SELECT
                blood_requests.request_id,
                blood_requests.blood_group,
                blood_requests.quantity,
                blood_requests.request_date,
                blood_requests.status
             FROM blood_requests
             JOIN recipients
                ON blood_requests.recipient_id =
                   recipients.recipient_id
             WHERE recipients.user_id = ?
             ORDER BY blood_requests.request_id DESC`,
            [userId]
        );


        res.json(requests);


    } catch (error) {

        console.log(
            "Blood Request History Error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to retrieve blood requests"
        });

    }

};


module.exports = {
    getRecipientProfile,
    createBloodRequest,
    getMyBloodRequests
};