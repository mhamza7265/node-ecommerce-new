const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Checkout = require("../models/checkoutModel");
const mongoose = require("mongoose");
var _ = require("lodash");

const addProduct = async (req, res) => {
  const category = req.body.category;
  const sku = req.body.sku;
  const name = req.body.name;
  const discount = req.body.discount;
  const imagesPaths = req.files.map((item) => {
    return item.path.replaceAll("\\", "/").replace("files/", "");
  });
  try {
    const skuExists = await Product.find({ sku: sku });
    const nameExists = await Product.find({ name });
    if (skuExists.length > 0 || nameExists.length > 0) {
      return res.json({ status: false, Error: "Product already exists!" });
    }

    const findCategory = await Category.find({ _id: category });

    const added = await Product.create({
      ...req.body,
      category: {
        name: findCategory[0].name.toLowerCase(),
        id: findCategory[0]._id,
      },
      discount: {
        discount,
      },
      images: imagesPaths,
    });
    return res.json({ status: true, data: added });
  } catch (err) {
    return res.json({ status: false, Error: err });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const resp = await Product.find();
    return res.json({ status: true, data: resp });
  } catch (err) {
    return res.json({ status: false, Error: err });
  }
};

const getSingleProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const resp = await Product.find({ _id: id });
    return res.json({ status: true, data: resp });
  } catch (err) {
    return res.json({ status: false, Error: err });
  }
};

const updateProduct = async (req, res) => {
  const id = req.params.id;
  const images = {
    images: req.files?.map((item) => {
      return item.path.replaceAll("\\", "/").replace("files/", "");
    }),
  };
  const imagePath = images.images.length > 0 ? images : { images: undefined };
  const bodyData = req.body;
  Object.assign(bodyData, imagePath);
  try {
    const edited = await Product.updateOne({ _id: id }, bodyData);
    return res.json({ status: true, edited });
  } catch (err) {
    return res.json({ status: false, err });
  }
};

const getProductsByCategory = async (req, res) => {
  const id = req.params.id;
  try {
    const products = await Product.find({
      "category.id": id,
    });
    return res.json({ status: true, data: products });
  } catch (err) {
    return res.json({ status: false, Error: err });
  }
};

const getBestSellingProducts = async (req, res) => {
  try {
    const productIds = await Checkout.aggregate([
      // Project the cartItems.0 array
      { $project: { cartItems: { $slice: ["$cartItems", 1] } } },
      // Unwind the cartItems.0 array
      { $unwind: "$cartItems" },
      // Map over each object in the cartItems.0 array to retrieve the productId
      {
        $project: {
          productId: {
            $map: {
              input: { $objectToArray: "$cartItems" },
              as: "item",
              in: "$$item.v.productId",
            },
          },
        },
      },
      // Unwind the productId array
      { $unwind: "$productId" },
      // Group by productId and count occurrences
      { $group: { _id: "$productId", count: { $sum: 1 } } },
      // Filter documents where count is greater than 0
      { $match: { count: { $gt: 0 } } },
      // Sort by count in descending order
      { $sort: { count: -1 } },
      // Limit to top 10 results
      { $limit: 10 },
      // Project to include productId and count, and exclude _id
      { $project: { productId: "$_id", count: 1, _id: 0 } },
    ]);
    const Ids = productIds.map((item) => item.productId);
    const product = await Product.find({ _id: { $in: Ids } });
    const prodIds = _.keyBy(productIds, "productId");
    return res
      .status(200)
      .json({ status: true, products: { productIds: prodIds, product } });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const getProductsByPage = async (req, res) => {
  const currentPage = req.query.page;
  let page = 1;
  const limit = 10;
  if (currentPage) page = currentPage;
  try {
    const products = await Product.paginate({}, { page, limit });
    return res.status(200).json({ status: true, products });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const deleteSingleProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.deleteOne({ _id: id });
    return res.json({ status: true, product });
  } catch (err) {
    return res.json({ status: false, Error: err });
  }
};

const filterProducts = async (req, res) => {
  const product = req.body.products;
  try {
    // const filteredProducts = await Product.aggregate([
    //   { $match: { name: { $in: newProductString } } },
    // ]);
    const filtered = await Product.find({
      name: { $regex: product, $options: "i" },
    });
    const filteredNames = filtered.map((item) => item.name);
    if (product !== "") {
      if (req.body.autoComplete) {
        return res.status(200).json({ status: true, filteredNames });
      } else {
        return res.status(200).json({ status: true, filtered });
      }
    } else {
      return res
        .status(500)
        .json({ status: false, error: "No product Found!" });
    }
  } catch (err) {
    return res.status(500).json({ status: false, error: "No product found!" });
  }
};

const productAvailableQuantity = async (req, res) => {
  const prodId = req.params.prodId;
  try {
    const product = await Product.findOne({ _id: prodId });
    return res
      .status(200)
      .json({ status: true, availableQuantity: product.quantity });
  } catch (err) {
    return res.status(500).json({
      status: false,
      error: "Request could not be processed, try again later",
    });
  }
};

const productQuantityMultiple = async (req, res) => {
  const productsId = req.body.productsId;
  ids = productsId?.split(",");
  try {
    const product = await Product.find(
      {
        _id: {
          $in: ids,
        },
      },
      { quantity: 1 }
    );
    const products = _.keyBy(product, "_id");
    return res.status(200).json({ status: true, products });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  getProductsByCategory,
  getBestSellingProducts,
  deleteSingleProduct,
  filterProducts,
  productAvailableQuantity,
  productQuantityMultiple,
  getProductsByPage,
};
