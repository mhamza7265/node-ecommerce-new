const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

const authenticateUser = async (req, res, next) => {
  try {
    const verify = jwt.verify(
      req.headers.authorization.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    if (verify) {
      try {
        const user = await User.findOne({ _id: verify.id });
        if (user.blocked) {
          return res.status(500).json({
            status: false,
            error: "Your account is locked, please contact admin/super-admin.",
          });
        } else if (!verify.passwordCreated) {
          return res.json({
            status: false,
            type: "updatePassword",
            error: "Update password first",
          });
          // return res.redirect("http://localhost:5173/updatePw");
        } else {
          req.headers = verify;
          next();
        }
      } catch (err) {
        return res
          .status(500)
          .json({ status: false, error: "Internal server error" });
      }
    }
  } catch (err) {
    return res.json({
      status: false,
      type: "loginToContinue",
      error: "Please login to continue",
    });
  }
};

module.exports = authenticateUser;
