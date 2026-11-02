const db = require("../config/db");


// ===============================
// GET ADMIN DASHBOARD STATISTICS
// ===============================

const getDashboardStats = async (req, res) => {

    try {

        // Total users
        const [users] = await db.query(
            `SELECT COUNT(*) AS total
             FROM users`
        );

        // Total donors
        const [donors] = await db.query(
            `SELECT COUNT(*) AS total
             FROM donors`
        );

        // Total recipients
        const [recipients] = await db.query(
            `SELECT COUNT(*) AS total
             FROM recipients`
        );

        // Pending blood requests
        const [pendingRequests] = await db.query(
            `SELECT COUNT(*) AS total
             FROM blood_requests
             WHERE status = 'Pending'`
        );

        // Total blood stock
        const [bloodStock] = await db.query(
            `SELECT COALESCE(SUM(quantity), 0) AS total
             FROM blood_stock`
        );

        // Approved donations
        const [approvedDonations] = await db.query(
            `SELECT COUNT(*) AS total
             FROM donations
             WHERE status = 'Approved'`
        );

        res.json({

            totalUsers:
                users[0].total,

            totalDonors:
                donors[0].total,

            totalRecipients:
                recipients[0].total,

            pendingRequests:
                pendingRequests[0].total,

            totalBloodStock:
                bloodStock[0].total,

            approvedDonations:
                approvedDonations[0].total
        });

    } catch (error) {

        console.log(
            "Admin Dashboard Stats Error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to load dashboard statistics"
        });
    }
};
// =====================================
// GET PENDING DONATIONS
// =====================================

const getPendingDonations = async (req, res) => {

    try {

        const [donations] = await db.query(`
            SELECT
                donations.donation_id,
                donations.blood_group,
                donations.quantity,
                donations.donation_date,
                donations.status,
                donors.donor_id,
                users.name,
                users.email,
                users.phone
            FROM donations
            JOIN donors
                ON donations.donor_id = donors.donor_id
            JOIN users
                ON donors.user_id = users.user_id
            WHERE donations.status = 'Pending'
            ORDER BY donations.donation_id DESC
        `);

        res.json(donations);

    } catch (error) {

        console.log(
            "Pending Donations Error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to load pending donations"
        });

    }

};

// =====================================
// GET SCHEDULED DONATIONS
// =====================================

const getScheduledDonations = async (req, res) => {

    try {

        const [donations] = await db.query(`
            SELECT
                donations.donation_id,
                donations.blood_group,
                donations.quantity,
                donations.donation_date,
                donations.status,

                donors.donor_id,

                users.name,
                users.email,
                users.phone

            FROM donations

            JOIN donors
                ON donations.donor_id =
                   donors.donor_id

            JOIN users
                ON donors.user_id =
                   users.user_id

            WHERE donations.status = 'Scheduled'

            ORDER BY donations.donation_date ASC
        `);

        res.json(donations);

    } catch (error) {

        console.log(
            "Scheduled Donations Error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to load scheduled donations"
        });

    }

};


// =====================================
// MOVE DUE SCHEDULED DONATIONS TO PENDING
// =====================================

const processScheduledDonations = async () => {

    try {

        const [result] = await db.query(
            `UPDATE donations
             SET status = 'Pending'
             WHERE status = 'Scheduled'
             AND donation_date <= CURDATE()`
        );

        if (result.affectedRows > 0) {

            console.log(
                `${result.affectedRows} scheduled donation(s) moved to Pending`
            );

        }

    } catch (error) {

        console.log(
            "Process Scheduled Donations Error:",
            error
        );

    }

};


// =====================================
// GET DONATION HISTORY
// =====================================

const getDonationHistory = async (req, res) => {

    try {

        const [donations] = await db.query(`
            SELECT
                donations.donation_id,
                donations.blood_group,
                donations.quantity,
                donations.donation_date,
                donations.status,

                donors.donor_id,

                users.name,
                users.email,
                users.phone

            FROM donations

            JOIN donors
                ON donations.donor_id =
                   donors.donor_id

            JOIN users
                ON donors.user_id =
                   users.user_id

            ORDER BY donations.donation_id DESC
        `);

        res.json(donations);

    } catch (error) {

        console.log(
            "Donation History Error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to load donation history"
        });
    }
};


// =====================================
// APPROVE OR REJECT DONATION
// =====================================

const updateDonationStatus = async (req, res) => {

    const donationId = req.params.id;
    const { status } = req.body;

    let connection;

    try {

        // Only Approved or Rejected are allowed
        if (
            status !== "Approved" &&
            status !== "Rejected"
        ) {

            return res.status(400).json({
                message:
                    "Invalid donation status"
            });

        }

        // Create database connection
        connection = await db.getConnection();

        // Start transaction
        await connection.beginTransaction();


        // Get donation
        const [donations] =
            await connection.query(
                `SELECT *
                 FROM donations
                 WHERE donation_id = ?
                 FOR UPDATE`,
                [donationId]
            );


        if (donations.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                message:
                    "Donation not found"
            });

        }


        const donation = donations[0];


        // Only Pending donations can be processed
        if (donation.status !== "Pending") {

            await connection.rollback();

            return res.status(400).json({
                message:
                    "Only pending donations can be approved or rejected"
            });

        }


        // If donation is being rejected
        if (status === "Rejected") {

            await connection.query(
                `UPDATE donations
                 SET status = 'Rejected'
                 WHERE donation_id = ?`,
                [donationId]
            );

            await connection.commit();

            return res.json({
                message:
                    "Donation rejected successfully"
            });

        }


        // If donation is being approved,
        // increase blood stock
        if (status === "Approved") {

            const [stockRows] =
                await connection.query(
                    `SELECT quantity
                     FROM blood_stock
                     WHERE blood_group = ?
                     FOR UPDATE`,
                    [donation.blood_group]
                );


            if (stockRows.length === 0) {

                await connection.rollback();

                return res.status(404).json({
                    message:
                        "Blood group not found in stock"
                });

            }


            // Increase blood stock
            await connection.query(
                `UPDATE blood_stock
                 SET quantity = quantity + ?
                 WHERE blood_group = ?`,
                [
                    donation.quantity,
                    donation.blood_group
                ]
            );


            // Update donation status
            await connection.query(
                `UPDATE donations
                 SET status = 'Approved'
                 WHERE donation_id = ?`,
                [donationId]
            );

        }


        // Commit all changes
        await connection.commit();


        res.json({
            message:
                `Donation ${status.toLowerCase()} successfully`
        });


    } catch (error) {

        // Rollback if anything fails
        if (connection) {

            try {
                await connection.rollback();
            } catch (rollbackError) {

                console.log(
                    "Rollback Error:",
                    rollbackError
                );

            }

        }


        console.log(
            "Donation Status Error:",
            error
        );


        res.status(500).json({
            message:
                "Unable to update donation status"
        });


    } finally {

        // Release database connection
        if (connection) {
            connection.release();
        }

    }

};
// =====================================
// GET PENDING BLOOD REQUESTS
// =====================================

const getPendingBloodRequests = async (req, res) => {

    try {

        const [requests] = await db.query(`
            SELECT
                blood_requests.request_id,
                blood_requests.blood_group,
                blood_requests.quantity,
                blood_requests.request_date,
                blood_requests.status,

                recipients.recipient_id,

                users.name,
                users.email,
                users.phone,

                recipients.hospital,
                recipients.address

            FROM blood_requests

            JOIN recipients
                ON blood_requests.recipient_id =
                   recipients.recipient_id

            JOIN users
                ON recipients.user_id =
                   users.user_id

            WHERE blood_requests.status = 'Pending'

            ORDER BY blood_requests.request_id DESC
        `);


        res.json(requests);


    } catch (error) {

        console.log(
            "Pending Blood Requests Error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to load pending blood requests"
        });

    }

};


// =====================================
// APPROVE OR REJECT BLOOD REQUEST
// =====================================

const updateBloodRequestStatus = async (req, res) => {

    const requestId = req.params.id;
    const { status } = req.body;

    let connection;

    try {

        // ===============================
        // CHECK VALID STATUS
        // ===============================

        if (
            status !== "Approved" &&
            status !== "Rejected"
        ) {

            return res.status(400).json({
                message:
                    "Invalid blood request status"
            });

        }


        // ===============================
        // GET DATABASE CONNECTION
        // ===============================

        connection =
            await db.getConnection();


        // ===============================
        // START TRANSACTION
        // ===============================

        await connection.beginTransaction();


        // ===============================
        // FIND REQUEST
        // ===============================

        const [requests] =
            await connection.query(
                `SELECT *
                 FROM blood_requests
                 WHERE request_id = ?
                 FOR UPDATE`,
                [requestId]
            );


        if (requests.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                message:
                    "Blood request not found"
            });

        }


        const request =
            requests[0];


        // ===============================
        // CHECK REQUEST STATUS
        // ===============================

        if (request.status !== "Pending") {

            await connection.rollback();

            return res.status(400).json({
                message:
                    "This blood request has already been processed"
            });

        }


        // ===============================
        // REJECT REQUEST
        // ===============================

        if (status === "Rejected") {

            await connection.query(
                `UPDATE blood_requests
                 SET status = 'Rejected'
                 WHERE request_id = ?`,
                [requestId]
            );


            await connection.commit();


            return res.json({
                message:
                    "Blood request rejected successfully"
            });

        }


        // ===============================
        // GET BLOOD STOCK
        // ===============================

        const [stockRows] =
            await connection.query(
                `SELECT quantity
                 FROM blood_stock
                 WHERE blood_group = ?
                 FOR UPDATE`,
                [request.blood_group]
            );


        if (stockRows.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                message:
                    "Blood group not found in stock"
            });

        }


        const availableStock =
            stockRows[0].quantity;


        // ===============================
        // CHECK AVAILABLE STOCK
        // ===============================

        if (
            availableStock <
            request.quantity
        ) {

            await connection.rollback();

            return res.status(400).json({
                message:
                    `Insufficient ${request.blood_group} blood stock. Available: ${availableStock} units`
            });

        }


        // ===============================
        // DEDUCT BLOOD STOCK
        // ===============================

        await connection.query(
            `UPDATE blood_stock
             SET quantity = quantity - ?
             WHERE blood_group = ?`,
            [
                request.quantity,
                request.blood_group
            ]
        );


        // ===============================
        // APPROVE REQUEST
        // ===============================

        await connection.query(
            `UPDATE blood_requests
             SET status = 'Approved'
             WHERE request_id = ?`,
            [requestId]
        );


        // ===============================
        // SAVE TRANSACTION
        // ===============================

        await connection.commit();


        res.json({
            message:
                "Blood request approved successfully"
        });


    } catch (error) {

        // ===============================
        // ROLLBACK IF ERROR OCCURS
        // ===============================

        if (connection) {

            try {

                await connection.rollback();

            } catch (rollbackError) {

                console.log(
                    "Rollback Error:",
                    rollbackError
                );

            }

        }


        console.log(
            "Blood Request Status Error:",
            error
        );


        res.status(500).json({
            message:
                "Unable to update blood request"
        });


    } finally {

        // ===============================
        // RELEASE CONNECTION
        // ===============================

        if (connection) {

            connection.release();

        }

    }

};

module.exports = {
    getDashboardStats,
    getPendingDonations,
    getScheduledDonations,
    getDonationHistory,
    updateDonationStatus,
    getPendingBloodRequests,
    updateBloodRequestStatus
};