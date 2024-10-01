const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const nodemailer = require("nodemailer");
const User = require("../../models/User");

// Configure your email transport
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service
  auth: {
    user: "gozoomtechnologies@gmail.com", // Your email address
    pass: "qwuyqyxwiystcbhf", // Your email password (consider using environment variables)
  },
});

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      salesmanId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod, // Payment method should now be 'COD' only
      paymentStatus, // This will be 'pending' initially for COD
      totalAmount,
      orderDate,
      orderUpdateDate,
      cartId,
    } = req.body;

   

    // Directly create the order for COD without PayPal logic
    const newlyCreatedOrder = new Order({
      userId,
      salesmanId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: 'pending', // Set the initial status as 'pending'
      paymentMethod: 'COD', // Payment method is now COD
      paymentStatus: 'pending', // Payment status is 'pending' initially
      totalAmount,
      orderDate,
      orderUpdateDate,
    });

    await newlyCreatedOrder.save();

    const salesmanDetails = salesmanId
    ? await User.findOne({ _id: salesmanId, role: "salesman" }) // Fetch user where role is salesman
    : null;
    // Determine who placed the order: Salesman or Shop Owner
const orderPlacedBy = salesmanId && salesmanDetails
? `Salesman: ${salesmanDetails.userName}, Phone: ${salesmanDetails.phoneNo}`
: 'Shop Owner';

    // Prepare the email content
    const mailOptions = { 
      from: "gozoomtechnologies@gmail.com",
      to: "shashwatmbd@gmail.com", // Admin email address
      subject: `New Order Received - Order ID: ${newlyCreatedOrder._id}`,
      html: `
        <h1>New Order Details</h1>
        <p><strong>Order ID:</strong> ${newlyCreatedOrder._id}</p>
         <p><strong>Placed by:</strong> ${orderPlacedBy}</p>
        <p><strong>Shop Name:</strong> ${addressInfo.shopName}</p>
        <p><strong>Delivery Address:</strong> ${addressInfo.address}</p>
        <p><strong>Contact:</strong> ${addressInfo.phone}</p>
        <h2>Cart Items</h2>
        <ul>
          ${cartItems
            .map(
              (item) => `<li>${item.title} - Quantity: ${item.quantity}, Total Price: ₹${item.price * item.quantity}</li>`
            )
            .join("")}
        </ul>
        <p>Thank you for using our service @Shashwat Enterprises!</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: 'Order created successfully with COD',
      orderId: newlyCreatedOrder._id,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while creating the order!',
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order cannot be found',
      });
    }

    // Update order and payment status for COD after delivery
    order.paymentStatus = 'paid'; // COD, payment is marked as paid after delivery
    order.orderStatus = 'confirmed'; // Order confirmed on delivery

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for product ${item.title}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    // Remove the cart after the order is confirmed
    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order confirmed and payment completed for COD',
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while capturing payment!',
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: 'No orders found!',
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while fetching orders!',
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found!',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while fetching order details!',
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
