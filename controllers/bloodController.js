const db = require("../config/db");


// ==========================================
// GET BLOOD STOCK
// ==========================================

const getBloodStock = async (req, res) => {

    try {

        const [stock] = await db.query(
            `SELECT
                stock_id,
                blood_group,
                quantity,
                last_updated
             FROM blood_stock
             ORDER BY stock_id`
        );


        res.json(stock);


    } catch (error) {

        console.log(
            "Blood Stock Error:",
            error
        );


        res.status(500).json({

            message:
                "Unable to retrieve blood stock"

        });

    }

};


module.exports = {
    getBloodStock
};