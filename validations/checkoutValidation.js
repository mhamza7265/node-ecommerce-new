const { body, validationResult } = require("express-validator");

module.exports = {
  checkoutValidation: [
    body("address").exists().withMessage("Address is required!"),
    body("city").exists().withMessage("City is required!"),
    body("state").exists().withMessage("State is required!"),
    body("country").exists().withMessage("Country is required!"),
    body("cartId").exists().withMessage("Cart id is required!"),
    body("cartItems").exists().withMessage("Cart item(s) required!"),
    body("subTotal").exists().withMessage("Subtotal is required!"),
    body("discount").exists().withMessage("Discount is required!"),
    body("grandTotal").exists().withMessage("Grandtotal is required!"),
    body("paymentType").exists().withMessage("Payment type is required!"),
  ],
  handleCheckoutValidationErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ status: false, error: errors.array() });
    }
    next();
  },
};
