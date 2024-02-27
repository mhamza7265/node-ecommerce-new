const { body, validationResult } = require("express-validator");

module.exports = {
  addressValidation: [
    body("address").exists().withMessage("Address is required!"),
    body("city").exists().withMessage("City is required!"),
    body("state").exists().withMessage("State is required!"),
    body("country").exists().withMessage("Country is required!"),
  ],
  handleAddressValidationErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ status: false, error: errors.array() });
    }
    next();
  },
};
