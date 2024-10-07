const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], subcategory=[], sortBy = "price-lowtohigh", page = 1, limit = 12 } = req.query;
    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }
    if (subcategory.length) {
      filters.subcategory = { $in: subcategory.split(",") };
    }

    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    // Pagination logic
    const skip = (page - 1) * limit;
    
    const totalProducts = await Product.countDocuments(filters);  // Get total count for pagination
    const products = await Product.find(filters).sort(sort).skip(skip).limit(Number(limit));

    res.status(200).json({
      success: true,
      data: products,
      page: Number(page),
      limit: Number(limit),
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

// New function to get products sorted by number of reviews
const getBestReviewProducts = async (req, res) => {
  try {
    // Limit to 12 products sorted by number of reviews in descending order
    const products = await Product.find()
      .sort({ averageReview: -1 }) // Assuming you have a field `numberOfReviews`
      .limit(12);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails, getBestReviewProducts };
