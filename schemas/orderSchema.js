const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "allproduct",
                required: true
            },
            unitPrice: {
                type: Number,
                required: true,
                min: 0
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "paid", "processing", "shipped", "delivered"]
    },
    phone: String,
    country: String,
    state: String,
    address: String,
    city: String,
    postalCode: String,
    total: {
        type: Number,
        required: true,
        min: 0
    },
    paymentReference: {
        type: String,
        unique: true,
        required: true
    }
}, { timestamps: true });


orderSchema.pre("save", function (next) {
    this.total = this.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    next();
});

module.exports = mongoose.model("order", orderSchema);
