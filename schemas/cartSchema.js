const { default: mongoose } = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "allproduct",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: [1, "Quantity must be at least 1"]
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  items: [cartItemSchema]
}, { timestamps: true });

cartSchema.index({ userId: 1 });

module.exports = mongoose.model("Cart", cartSchema);
