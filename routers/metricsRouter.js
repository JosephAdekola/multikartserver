
const express = require("express")
const { salesMetrics } = require("../controlers/metricsControl")

const metricsRouter = express.Router()

metricsRouter.post("/sales-metrics", salesMetrics)


module.exports = metricsRouter