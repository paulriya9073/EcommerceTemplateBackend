const Product = require("../models/Product")
const cloudinary = require("cloudinary").v2 ;
const User = require("../models/User");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandler");
const ApiFeatures = require("../utils/apiFeatures");
const Review = require("../models/Review");
const { errorMonitor } = require("nodemailer/lib/xoauth2");


// PRODUCT CONTROLLERS-----
// create product ---Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

        const { productName, description,basePrice,tax, price, stock, category} = req.body;
    
            if (!productName || !description || !price || !stock || !category) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide all required fields: productName, description, price, stock, category"
                });
            }
    
            let imagesArray = [];
    
            if (req.files && req.files.images) {
                if (Array.isArray(req.files.images)) {
                    imagesArray=req.files.images;
                } else {
                    imagesArray.push(req.files.images);
                }
            }
    
            const imagesLinks = [];
    
            for (let i = 0; i < imagesArray.length; i++) {
                const file=imagesArray[i]
                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    folder: "products",
                });
    
                imagesLinks.push({
                    // public_id: result.public_id,
                    url: result.secure_url,
                    public_id:result.public_id
                });
            }
    
            
    
            const product = await Product.create({
                productName,
                description,
                images: imagesLinks,
                basePrice,
                tax,
                price,
                stock,
                category
            });
    
            res.status(201).json({
                success: true,
                product,
            message:"Product Created",
            });
    });

// get all products
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {

    
    const productCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        

    let products = await apiFeature.query

    let filteredProductsCount = products.length

    res.status(201).json({
        success: true,
        products,
        productCount,
        filteredProductsCount
    })
});

// get single product details
exports.getSingleProductDetails = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id).populate('reviews')

    res.status(201).json({
        success: true,
        product,
    })
});


// get all products---admin
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {

    const products = await Product.find();

    const totalNumberOfProducts=await Product.countDocuments()

    res.status(200).json({
        success: true,
        products,
        totalNumberOfProducts
    });
});

// update product---admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    let product = await Product.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler("login first!", 401))
    }

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }


            let imagesArray = [];
            const imagesLinks = [];

    
            if (req.files && req.files.images) {
                if (Array.isArray(req.files.images)) {
                    imagesArray=req.files.images;
                } else {
                    imagesArray.push(req.files.images);
                }
            }

            if (imagesArray.length > 0) {
                // Deleting Images From Cloudinary only if new images are provided
                for (let i = 0; i < product.images.length; i++) {
                    await cloudinary.uploader.destroy(product.images[i].public_id);
                }
            
                for (let i = 0; i < imagesArray.length; i++) {
                    const file = imagesArray[i];
                    const result = await cloudinary.uploader.upload(file.tempFilePath, {
                        folder: "products",
                    });
            
                    imagesLinks.push({
                        public_id: result.public_id,
                        url: result.secure_url,
                    });
                }
            
                req.body.images = imagesLinks;
            } else {
                // Preserve existing images if no new images are uploaded
                req.body.images = product.images;
            }
            

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: "product Updated",
        product
    });
});

// delete product---admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    const product = await Product.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler("login first!", 401))
    }

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    if (product.images && product.images.length > 0) {
        for (const image of product.images) {
            if (image.public_id) {
                await cloudinary.uploader.destroy(image.public_id);
            }
        }
    }

    await Product.deleteOne({ _id: product._id })

    res.status(200).json({
        success: true,
        message: "product deleted"
    });
});

// REVIEW CONTROLLERS----
// create review and update the review
exports.createReview = catchAsyncErrors(async (req, res, next) => {

    const { comment, rating } = req.body;
    const productId = req.params.id

    const product = await Product.findById(productId).populate('reviews');

    if (!product) {
        return next(new ErrorHandler("product not found", 404))
    }

    const isReviewed = await Review.findOne({ user: req.user._id , product: productId })

    if (isReviewed) {

        isReviewed.comment = comment
        isReviewed.rating = rating

        await isReviewed.save()

        let avg = 0;

        for (let i = 0; i < product.reviews.length; i++) {

            const rev = await Review.findById(product.reviews[i]);

            if (rev) avg += rev.rating;
        }

        product.ratings = avg / product.reviews.length;

        await product.save()

        res.status(201).json({
            success: true,
            message: "Review updated successfully",
            isReviewed
        });
    }
    else {

        const review = await Review.create({
            comment,
            rating,
            user: req.user._id,
            userName: req.user.username,
            product: req.params.id,
        })

        product.reviews.push(review._id);
        product.numOfReviews = product.reviews.length;

        let avg = 0;

        for (let i = 0; i < product.reviews.length; i++) {

            const rev = await Review.findById(product.reviews[i]);

            if (rev) avg += rev.rating;
        }

        product.ratings = avg / product.reviews.length;

        await product.save();

        res.status(201).json({
            success: true,
            message: "Review Created successfully",
            review
        });
    }
})

//Get reviews of single product -- user
// exports.getReviewsOfSingleProduct

// // Get all reviews --admin
exports.getAllProductsReviews = catchAsyncErrors(async (req, res, next) => {

    const reviews = await Review.find();

    res.status(200).json({
        success: true,
        reviews,
       
    });
})

// delete review-----both user & admin
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {

    const reviewId = req.params.id

    const review = await Review.findById(reviewId)

    if (!review)
        return next(new ErrorHandler("Review not found", 404));

    if (review.user.toString() !== req.user._id.toString())
        return next(new ErrorHandler("Not Authorized to delete this review", 403))

    const product = await Product.findById(review.product)

    if (!product)
        return next(new ErrorHandler("Product not found", 404));

    // remove the review from product reviews array
    product.reviews = product.reviews.filter(id => id.toString() !== reviewId.toString())

    product.numOfReviews = product.reviews.length

    // recalculate rating if there is any reviews left
    if (product.numOfReviews > 0) {

        let copyReviews = product.reviews

        let avg = 0

        for (let i = 0; i < product.reviews.length; i++) {

            const rev = await Review.findById(copyReviews[i])

            avg += rev.rating
        }

        product.ratings = avg / product.reviews.length;
    }

    else {
        product.ratings = 0
    }

    await product.save()

    await Review.deleteOne({ _id: reviewId })

    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
    });
});

