const cartSchema = require("../schemas/cartSchema");
const productModel = require("../schemas/productSchema");
const { usersModel } = require("../schemas/usersSchema");
const orderModel = require("../schemas/orderSchema");
const { v4: uuidv4 } = require("uuid");
const { default: axios } = require("axios");
const crypto = require("crypto");
const { sendOrderSummary } = require("../utils/email");

require('dotenv').config()

const createOrderHandler = async (req, res) => {
    const { email,
        phone,
        country,
        address,
        city,
        state,
        postalCode } = req.body;

    try {
        const findUser = await usersModel.findOne({ email });
        if (!findUser) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const findUserCart = await cartSchema.findOne({ userId: findUser._id });
        if (!findUserCart || findUserCart.items.length === 0) {
            return res.status(400).json({ message: "Your cart is empty, please add items to cart first" });
        }

        const gatherAllProducts = await Promise.all(
            findUserCart.items.map(async (item) => {
                const product = await productModel.findById(item.product);
                if (!product) {
                    throw new Error(`Product with ID ${item.product} not found`);
                }
                return {
                    product: product._id,
                    quantity: item.quantity,
                    unitPrice: product.price,
                };
            })
        );

        // Calculate total amount
        const totalAmount = gatherAllProducts.reduce(
            (acc, item) => acc + item.unitPrice * item.quantity,
            0
        );

        const paymentReference = uuidv4();

        // Initialize payment on Paystack
        const transaction = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: totalAmount * 100, // Paystack expects amount in kobo
                reference: paymentReference,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACKSECRETE}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!transaction) {
            return res.status(400).json({ message: "your order could not be processed" })
        }

        console.log(transaction);


        const newOrder = new orderModel({
            userId: findUserCart.userId,
            items: gatherAllProducts,
            paymentReference,
            total: totalAmount,
            phone,
            country,
            address,
            city,
            state,
            postalCode
        });

        const savedOrder = await newOrder.save();

        // Send authorization URL and order info to client
        return res.status(201).json({
            order: savedOrder,
            authorization_url: transaction.data.data.authorization_url,
            reference: paymentReference,
            callback_url: "http://localhost:5173/checkout"
        });
    } catch (error) {
        console.error("Order creation error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const getRefFromFront = async (req, res) => {
    const { reference } = req.params;

    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACKSECRETE}`
                }
            }
        );

        if (response.data.status && response.data.data.status === 'success') {
            res.json({ success: true, data: response.data.data });
        } else {
            res.json({ success: false, message: 'Payment not successful', data: response.data.data });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
    }
};


const handlePaystackWebhook = async (req, res) => {
    try {
        const hash = crypto.createHmac("sha512", process.env.PAYSTACKSECRETE)
            .update(req.rawBody)
            .digest("hex");

        if (hash !== req.headers["x-paystack-signature"]) {
            return res.status(401).send("Unauthorized webhook");
        }

        const event = req.body;

        if (event.event === "charge.success") {
            const reference = event.data.reference;

            const updatedOrder = await orderModel.findOneAndUpdate(
                { paymentReference: reference, status: { $ne: "paid" } },
                { status: "paid" },
                { new: true }
            )
                .populate('items.product')
                .exec()

            if (!updatedOrder) {
                console.log(`Order already processed or not found for ref: ${reference}`);
                return res.sendStatus(200);
            }

            // Reduce stock
            await Promise.all(
                updatedOrder.items.map(async (item) => {
                    await productModel.findByIdAndUpdate(item.product, {
                        $inc: { stock: -item.quantity }
                    });
                })
            );

            // Clear cart
            await cartSchema.findOneAndUpdate(
                { userId: updatedOrder.userId },
                { $set: { items: [] } }
            );

            const user = await usersModel.findOne({ _id: updatedOrder.userId })
            await sendOrderSummary({
                email: user.email,
                orderNumber: updatedOrder._id,
                customerName: user.firstName,
                orderItems: updatedOrder.items,
                subtotal: updatedOrder.subtotal || updatedOrder.total,
                shipping: updatedOrder.shippingCost || 0,
                total: updatedOrder.total,
                orderDate: updatedOrder.createdAt
            });

            console.log("✅ Order processed, stock updated, cart cleared:", updatedOrder._id);
            return res.sendStatus(200);
        }

        return res.sendStatus(200);
    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(500).send("Server error");
    }
};

const userOrders = async (req, res) => {
    const { userId } = req.body;

    try {
        const getUserOrders = await orderModel.find({ userId }).populate("items.product", "title");

        if (getUserOrders.length === 0) {
            return res.status(404).json({ message: "No recent orders found for this user" });
        }

        return res.status(200).json({ data: getUserOrders });
    } catch (error) {
        console.error("Cannot get user orders:", error.message);
        return res.status(500).send("Server error");
    }
};


module.exports = {
    createOrderHandler,
    getRefFromFront,
    handlePaystackWebhook,
    userOrders
};