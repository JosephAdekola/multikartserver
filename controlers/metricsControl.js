const orderModel = require("../schemas/orderSchema");

const salesMetrics = async (req, res) => {
    try {
        const { range } = req.body;

        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - (range - 1));


        const salesData = await orderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate.toISOString().split("T")[0]),
                        $lte: new Date(today.toISOString().split("T")[0] + "T23:59:59.999Z")
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    total: { $sum: "$total" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    total: 1
                }
            }
        ]);


        const dateMap = {};
        for (let i = 0; i < range; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const isoDate = date.toISOString().split("T")[0];
            dateMap[isoDate] = 0;
        }

        for (const entry of salesData) {
            dateMap[entry.date] = entry.total;
        }

        const result = Object.entries(dateMap).map(([date, total]) => ({
            date,
            total
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error("Error generating sales chart data:", error);
        res.status(500).json({ message: "Unable to fetch sales data." });
    }
};

module.exports = {
    salesMetrics
}