const { body, validationResult } = require("express-validator");

module.exports = {
  loginValidation: [
    body("email")
      .exists()
      .withMessage("email is required!")
      .isEmail()
      .withMessage("Enter a valid email!"),
    body("password")
      .exists()
      .withMessage("Password is required!")
      .isLength({ min: 6 })
      .withMessage("Password length should atleast be 6!"),
    body("userRole").exists().withMessage("User role is required!"),
  ],
  handleLoginValidationErrors: (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.json({ status: false, Error: error.array() });
    }
    next();
  },
};
