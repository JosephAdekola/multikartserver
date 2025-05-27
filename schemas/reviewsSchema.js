const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "allproduct",
        required: true
    },
    rating: {
        type: Number,
        max: 5,
        min: 1,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Prevent duplicate reviews for the same user and product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
