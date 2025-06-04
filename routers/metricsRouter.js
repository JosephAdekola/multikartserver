
const express = require("express")
const { salesMetrics, orderNotification } = require("../controlers/metricsControl")

const metricsRouter = express.Router()

metricsRouter.post("/sales-metrics", salesMetrics)
metricsRouter.get("/orders-notification", orderNotification)


module.exports = metricsRouter