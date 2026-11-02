const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");


// ===============================
// REGISTER USER
// ===============================

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            phone,
            role,

            bloodGroup,
            age,
            gender,
            address,

            requiredBloodGroup,
            recipientAge,
            hospital,
            recipientAddress

        } = req.body;


        // ===============================
        // BASIC VALIDATION
        // ===============================

        if (!name || !email || !password || !role) {

            return res.status(400).json({
                message: "Please fill all required fields"
            });

        }


        // ===============================
        // EMAIL VALIDATION
        // ===============================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            return res.status(400).json({
                message: "Please enter a valid email address"
            });

        }


        // ===============================
        // PASSWORD VALIDATION
        // ===============================

        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must contain at least 6 characters"
            });

        }


        // ===============================
        // ROLE VALIDATION
        // ===============================

        if (
            role !== "donor" &&
            role !== "recipient"
        ) {

            return res.status(400).json({
                message: "Invalid role"
            });

        }


        // ===============================
        // BLOOD GROUP LIST
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


        // ===============================
        // DONOR VALIDATION
        // ===============================

        if (role === "donor") {

            if (!bloodGroup) {

                return res.status(400).json({
                    message:
                        "Please select your blood group"
                });

            }

            if (!validBloodGroups.includes(bloodGroup)) {

                return res.status(400).json({
                    message:
                        "Invalid blood group"
                });

            }

            if (!age) {

                return res.status(400).json({
                    message:
                        "Please enter your age"
                });

            }

            if (age < 18 || age > 65) {

                return res.status(400).json({
                    message:
                        "Donor age must be between 18 and 65"
                });

            }

            if (!gender) {

                return res.status(400).json({
                    message:
                        "Please select your gender"
                });

            }

            if (!address) {

                return res.status(400).json({
                    message:
                        "Please enter your address"
                });

            }

        }


        // ===============================
        // RECIPIENT VALIDATION
        // ===============================

        if (role === "recipient") {

            if (!requiredBloodGroup) {

                return res.status(400).json({
                    message:
                        "Please select the required blood group"
                });

            }

            if (
                !validBloodGroups.includes(
                    requiredBloodGroup
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid required blood group"
                });

            }

            if (!recipientAge) {

                return res.status(400).json({
                    message:
                        "Please enter recipient age"
                });

            }

            if (
                recipientAge < 1 ||
                recipientAge > 120
            ) {

                return res.status(400).json({
                    message:
                        "Please enter a valid recipient age"
                });

            }

            if (!hospital) {

                return res.status(400).json({
                    message:
                        "Please enter hospital name"
                });

            }

            if (!recipientAddress) {

                return res.status(400).json({
                    message:
                        "Please enter recipient address"
                });

            }

        }


        // ===============================
        // CHECK DUPLICATE EMAIL
        // ===============================

        const [existingUser] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );


        if (existingUser.length > 0) {

            return res.status(400).json({
                message:
                    "Email already registered"
            });

        }


        // ===============================
        // HASH PASSWORD
        // ===============================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ===============================
        // INSERT USER
        // ===============================

        const [result] = await db.query(
            `INSERT INTO users
            (name, email, password, phone, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                phone,
                role
            ]
        );


        // Get newly created user ID

        const userId =
            result.insertId;


        // ===============================
        // ADD DONOR INFORMATION
        // ===============================

        if (role === "donor") {

            await db.query(
                `INSERT INTO donors
                (user_id, blood_group, age, gender, address)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    userId,
                    bloodGroup,
                    age,
                    gender,
                    address
                ]
            );

        }


        // ===============================
        // ADD RECIPIENT INFORMATION
        // ===============================

        if (role === "recipient") {

            await db.query(
                `INSERT INTO recipients
                (user_id, blood_group_required, age, hospital, address)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    userId,
                    requiredBloodGroup,
                    recipientAge,
                    hospital,
                    recipientAddress
                ]
            );

        }


        // ===============================
        // REGISTRATION RESPONSE
        // ===============================

        res.status(201).json({

            message:
                "Registration successful",

            userId:
                userId

        });


    } catch (error) {

        console.log(
            "Registration Error:",
            error
        );

        res.status(500).json({

            message:
                "Server error during registration"

        });

    }

};


// ==========================================
// LOGIN USER
// ==========================================

const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ===============================
        // LOGIN VALIDATION
        // ===============================

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Please enter email and password"
            });

        }


        // ===============================
        // EMAIL VALIDATION
        // ===============================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            return res.status(400).json({
                message:
                    "Please enter a valid email address"
            });

        }


        // ===============================
        // FIND USER
        // ===============================

        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );


        if (users.length === 0) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        const user =
            users[0];


        // ===============================
        // COMPARE PASSWORD
        // ===============================

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        // ===============================
        // CREATE JWT TOKEN
        // ===============================

        const token =
            jwt.sign(

                {
                    userId:
                        user.user_id,

                    role:
                        user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "1d"
                }

            );


        // ===============================
        // LOGIN RESPONSE
        // ===============================

        res.json({

            message:
                "Login successful",

            token:
                token,

            user: {

                userId:
                    user.user_id,

                name:
                    user.name,

                email:
                    user.email,

                phone:
                    user.phone,

                role:
                    user.role

            }

        });


    } catch (error) {

        console.log(
            "Login Error:",
            error
        );


        res.status(500).json({

            message:
                "Server error during login"

        });

    }

};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {

    registerUser,
    loginUser

};