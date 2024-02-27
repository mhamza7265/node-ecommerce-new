const Checkout = require("../models/checkoutModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const { checkoutConfig } = require("../config/utility");
const stripe = require("stripe")(
  "sk_test_51OgnngCZAiYypOnUqPVjqJabWfyBwjL5aA75jBrk0eJ13S9LQ6yL96Qbm4WEEEqb0XAEcHvBM6jhVO0s0lgoB4IF007yzT5pd4"
);

const createCheckout = async (req, res) => {
  const userId = req.headers.id;

  const data = {
    userId,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    cartId: req.body.cartId,
    cartItems: req.body.cartItems,
    subTotal: req.body.subTotal,
    discount: req.body.discount,
    grandTotal: req.body.grandTotal,
    paymentType: req.body.paymentType,
  };
  const response = checkoutConfig(data);
  try {
    const userAddress = await Address.findOne({ userId });
    if (userAddress) {
      await Address.updateOne(
        { userId },
        {
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
        }
      );
    } else {
      await Address.create({
        userId,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
      });
    }
    const orderComplete = await Checkout.create(response);
    await Cart.updateOne({ _id: req.body.cartId }, { status: 2 });
    return res.status(200).json({
      status: true,
      orderComplete,
      message: "Order placed successfully!",
    });
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

const orderDetails = async (req, res) => {
  const userId = req.headers.id;
  const role = req.headers.role;
  try {
    if (role == "admin") {
      const orders = await Checkout.find();
      return res.status(200).json({ status: true, orders });
    } else {
      const orders = await Checkout.find({ userId });
      return res.status(200).json({ status: true, orders });
    }
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

const singleOrderDetails = async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const orderDetail = await Checkout.findOne({ _id: orderId });
    return res.status(200).json({ status: true, orderDetail });
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

const orderStatus = async (req, res) => {
  orderId = req.params.orderId;
  try {
    const order = await Checkout.findOne({ _id: orderId });
    return res.status(200).json({ status: true, orderStatus: order.status });
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

const createPayment = async (req, res) => {
  const userId = req.headers.id;
  const cart = await Cart.findOne({ userId, status: 1 });
  const lineItems = Object.values(cart.cartItems[0]).map((item) => ({
    price_data: {
      currency: "pkr",
      product_data: {
        name: item.name,
      },
      unit_amount: item.price * 100,
    },
    quantity: item.quantity,
  }));
  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    success_url: `http://localhost:5173/success`,
    cancel_url: `http://localhost:5173/failed`,
  });

  return res.json({ status: true, id: session.id });
};

const paymentIntent = async (req, res) => {
  const userId = req.headers.id;
  const cart = await Cart.findOne({ userId, status: 1 });
  try {
    const intent = await stripe.paymentIntents.create({
      confirm: true,
      amount: cart.grandTotal * 100,
      currency: "pkr",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: { enabled: true },
      payment_method: req.body.paymentMethodId, // the PaymentMethod ID sent by your client
      return_url: "https://example.com/order/123/complete",
      use_stripe_sdk: true,
      mandate_data: {
        customer_acceptance: {
          type: "online",
          online: {
            ip_address: req.ip,
            user_agent: 'req.get("user-agent")',
          },
        },
      },
    });
    res.status(200).json({
      client_secret: intent.client_secret,
      status: intent.status,
    });
  } catch (err) {
    res.json({
      error: err,
    });
  }
};

const getAllOrders = async (req, res) => {
  const userId = req.params.id;
  try {
    const orders = await Checkout.find({ userId });
    return res.status(200).json({ status: true, orders });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Error in finding orders" });
  }
};

const processOrder = async (req, res) => {
  const orderId = req.body.orderId;
  const orderStatus = req.body.orderStatus;
  try {
    const updated = await Checkout.updateOne(
      { _id: orderId },
      { status: orderStatus }
    );
    if (updated.acknowledged) {
      const updatedOrder = await Checkout.findOne({ _id: orderId });

      return res
        .status(200)
        .json({ status: true, updated: true, updatedOrder });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Error in updating order" });
  }
};

module.exports = {
  createCheckout,
  orderDetails,
  singleOrderDetails,
  orderStatus,
  createPayment,
  paymentIntent,
  getAllOrders,
  processOrder,
};
