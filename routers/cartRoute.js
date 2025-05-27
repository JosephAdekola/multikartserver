const express = require("express")
const { addToCart, customerCart, deleteCartItem, changeCartQuantity } = require("../controlers/cartControl")

const cartRouter = express.Router()

cartRouter.post("/add-to-cart", addToCart)
cartRouter.get("/get-my-cart", customerCart)
cartRouter.post("/delete-cart", deleteCartItem)
cartRouter.post("/change-cart-quantity", changeCartQuantity)


module.exports = cartRouter