const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateUser = async (req, res, next) => {
  try {
    const verify = jwt.verify(
      req.headers.authorization.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    if (verify) {
      req.headers = verify;
      if (!verify.passwordCreated) {
        return res.json({
          status: false,
          type: "updatePassword",
          error: "Update password first",
        });
        // return res.redirect("http://localhost:5173/updatePw");
      } else {
        next();
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
