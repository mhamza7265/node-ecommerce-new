const { body, validationResult } = require("express-validator");

module.exports = {
  userValidation: [
    body("email")
      .exists()
      .withMessage("email is required!")
      .isEmail()
      .withMessage("Enter a valid email!"),
    body("firstName").exists().withMessage("First name is required!"),
    body("lastName").exists().withMessage("Last name is required!"),
    body("password")
      .exists()
      .withMessage("Password is required!")
      .isLength({ min: 6 })
      .withMessage("Password length should atleast be 6!"),
    body("role").exists().withMessage("User role is required!"),
  ],
  handleUserValidationErrors: (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.json({ status: false, Error: error.array() });
    }
    next();
  },
};
