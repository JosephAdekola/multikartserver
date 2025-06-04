
const express = require("express")
const { createOrderHandler, 
        getRefFromFront, 
        userOrders, 
        allOrders,
        changeOrderStatus,
        singleOrderDetails} = require("../controlers/orderControl")

const orderRouter = express.Router()

orderRouter.post("/create-order", createOrderHandler)
orderRouter.get("/verify-payment/:reference", getRefFromFront)
orderRouter.post("/my-orders", userOrders)
orderRouter.get("/all-orders", allOrders)
orderRouter.post("/change-status", changeOrderStatus)
orderRouter.post("/order-details", singleOrderDetails)


module.exports = orderRouter