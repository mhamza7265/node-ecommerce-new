const Category = require("../models/categoryModel");
const fs = require("fs");

const addCategory = async (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const image = req.files[0].path.replaceAll("\\", "/").replace("files/", "");
  try {
    const created = await Category.create({
      isActive: true,
      products: [],
      name,
      description,
      image,
      created: Date(),
      slug: req.body.name.toLowerCase(),
    });
    return res.json({ status: true, data: created });
  } catch (err) {
    return res.json({ status: false, Error: err });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const resp = await Category.find();
    return res.json({ status: true, categories: resp });
  } catch (err) {
    await res.json({ status: false, Error: err });
  }
};

const updateCategory = async (req, res) => {
  const id = req.params.id;
  const image = req.files[0]?.path.replaceAll("\\", "/").replace("files/", "");
  const { name, description } = req.body;
  const bodyData = {};
  if (name) {
    bodyData["name"] = name;
  }
  if (description) {
    bodyData["descrition"] = description;
  }
  if (req.files.length > 0) {
    bodyData["image"] = image;
  }
  try {
    const product = await Category.findOne({ _id: id });
    const updated = await Category.updateOne({ _id: id }, bodyData);
    if (updated.acknowledged && req.files.length > 0) {
      fs.unlink("files/" + product.image, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("file is deleted");
        }
      });
    }
    return res.json({ status: true, updated });
  } catch (err) {
    return res.json({ status: false, error: "Internal server error" });
  }
};

const getSingleCategory = async (req, res) => {
  const id = req.params.id;
  try {
    const curProduct = await Category.findOne({ _id: id });
    return res.json({ status: true, curProduct });
  } catch (err) {
    return res.json({ status: false, Error: err });
  }
};

const deleteCategory = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Category.findOne({ _id: id });
    fs.unlink("files/" + product.image, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("file is deleted");
      }
    });
    const deleted = await Category.deleteOne({ _id: id });
    return res.json({ status: true, data: deleted });
  } catch (err) {
    return res.json({ status: false, Error: err });
  }
};

const getCategoriesByPage = async (req, res) => {
  const currentPage = req.query.page;
  let page = 1;
  const limit = 5;
  if (currentPage) page = currentPage;
  try {
    const categories = await Category.paginate({}, { page, limit });
    return res.status(200).json({ status: true, categories });
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  updateCategory,
  getSingleCategory,
  deleteCategory,
  getCategoriesByPage,
};
