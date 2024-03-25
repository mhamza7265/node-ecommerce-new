const Checkout = require("../models/checkoutModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const { checkoutConfig } = require("../config/utility");
const sendEmail = require("../config/sendEmail");
const stripe = require("stripe")(
  "sk_test_51OgnngCZAiYypOnUqPVjqJabWfyBwjL5aA75jBrk0eJ13S9LQ6yL96Qbm4WEEEqb0XAEcHvBM6jhVO0s0lgoB4IF007yzT5pd4"
);

const createCheckout = async (req, res) => {
  const userId = req.headers.id;
  let admins = [];

  Object.values(req.body.cartItems).forEach((item) => {
    const items = Object.values(item);
    items.forEach((item) => {
      const prodId = item.createdBy;
      admins.push(prodId);
    });
  });

  const data = {
    userId,
    userEmail: req.headers.email,
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
    await sendEmail(admins, req.headers.email, "order");
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

const getAllOrdersByPage = async (req, res) => {
  const userId = req.headers.id;
  const role = req.headers.role;
  const currentPage = req.query.page;
  const search = req.query.search;
  const orderId = req.query.orderId;
  let page = 1;
  const limit = 5;
  if (currentPage) page = currentPage;
  try {
    if (role == "admin" || role == "superAdmin") {
      if (search) {
        try {
          const orders = await Checkout.paginate({ orderId }, { page, limit });
          return res.status(200).json({ status: true, orders });
        } catch (err) {
          return res
            .status(340)
            .json({ status: false, error: "No order found" });
        }
      } else {
        const orders = await Checkout.paginate({}, { page, limit });
        return res.status(200).json({ status: true, orders });
      }
    } else {
      const orders = await Checkout.paginate({ userId }, { page, limit });
      return res.status(200).json({ status: true, orders });
    }
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

const getCustomerOrdersByPage = async (req, res) => {
  const userId = req.params.id;
  const currentPage = req.query.page;
  let page = 1;
  const limit = 5;
  if (currentPage) page = currentPage;
  try {
    const orders = await Checkout.paginate({ userId }, { page, limit });
    return res.status(200).json({ status: true, orders });
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

const processOrder = async (req, res) => {
  const orderId = req.body.orderId;
  const orderStatus = req.body.orderStatus;
  try {
    const orderDetails = await Checkout.findOne({ _id: orderId });
    const user = await User.findOne({ email: orderDetails.userEmail });
    await sendEmail(
      orderDetails.userEmail,
      orderStatus,
      "statusChange",
      user.firstName
    );
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

const dashboardData = async (req, res) => {
  const specificOrderDate = new Date();
  const year = specificOrderDate.getFullYear();
  const month = specificOrderDate.getMonth();
  const day = specificOrderDate.getDate();
  const startOfDay = new Date(year, month, day, 0, 0, 0).toISOString();
  const endOfDay = new Date(year, month, day, 23, 59, 59).toISOString();
  const startYear = new Date(year, 0, 1, 0, 0, 0).toISOString();
  const endYear = new Date(year, 11, 31, 23, 59, 59).toISOString();
  try {
    const salesToday = await Checkout.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalGrandTotal: { $sum: "$grandTotal" },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const salesTotal = await Checkout.aggregate([
      {
        $group: {
          _id: null,
          totalGrandTotal: { $sum: "$grandTotal" },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const salesTodayPrcentage =
      salesToday.length > 0
        ? (salesToday[0].totalGrandTotal / salesTotal[0].totalGrandTotal) * 100
        : 0;

    const ordersTodayPercentage =
      salesToday.length > 0
        ? (salesToday[0].totalCount / salesTotal[0].totalCount) * 100
        : 0;

    const products = (await Product.find()).length;
    const users = (await User.find({ role: "basic" })).length;

    const salesByMonths = await Checkout.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startYear,
            $lte: endYear,
          },
        },
      },
      {
        $addFields: {
          orderDateConverted: { $dateFromString: { dateString: "$orderDate" } }, // Convert string to Date object
        },
      },
      {
        $group: {
          _id: {
            $month: "$orderDateConverted",
          },
          year: { $first: { $year: "$orderDateConverted" } },
          totalGrandTotal: { $sum: "$grandTotal" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0, // Exclude the _id field
          month: "$_id", // Rename _id to month
          year: 1,
          totalGrandTotal: 1,
        },
      },
    ]);

    const profit = await Checkout.aggregate([
      {
        $project: {
          cartItems: { $slice: ["$cartItems", 1] },
        },
      },
      { $unwind: "$cartItems" },
      {
        $project: {
          cost: {
            $map: {
              input: { $objectToArray: "$cartItems" },
              as: "item",
              in: "$$item.v.cost",
            },
          },
          quantity: {
            $map: {
              input: { $objectToArray: "$cartItems" },
              as: "item",
              in: "$$item.v.quantity",
            },
          },
          total: {
            $map: {
              input: { $objectToArray: "$cartItems" },
              as: "item",
              in: "$$item.v.calculations.subTotal",
            },
          },
        },
      },

      {
        $project: {
          data: {
            $map: {
              input: { $range: [0, { $size: "$cost" }] },
              as: "index",
              in: {
                cost: { $arrayElemAt: ["$cost", "$$index"] },
                quantity: { $arrayElemAt: ["$quantity", "$$index"] },
                total: { $arrayElemAt: ["$total", "$$index"] },
              },
            },
          },
        },
      },
      { $unwind: "$data" },
      { $replaceRoot: { newRoot: "$data" } },

      {
        $project: {
          totalCost: { $multiply: ["$cost", "$quantity"] },
          totalVal: "$total",
        },
      },

      {
        $project: {
          prof: { $subtract: ["$totalVal", "$totalCost"] },
        },
      },

      {
        $group: {
          _id: null,
          profit: { $sum: "$prof" },
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      data: {
        sales: {
          salesToday: salesToday.length > 0 ? salesToday[0].totalGrandTotal : 0,
          salesTotal: salesTotal[0].totalGrandTotal,
          salesPercentage: salesTodayPrcentage.toFixed(),
        },
        orders: {
          ordersToday: salesToday.length > 0 ? salesToday[0].totalCount : 0,
          ordersTotal: salesTotal[0].totalCount,
          ordersPercentage: ordersTodayPercentage.toFixed(),
        },
        totalProducts: products,
        totalUsers: users,
        salesByMonths,
        profit: profit[0].profit,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
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
  getAllOrdersByPage,
  processOrder,
  getCustomerOrdersByPage,
  dashboardData,
};
