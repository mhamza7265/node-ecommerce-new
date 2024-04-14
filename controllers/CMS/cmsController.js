const Slider = require("../../models/CMS/sliderModel");
const fs = require("fs");
const Bestselling = require("../../models/CMS/bestsellingModel");
const Banner = require("../../models/CMS/bannerModel");

const addSlider = async (req, res) => {
  const image = req.files[0]?.path.replaceAll("\\", "/").replace("files/", "");
  const slider = {
    text1: req.body.text1,
    text2: req.body.text2,
    textAlign: req.body.textAlign,
    image: image,
  };
  try {
    const cms = await Slider.create(slider);
    return res.status(200).json({ status: true, cms });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const getSliders = async (req, res) => {
  try {
    const sliders = await Slider.aggregate([
      {
        $project: {
          text1Sub: { $substr: ["$text1", 0, 21] },
          text2Sub: { $substr: ["$text2", 0, 21] },
          text1: 1,
          text2: 1,
          image: 1,
          textAlign: 1,
        },
      },
    ]);
    return res.status(200).json({ status: true, sliders });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const editSlider = async (req, res) => {
  const image = req.files[0]?.path.replaceAll("\\", "/").replace("files/", "");
  update = {};
  if (req.body.text1) {
    update["text1"] = req.body.text1;
  }
  if (req.body.text2) {
    update["text2"] = req.body.text2;
  }
  if (req.body.textAlign) {
    update["textAlign"] = req.body.textAlign;
  }
  if (req.files.length > 0) {
    update["image"] = image;
  }

  try {
    const updated = await Slider.updateOne({ _id: req.body.id }, update);
    return res.status(200).json({ status: true, updated: "Slider updated" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findOne({ _id: req.body.id });
    const deleted = await Slider.deleteOne({ _id: req.body.id });
    if (deleted.acknowledged) {
      fs.unlink("files/" + slider.image, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("file is deleted");
        }
      });
    }
    return res.status(200).json({ status: true, deleted: "Slider deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

//Banner
const addBanner = async (req, res) => {
  const image = req.files[0]?.path.replaceAll("\\", "/").replace("files/", "");
  const banner = {
    text1: req.body.text1,
    textAlign: req.body.textAlign,
    image: image,
  };
  try {
    const cms = await Banner.create(banner);
    return res.status(200).json({ status: true, cms });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const getBanners = async (req, res) => {
  try {
    const banners = await Banner.aggregate([
      {
        $project: {
          text1Sub: { $substr: ["$text1", 0, 21] },
          text1: 1,
          image: 1,
          textAlign: 1,
        },
      },
    ]);
    return res.status(200).json({ status: true, banners });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const editBanner = async (req, res) => {
  const image = req.files[0]?.path.replaceAll("\\", "/").replace("files/", "");
  update = {};
  if (req.body.text1) {
    update["text1"] = req.body.text1;
  }
  if (req.body.text2) {
    update["text2"] = req.body.text2;
  }
  if (req.body.textAlign) {
    update["textAlign"] = req.body.textAlign;
  }
  if (req.files.length > 0) {
    update["image"] = image;
  }

  try {
    const updated = await Banner.updateOne({ _id: req.body.id }, update);
    return res.status(200).json({ status: true, updated: "Banner updated" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne({ _id: req.body.id });
    const deleted = await Banner.deleteOne({ _id: req.body.id });
    if (deleted.acknowledged) {
      fs.unlink("files/" + banner.image, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("file is deleted");
        }
      });
    }
    return res.status(200).json({ status: true, deleted: "Banner deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

//Best Selling
const addBestselling = async (req, res) => {
  const image = req.files[0]?.path.replaceAll("\\", "/").replace("files/", "");
  const bestselling = {
    text1: req.body.text1,
    textAlign: req.body.textAlign,
    image: image,
  };
  try {
    const cms = await Bestselling.create(bestselling);
    return res.status(200).json({ status: true, cms });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const getBestselling = async (req, res) => {
  try {
    const bestselling = await Bestselling.aggregate([
      {
        $project: {
          text1Sub: { $substr: ["$text1", 0, 21] },
          text1: 1,
          image: 1,
          textAlign: 1,
        },
      },
    ]);
    return res.status(200).json({ status: true, bestselling });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const editBestsellng = async (req, res) => {
  const image = req.files[0]?.path.replaceAll("\\", "/").replace("files/", "");
  update = {};
  if (req.body.text1) {
    update["text1"] = req.body.text1;
  }
  if (req.body.text2) {
    update["text2"] = req.body.text2;
  }
  if (req.body.textAlign) {
    update["textAlign"] = req.body.textAlign;
  }
  if (req.files.length > 0) {
    update["image"] = image;
  }

  try {
    const updated = await Bestselling.updateOne({ _id: req.body.id }, update);
    return res.status(200).json({ status: true, updated: "Slider updated" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const deleteBestselling = async (req, res) => {
  try {
    const bestselling = await Bestselling.findOne({ _id: req.body.id });
    const deleted = await Bestselling.deleteOne({ _id: req.body.id });
    if (deleted.acknowledged) {
      fs.unlink("files/" + bestselling.image, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("file is deleted");
        }
      });
    }
    return res.status(200).json({ status: true, deleted: "Slider deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

module.exports = {
  addSlider,
  getSliders,
  editSlider,
  deleteSlider,
  addBanner,
  getBanners,
  editBanner,
  deleteBanner,
  addBestselling,
  getBestselling,
  editBestsellng,
  deleteBestselling,
};
