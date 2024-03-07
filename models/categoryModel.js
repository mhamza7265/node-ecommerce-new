const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const categorySchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    required: true,
  },
  products: {
    type: Object,
    required: true,
  },
  name: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  created: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
});

categorySchema.plugin(mongoosePaginate);
const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
