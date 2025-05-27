const mongoose = require("mongoose")


const allProductsScheem = mongoose.Schema(
    {
        images:{
            type: [String],
            required: [true, "your images must be an array of strings"]
        },
        rating:{
            type: String,
            default: "0"
        },
        title: {
            type: String,
            required: [true, "your title must be a string"]
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        price:{
            type: Number,
            required: true
        },
        old_price:{
            type: Number,
            required: true
        },
        quantity:{
            type: Number,
            default: 1
        },
        colour: {
            type: Array,
            required: true
        },
        sizes: {
            type: Array,
            required: true
        },
        discount: {
            type: String
        },
        productDetail: {
            type: String,
            required: true
        },
        stock: {
            type: Number,
            required: true,
            default: 1
        },
        description: {
            type: String,
            default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
        },
        details: {
            type: String,
            default:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        video: {
            type: String,
            default: "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        productCode: {
            type: String,
            required: true,
            unique: true
        }
    },
    {timestamps: true}
)

const productModel = mongoose.model("allproduct", allProductsScheem)

module.exports = productModel