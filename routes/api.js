const express = require("express");
const upload = require("../middlewares/fileStorage");

const authMiddleware = require("../middlewares/auth");
const checkRoleMiddleware = require("../middlewares/checkRole");

const {
  createCategoryValidation,
  handleValidationErrors,
} = require("../validations/categoryValidation");
const {
  userValidation,
  handleUserValidationErrors,
} = require("../validations/userValidation");
const {
  createProductValidation,
  handleProductValidationErrors,
} = require("../validations/productValidation");

const {
  cartValidation,
  handleCartValidationErrors,
} = require("../validations/cartValidation");

const {
  addressValidation,
  handleAddressValidationErrors,
} = require("../validations/addressValidation");

const {
  wishlistValidation,
  handleWishlistValidationErrors,
} = require("../validations/wishlistValidation");

const {
  checkoutValidation,
  handleCheckoutValidationErrors,
} = require("../validations/checkoutValidation");

const {
  addCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
  getCategoriesByPage,
} = require("../controllers/categoryController");

const {
  addProduct,
  getAllProducts,
  getProductsByCategory,
  deleteSingleProduct,
  getBestSellingProducts,
  getSingleProduct,
  updateProduct,
  filterProducts,
  productAvailableQuantity,
  productQuantityMultiple,
  getProductsByPage,
} = require("../controllers/productController");

const {
  registerUser,
  loginUser,
  editUser,
  getAllUsers,
  getCurrentUser,
  updatePassword,
  userRole,
  blockUnblockUser,
  getUsersByPage,
  deleteUser,
  userListSelect2,
  verifyUser,
  changeRole,
  sendEmailVerification,
  resetPassword,
  registerUserDevice,
} = require("../controllers/userController");

const {
  createCart,
  getAllProductsFromCart,
  getCartLength,
  deleteProductFromCart,
  deleteCart,
  checkout,
  getOrderedCart,
  getTotals,
} = require("../controllers/cartController");

const {
  addAddress,
  getAddress,
  editAddress,
} = require("../controllers/addressController");
const {
  createCheckout,
  orderDetails,
  singleOrderDetails,
  orderStatus,
  createPayment,
  paymentIntent,
  getAllOrders,
  processOrder,
  getAllOrdersByPage,
  getCustomerOrdersByPage,
  dashboardData,
} = require("../controllers/checkoutController");

const {
  configureWishlist,
  wishlistQuantity,
  getWishlistWithPages,
  getWishlist,
} = require("../controllers/wishlistController");

const {
  initiateLogin,
  handleGoogleLogin,
} = require("../controllers/googleAuthController");

const {
  initiateFBLogin,
  handleFBLogin,
} = require("../controllers/facebookAuthController");
const loginValidation = require("../validations/loginValidation");

const {
  saveNotification,
  getNotifications,
} = require("../controllers/notificationController");

/**********************************************************************************************************/

const app = express();

//routes
app.get("/", async (req, res) => {
  return res.json("Hello World!");
});

app.get("/auth/google", initiateLogin);
app.get("/auth/google/callback", handleGoogleLogin);

app.get("/auth/facebook", initiateFBLogin);
app.get("/auth/facebook/callback", handleFBLogin);

app.get("/user/role", userRole);

app.post("/saveNotification", saveNotification);
app.get("/notifications", getNotifications);

app.get("/category", getAllCategories);
app.get("/category/:id", getSingleCategory);
app.get("/categories/listing", getCategoriesByPage);

app.get("/product", getAllProducts);
app.get("/product/single/:id", getSingleProduct);
app.get("/product/:id", getProductsByCategory);
app.post("/products/filter", filterProducts);
app.get("/product/quantity/:prodId", productAvailableQuantity);
app.post("/products", productQuantityMultiple);
app.get("/products/bestsell", getBestSellingProducts);
app.get("/products/listing", getProductsByPage);

app.post(
  "/register",
  upload.any(),
  userValidation,
  handleUserValidationErrors,
  registerUser
);
app.post(
  "/login",
  loginValidation.loginValidation,
  loginValidation.handleLoginValidationErrors,
  loginUser
);
app.post("/verify", verifyUser);
app.post("/sendEmail", sendEmailVerification);
app.put("/resetPw", resetPassword);

app.post("/user/password", updatePassword);

app.use(upload.any(), authMiddleware); //auth middleware
app.get("/users", getAllUsers);
app.get("/user", getCurrentUser);
app.put("/user", upload.any(), editUser);
app.post("/changeRole", changeRole);

app.post("/registerDevice", registerUserDevice);

app.post("/cart", cartValidation, handleCartValidationErrors, createCart);
app.get("/cart", getAllProductsFromCart);
app.get("/cart/qty", getCartLength);
app.delete("/cart", deleteProductFromCart);
app.delete("/cart/:cartId", deleteCart);
app.put("/checkout", checkout);
app.get("/ordered", getOrderedCart);
app.get("/cart/total", getTotals);

app.post(
  "/checkout",
  checkoutValidation,
  handleCheckoutValidationErrors,
  createCheckout
);
app.get("/orders", orderDetails);
app.get("/orders/listing", getAllOrdersByPage);
app.get("/order/:orderId", singleOrderDetails);
app.get("/order/status/:orderId", orderStatus);
app.post("/checkout/session", createPayment);
app.post("/create-confirm-intent", paymentIntent);

app.post(
  "/address",
  addressValidation,
  handleAddressValidationErrors,
  addAddress
);
app.get("/address", getAddress);
app.put("/address", editAddress);

app.post(
  "/wishlist",
  wishlistValidation,
  handleWishlistValidationErrors,
  configureWishlist
);
app.get("/wishlist", getWishlist);
app.get("/wishlist/listing", getWishlistWithPages);
app.get("/wishlist/qty", wishlistQuantity);

app.use(upload.any(), checkRoleMiddleware); //checkrole middleware

app.post(
  "/category/add",
  upload.any(),
  createCategoryValidation,
  handleValidationErrors,
  addCategory
);
app.put("/category/:id", upload.any(), updateCategory);
app.delete("/category/:id", deleteCategory);

app.post(
  "/product/add",
  upload.any(),
  createProductValidation,
  handleProductValidationErrors,
  addProduct
);
app.delete("/product/:id", deleteSingleProduct);
app.put("/product/:id", upload.any(), updateProduct);
app.get("/customerorders/:id", getAllOrders);
app.get("/customerorders/listing/:id", getCustomerOrdersByPage);
app.put("/order/process", processOrder);
app.put("/user/lock", blockUnblockUser);
app.get("/users/listing", getUsersByPage);
app.get("/users/options", userListSelect2);
app.post("/dashboard", dashboardData);
app.delete("/user", deleteUser);

module.exports = app;
