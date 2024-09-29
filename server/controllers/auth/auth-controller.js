const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Cart = require("../../models/Cart")

//register
const registerUser = async (req, res) => {
  const { userName, userAddress, phoneNo, beatName, password } = req.body;

  try {
    const checkUser = await User.findOne({ phoneNo });
    if (checkUser)
      return res.json({
        success: false,
        message: "Shop Already exists with the same phone no! Please try again",
      });

    // const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      userAddress,
      phoneNo,
      beatName,
      password: password,
    });
   

    await newUser.save();

    // Create a new cart for the user
    const newCart = new Cart({
      userId: newUser._id,
      items: [], // Start with an empty cart
    });
    await newCart.save();

    res.status(200).json({
      success: true,
      message: "Shop Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { phoneNo, password } = req.body;

  try {
    const checkUser = await User.findOne({ phoneNo });
    if (!checkUser)
      return res.json({
        success: false,
        message: "Shop doesn't exists! Please register first",
      });

      const checkPasswordMatch = password === checkUser.password;

    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        phoneNo: checkUser.phoneNo,
        userName: checkUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "30d" }
    );

    res.cookie("token", token, { httpOnly: false, secure: false }).json({ 
      success: true,
      message: "Logged in successfully",
      user: {
        token:token,
        phoneNo: checkUser.phoneNo,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//logout

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };
