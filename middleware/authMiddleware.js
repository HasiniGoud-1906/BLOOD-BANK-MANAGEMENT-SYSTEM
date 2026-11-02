const jwt = require("jsonwebtoken");


// ==========================================
// VERIFY JWT TOKEN
// ==========================================

const verifyToken = (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({
                message:
                    "Access denied. Please login."
            });

        }


        const token =
            authHeader.split(" ")[1];


        if (!token) {

            return res.status(401).json({
                message:
                    "Access denied. Token missing."
            });

        }


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.user = decoded;


        next();


    } catch (error) {

        return res.status(401).json({
            message:
                "Invalid or expired token"
        });

    }

};


module.exports = {
    verifyToken
};

// ==========================================
// CHECK USER ROLE
// ==========================================

const checkRole = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({
                message: "Authentication required"
            });

        }


        if (!allowedRoles.includes(req.user.role)) {

            return res.status(403).json({
                message: "Access denied"
            });

        }


        next();

    };

};


module.exports = {
    verifyToken,
    checkRole
};