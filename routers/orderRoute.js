
const express = require("express")
const { createOrderHandler, 
        getRefFromFront, 
        userOrders, 
        metrics } = require("../controlers/orderControl")

const orderRouter = express.Router()

orderRouter.post("/create-order", createOrderHandler)
orderRouter.get("/verify-payment/:reference", getRefFromFront)
orderRouter.post("/my-orders", userOrders)
orderRouter.get("/get-metrics", metrics)


module.exports = orderRouter