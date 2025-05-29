const express = require("express")
const dotenv = require('dotenv')
const { default: mongoose } = require("mongoose")
const { productRouter } = require("./routers/productsRoute")
const cors = require("cors")
const userRouter = require("./routers/usersRoute")
const cartRouter = require("./routers/cartRoute")
const orderRouter = require("./routers/orderRoute")
const { handlePaystackWebhook } = require("./controlers/orderControl")
const reviewsRouter = require("./routers/reviewsRoute")
const metricsRouter = require("./routers/metricsRouter")


const app = express()
app.use(cors())
dotenv.config()

const PORT = 7077


app.post("/paystack/webhook", 
    express.json({ verify: (req, res, buf) => { req.rawBody = buf } }), 
    handlePaystackWebhook)

app.use(express.json())

app.use("/api/v1/products", productRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1/order", orderRouter)
app.use("/api/v1/reviews", reviewsRouter)
app.use("/api/v1/metrics", metricsRouter)




mongoose.connect(process.env.DBURI).
then(()=>{
    app.listen(process.env.PORT || PORT, (req, res)=>{
        console.log("DB connected Successfully");
        console.log(`App is now running on port ${process.env.PORT}`);
        
    })
}).
catch((e)=>{
    console.log(e);    
})

app.get("/", (req, res)=>{
    res.status(200).json({message: "welcome aboard"})
})




