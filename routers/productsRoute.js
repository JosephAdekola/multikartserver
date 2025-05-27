const express = require("express")
const { addProduct, 
    allProducts, 
    singleProduct, 
    productUpdater, 
    productDeleter,
    productCategory} = require("../controlers/productControl.js")

const productRouter = express.Router()

productRouter.post("/addproduct", addProduct)
productRouter.get("/allproducts", allProducts)
productRouter.get("/singleProduct/:code", singleProduct)
productRouter.post("/updateproduct", productUpdater)
productRouter.post("/deleteproduct", productDeleter)
productRouter.post("/category", productCategory)

module.exports = {productRouter}