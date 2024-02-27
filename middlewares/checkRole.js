const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkRole = async (req, res, next) => {
  const role = req.headers.role;

  if (role == "admin") {
    next();
  } else {
    return res.json({ status: false, error: "No administrative privilege!" });
  }
};

module.exports = checkRole;
