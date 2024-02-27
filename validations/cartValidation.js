const { body, validationResult } = require("express-validator");

module.exports = {
  cartValidation: [
    body("id").exists().withMessage("Product id is required!"),
    body("quantity").exists().withMessage("Quantity is required!"),
  ],
  handleCartValidationErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ status: false, error: errors.array() });
    }
    next();
  },
};
