const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorhandler");
const AdminImage = require("../models/AdminImage");
const cloudinary = require("cloudinary").v2;

// upload slider images ---admin
exports.uploadSliderImg = catchAsyncErrors(async (req, res, next) => {

  const user = await User.findById(req.user._id);
  if (!user) {
      return next(new ErrorHandler("User not found", 404));
  }

  // Validate uploaded files
  if (!req.files || !req.files.sliderImg) {
    return next(new ErrorHandler("No images uploaded", 400));
  }

  let imagesArray = [];

  if (Array.isArray(req.files.sliderImg)) {
    imagesArray = req.files.sliderImg;
  } else {
    imagesArray.push(req.files.sliderImg);
  }



  const imagesLinks = [];

  for (let i = 0; i < imagesArray.length; i++) {

    const file = imagesArray[i];

    if (!file.tempFilePath) {
      return next(new ErrorHandler("Invalid file structure", 400));
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "Layout",
    });



    imagesLinks.push({
      url: result.secure_url,
      public_id: result.public_id,
    });
  }

  let sliderImage = await AdminImage.findOne({ userId: req.user._id });

  if (sliderImage) {
    // Add new images to the existing sliderImg array
    sliderImage.sliderImg = [...sliderImage.sliderImg, ...imagesLinks];
    await sliderImage.save();
  } else {
    // Create a new document if none exists
    sliderImage = await AdminImage.create({
      userId: req.user._id,
      sliderImg: imagesLinks,
    });
  }

  res.status(201).json({
    success: true,
    message: "Pictures uploaded successfully",
    sliderImage,
  });

});

// upload logo image ---admin
exports.uploadLogo = catchAsyncErrors(async (req, res, next) => {
  
  const user = await User.findById(req.user._id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

  // Check if an image is included in the request
  if (!req.files || !req.files.logoImg) {
    return next(new ErrorHandler("Logo image is required", 400));
  }

  const logoImage = req.files.logoImg;

  // Find existing AdminImage for the user
  let adminImage = await AdminImage.findOne({ userId: req.user._id });

  if (adminImage && adminImage.logoImg && adminImage.logoImg.public_id) {
    // If AdminImage exists and has a logo, delete the existing logo
    await cloudinary.uploader.destroy(adminImage.logoImg.public_id);
  }

  // Upload the new logo to Cloudinary only once
  const uploadResult = await cloudinary.uploader.upload(logoImage.tempFilePath, {
    folder: 'Layout',
  });

  if (adminImage) {
    // Update the existing AdminImage document
    adminImage.logoImg = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };
    await adminImage.save();
  } else {
    // Create a new AdminImage document
    adminImage = await AdminImage.create({
      userId: req.user._id,
      logoImg: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: "Logo uploaded successfully",
    adminImage,
  });
});

// get images ---admin
exports.getAdminImages = catchAsyncErrors(async (req, res, next) => {
  
  const adminImages = await AdminImage.find();

  res.status(200).json({
    success: true,
    adminImages
  });
});

// delete images ---admin
exports.deleteAdminImage = catchAsyncErrors(async (req, res, next) => {
  // Find the user
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler(`User does not exist with Id: ${req.user._id}`, 400));
  }

  const adminImage = await AdminImage.findOne({ userId: req.user._id });

  if (!adminImage) {
    return next(new ErrorHandler("No image found for the given user", 404));
  }


  const { public_id } = req.body;

  if (!public_id) {
    return next(new ErrorHandler("PublicId is required to delete the image", 400));
  }

  
  const result = await cloudinary.uploader.destroy(public_id);

  if (result.result !== "ok") {
    return next(new ErrorHandler("Failed to delete the image from Cloudinary", 500));
  }


  adminImage.sliderImg = adminImage.sliderImg.filter(img => img.public_id !== public_id);

  
  await adminImage.save();

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
  });
});



