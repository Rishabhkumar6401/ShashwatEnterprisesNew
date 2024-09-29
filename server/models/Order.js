const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: String,
  salesmanId:String,
  cartId: String,
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: String,
      quantity: Number,
    },
  ],
  addressInfo: {
    addressId: String,
    shopName:String,
    address: String,
    phone: String,
    notes: String,
  },
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  orderDate: Date,
  orderUpdateDate: Date,
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
