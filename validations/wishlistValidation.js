const { body, validationResult } = require("express-validator");

module.exports = {
  wishlistValidation: [
    body("prodId").exists().withMessage("Product id is required!"),
  ],
  handleWishlistValidationErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ status: false, error: errors.array() });
    }
    next();
  },
};
