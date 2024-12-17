const mongoose = require("mongoose");
const Review = require("./Review");


const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: [true, "Enter product name"],
        trim: true
    },

    images: [
        {
            public_id: {
                type: String,
                required: [true, "Enter public id"]
            },
            url: {
                type: String,
                required: [true, "Enter url"]
            }
        }
    ]
    ,
    description: {
        type: String,
        required: [true, "Enter product description"]
    },
    basePrice :{
        type: Number,
        required: [true, "Enter product price"]

    },
    tax : {
        type:Number,
        required: [true, "Enter tax price"]
    },
    price: {
        type: Number,
        required: [true, "Enter product price"]
    },
    stock: {
        type: Number,
        required: [true, "Enter stock count"]
    },
    category: {
        type: String,
        required: [true, "Enter Category"],
        trim: true,
    },
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        },

    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },



})

module.exports = mongoose.model("Product", productSchema);