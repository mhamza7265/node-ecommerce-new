const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const {
  configureCart,
  calculate,
  calculateGrands,
} = require("../config/utility");

const createCart = async (req, res) => {
  const userId = req.headers.id;
  const prodId = req.body.id;
  let requestedQuantity = req.body.quantity;
  let requestedCalcQuantity = req.body.quantity;
  let decreaseQuantity = req.body.decreaseQuantity;
  let increaseQuantity = req.body.increaseQuantity;
  try {
    const product = await Product.findOne({ _id: prodId });
    if (!product)
      return res.send({ status: false, message: "Cannot find product." });
    let productQuantity = product.quantity;

    let cartStatusPending = await Cart.findOne({ userId, status: 1 });

    if (!decreaseQuantity) {
      if (productQuantity < requestedCalcQuantity) {
        return res.json({
          status: false,
          error: "Requested quantity is not available in the stocks!",
        });
      }
    }
    if (!cartStatusPending) {
      const cartItem = configureCart(prodId, product, requestedQuantity);

      try {
        const cart = await Cart.create({
          userId,
          status: 1,
          cartItems: [{ [prodId]: cartItem }],

          subTotal: calculate(
            "subTotal",
            requestedQuantity,
            product.price,
            product.discount.discountValue
          ),
          discount: product.discount.discountValue,
          grandTotal: calculate(
            "total",
            requestedQuantity,
            product.price,
            product.discount.discountValue
          ),
        });

        if (!decreaseQuantity) {
          await Product.updateOne(
            { _id: prodId },
            { quantity: productQuantity - requestedCalcQuantity }
          );
        }

        return res.json({
          status: true,
          cart,
          message: "Product added into the cart!",
        });
      } catch (err) {
        return res.json({ status: false, error: err });
      }
    } else {
      productAlreadyAvailable = false;
      if (cartStatusPending.cartItems[0][prodId] != undefined) {
        if (decreaseQuantity !== null && decreaseQuantity) {
          requestedQuantity =
            cartStatusPending.cartItems[0][prodId].quantity - requestedQuantity;
        } else {
          requestedQuantity += cartStatusPending.cartItems[0][prodId].quantity;
        }
      }
      const updatedCartItem = configureCart(prodId, product, requestedQuantity);
      cartStatusPending.cartItems[0][prodId] = updatedCartItem;
      let calculatedGrands = calculateGrands(cartStatusPending.cartItems[0]);
      try {
        let updatedCart = await Cart.updateOne(
          { _id: cartStatusPending },
          {
            cartItems: cartStatusPending.cartItems,
            subTotal: calculatedGrands.subTotal,
            discount: cartStatusPending.discount,
            grandTotal: calculatedGrands.grandTotal,
          }
        );

        if (!decreaseQuantity) {
          await Product.updateOne(
            { _id: prodId },
            { quantity: productQuantity - requestedCalcQuantity }
          );
        } else {
          await Product.updateOne(
            { _id: prodId },
            { quantity: productQuantity + requestedCalcQuantity }
          );
        }

        return res.status(200).json({
          status: true,
          cart: cartStatusPending,
          message:
            increaseQuantity || decreaseQuantity
              ? "Cart updated!"
              : "Product added into the cart!",
        });
      } catch (error) {
        console.error("Error saving cart:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

/******************************************************************************************/

const getAllProductsFromCart = async (req, res) => {
  const userId = req.headers.id;
  try {
    const cart = await Cart.find({ userId, status: 1 });
    return res.json({ status: true, cart });
  } catch (err) {
    return res.json({ status: false, error: err });
  }
};

const getCartLength = async (req, res) => {
  const userId = req.headers.id;
  try {
    const cart = await Cart.findOne({ userId, status: 1 });
    return res.status(200).json({
      status: true,
      quantity: cart ? Object.keys(cart.cartItems[0]).length : 0,
    });
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

const deleteProductFromCart = async (req, res) => {
  const id = req.headers.id;
  const quantity = req.body.quantity;
  const prodId = req.body.product;
  try {
    const cart = await Cart.findOne({ userId: id, status: 1 });
    const cartItems = cart.cartItems[0];
    delete cartItems[prodId];
    let calculatedGrands = calculateGrands(cartItems);
    let updated = await Cart.updateOne(
      { userId: id, status: 1 },
      {
        cartItems: cartItems,
        subTotal: calculatedGrands.subTotal,
        discount: cart.discount,
        grandTotal: calculatedGrands.grandTotal,
      }
    );

    const productQuantity = await Product.findOne({ _id: prodId });

    await Product.updateOne(
      { _id: prodId },
      { quantity: productQuantity.quantity + quantity }
    );

    const updatedCart = await Cart.findOne({ userId: id, status: 1 });

    return res.status(200).json({
      status: true,
      cartUpdated: updatedCart,
      message: "Product deleted from cart!",
    });
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

const deleteCart = async (req, res) => {
  const cartId = req.params.cartId;
  try {
    await Cart.deleteOne({ _id: cartId });
    const dltCartItems = await Cart.deleteMany({ cartId });
    return res.json({ status: true, deleted: dltCartItems });
  } catch (err) {
    return res.json({ status: true, error: err });
  }
};

const checkout = async (req, res) => {
  userId = req.headers.id;
  try {
    const checkedout = await Cart.updateOne(
      { userId, status: 1 },
      { status: 2 }
    );
    return res
      .status(200)
      .json({ status: true, checkedout, message: "Order complete!" });
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

const getOrderedCart = async (req, res) => {
  const userId = req.headers.id;
  try {
    const ordered = await Cart.findOne({ userId, status: 2 });
    return res.status(200).json({
      status: true,
      ordered: { items: ordered.cartItems[0], amount: ordered.grandTotal },
    });
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

const getTotals = async (req, res) => {
  const userId = req.headers.id;
  try {
    const cart = await Cart.findOne({ userId, status: 1 });
    const calculation = {
      subTotal: cart.subTotal,
      discount: cart.discount,
      grandTotal: cart.grandTotal,
    };
    return res.status(200).json({ status: true, calculation });
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

module.exports = {
  createCart,
  getAllProductsFromCart,
  getCartLength,
  deleteProductFromCart,
  deleteCart,
  checkout,
  getOrderedCart,
  getTotals,
};
