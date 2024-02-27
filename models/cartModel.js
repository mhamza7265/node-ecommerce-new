const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
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
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
