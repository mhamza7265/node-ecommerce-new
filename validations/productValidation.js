const { body, validationResult } = require("express-validator");

module.exports = {
  createProductValidation: [
    body("sku").exists().withMessage("SKU is required!"),
    body("name").exists().withMessage("Name is required!"),
    body("description").exists().withMessage("Description is required!"),
    body("category").exists().withMessage("Category is required!"),
    body("quantity").exists().withMessage("Quantity is required"),
    body("price").exists().withMessage("Price is required!"),
    body("discount.applicable")
      .exists()
      .withMessage("Applicable field is required!"),
  ],
  handleProductValidationErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ status: false, errors });
    }
    next();
  },
};
