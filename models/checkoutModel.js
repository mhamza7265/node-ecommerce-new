const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  orderDate: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  paymentType: {
    type: String,
    required: true,
  },
  cartId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: false,
  },
  cartItems: {
    type: Array,
    prodId: {
      sku: {
        type: Number,
        required: true,
      },
      cartId: {
        type: String,
        required: false,
      },
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      images: {
        type: Array,
        require: false,
      },
      category: {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      discount: {
        discountType: {
          type: String,
          required: false,
        },
        discountValue: {
          type: Number,
          required: false,
        },
      },
      calculations: {
        total: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          required: true,
        },
        subTotal: {
          type: Number,
          required: true,
        },
      },
    },
  },
  subTotal: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  grandTotal: {
    type: Number,
    required: true,
  },
  userDetails: {
    type: Object,
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
});

const Checkout = mongoose.model("Checkout", checkoutSchema);

module.exports = Checkout;
