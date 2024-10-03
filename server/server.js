const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const salesmanRouter = require("./routes/salesman/salesman-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const adminBeatRouter = require("./routes/admin/beats-route");
const adminBrandRouter = require("./routes/admin/brands-route");
const adminCategoryRouter = require("./routes/admin/categories-route");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const path = require("path");
const commonFeatureRouter = require("./routes/common/feature-routes");

//create a database connection -> u can also
//create a separate file for this and then import/use that file here

mongoose
  .connect("mongodb+srv://rishabh1234:EW5ibRCAbCDIt2vk@cluster0.uejtnl9.mongodb.net/NewEcommerce_app")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = 5000;



app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/beats", adminBeatRouter);
app.use("/api/admin/brand", adminBrandRouter);
app.use("/api/admin/category", adminCategoryRouter);
app.use("/api/salesman", salesmanRouter); // Use salesman routes

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

app.use("/api/common/feature", commonFeatureRouter);

app.use(express.static("public"))
app.use("/*",(req,res)=>{
  if (!req.originalUrl.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    res.status(404).json({ error: "API route not found" });
  }
})



app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
