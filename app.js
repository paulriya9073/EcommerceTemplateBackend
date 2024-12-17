const express= require("express")
const app=express()
const cookieParser=require("cookie-parser")
const cors=require("cors")

const path=require("path")

const errorMiddleware=require("./middleware/error")

const fileUpload=require('express-fileupload')


if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "config/config.env" });
  }

app.use(fileUpload({
  useTempFiles:true,
}))

app.use(express.json({limit:"50mb"}))
app.use(express.urlencoded({extended:true,limit:"50mb"}))
app.use(cookieParser())
app.use(cors())


const user=require("./routes/user")
const product=require("./routes/product")
const address=require("./routes/address")
const order=require("./routes/order")
const cart=require("./routes/cart")
const payment=require("./routes/payment")
const invoice=require("./routes/invoice")
const image=require("./routes/adminImage")



app.use("/api/v1",user);
app.use("/api/v1",product);
app.use("/api/v1",address);
app.use("/api/v1",order)
app.use("/api/v1",cart)
app.use("/api/v1",payment)
app.use("/api/v1",invoice)
app.use("/api/v1",image)



app.use(errorMiddleware)

module.exports=app