const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

// Handle image upload
const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = `data:${req.file.mimetype};base64,${b64}`;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred during image upload.",
    });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      averageReview,
    } = req.body;

    const newlyCreatedProduct = new Product({
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      averageReview,
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the product.",
    });
  }
};

// Fetch all products with pagination
const fetchAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10
    const skip = (page - 1) * limit;

    const listOfProducts = await Product.find({})
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .skip(skip)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      success: true,
      data: listOfProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching products.",
    });
  }
};

const fetchAllOutOfStockProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.aggregate([
      {
        $match: {
          salePrice: { $gt: 1 }, // Match products with salePrice greater than 1
          // You can also include more conditions if necessary (e.g., stock availability)
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by createdAt in descending order
      },
    ]);

    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching products.",
    });
  }
};



// Edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      averageReview,
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Update fields only if they are provided in the request body
    if (title !== undefined) findProduct.title = title;
    if (description !== undefined) findProduct.description = description;
    if (category !== undefined) findProduct.category = category;
    if (brand !== undefined) findProduct.brand = brand;
    if (price !== undefined) findProduct.price = price === "" ? 0 : price;
    if (salePrice !== undefined) findProduct.salePrice = salePrice === "" ? 0 : salePrice;
    if (image !== undefined) findProduct.image = image;
    if (averageReview !== undefined) findProduct.averageReview = averageReview;

    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while editing the product.",
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the product.",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
  fetchAllOutOfStockProducts,
};
