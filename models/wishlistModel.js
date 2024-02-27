const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  product: {
    type: Array,
    sku: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      applicable: {
        type: Boolean,
        required: true,
      },
      discountType: {
        type: String,
        required: false,
      },
      discountValue: {
        type: Number,
        required: false,
      },
    },
    taxable: {
      type: Boolean,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
  },
});

wishlistSchema.plugin(mongoosePaginate);
const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;
