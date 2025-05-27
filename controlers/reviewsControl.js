const Review = require("../schemas/reviewsSchema");
const productModel = require("../schemas/productSchema");
const reviewsSchema = require("../schemas/reviewsSchema");

// Add or update a review
const addReview = async (req, res) => {
    const { userId, productId, rating, comment } = req.body;

    if (!userId || !productId || rating == null) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        // Check if user has already reviewed the product
        const existingReview = await reviewsSchema.findOne({ userId, productId });

        let review;

        if (existingReview) {
            // Update existing review
            review = await reviewsSchema.findByIdAndUpdate(
                existingReview._id,
                { rating, comment },
                { new: true }
            );
            console.log("Review updated:", review);
        } else {
            // Create new review
            review = await reviewsSchema.create({ userId, productId, rating, comment });
            console.log("Review created:", review);
        }

        // Recalculate average rating
        const allReviews = await reviewsSchema.find({ productId });

        const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        console.log("New average rating:", averageRating);

        // Update the product rating
        const updatedProduct = await productModel.findByIdAndUpdate(
            productId,
            { rating: averageRating },
            { new: true }
        );

        return res.status(201).json({message: "review posted successfully", review: updatedProduct});
    } catch (error) {
        console.error("Error adding/updating review:", error.message);
        return res.status(500).json({
            error: "Unable to process review. Please try again later."
        });
    }
};


const getProductReviews = async (req, res) => {
  const { productId } = req.body;  

  try {
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required to get all product reviews." });
    }

    const productReviews = await Review.find({ productId })
      .populate("userId", "firstName lastName email")
      .populate("productId", "title price images");

    if (!productReviews || productReviews.length === 0) {
      return res.status(404).json({ message: "This product has no reviews yet." });
    }

    return res.status(200).json(productReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    return res.status(500).json({
      error: "Unable to fetch reviews. Please try again later."
    });
  }
};


module.exports = {
    addReview,
    getProductReviews
};
