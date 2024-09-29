const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    
    brandName: {
        type: String,
        required: true,
        unique: true,
      },
      imageUrl: {
        type: String,
        required: true,
      },
  },
  { timestamps: true }
);

const Brands = mongoose.model("Brands", BrandSchema);
module.exports = Brands;
