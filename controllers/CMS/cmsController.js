const Slider = require("../../models/CMS/sliderModel");
const fs = require("fs");
const Bestselling = require("../../models/CMS/bestsellingModel");
const Banner = require("../../models/CMS/bannerModel");
const Setting = require("../../models/CMS/siteSettingsModel");

const addHomePage = async (req, res) => {
  const param = req.params.type;
  const image = req.files[0]?.path.replaceAll("\\", "/").replace("files/", "");
  let obj = {};
  if (param == "sliders") {
    obj = {
      text1: req.body.text1,
      text2: req.body.text2,
      textAlign: req.body.textAlign,
      image: image,
    };
  } else {
    obj = {
      text1: req.body.text1,
      textAlign: req.body.textAlign,
      image: image,
    };
  }
  try {
    let cms;
    switch (param) {
      case "sliders": {
        cms = await Slider.create(obj);
        break;
      }
      case "banners": {
        cms = await Banner.create(obj);
        break;
      }
      case "bestSelling": {
        cms = await Bestselling.create(obj);
        break;
      }
    }
    return res.status(200).json({ status: true, cms });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const getHomePage = async (req, res) => {
  const param = req.params.type;
  const aggr1 = {
    $project: {
      text1Sub: { $substr: ["$text1", 0, 21] },
      text2Sub: { $substr: ["$text2", 0, 21] },
      text1: 1,
      text2: 1,
      image: 1,
      textAlign: 1,
    },
  };

  const aggr2 = {
    $project: {
      text1Sub: { $substr: ["$text1", 0, 21] },
      text1: 1,
      image: 1,
      textAlign: 1,
    },
  };

  try {
    let homePage;
    switch (param) {
      case "sliders": {
        homePage = await Slider.aggregate([aggr1]);
        break;
      }
      case "banners": {
        homePage = await Banner.aggregate([aggr2]);
        break;
      }
      case "bestSelling": {
        homePage = await Bestselling.aggregate([aggr2]);
        break;
      }
    }

    return res.status(200).json({ status: true, homePage });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const editHomePage = async (req, res) => {
  const param = req.params.type;
  const image = req.files
    ? req.files[0]?.path.replaceAll("\\", "/").replace("files/", "")
    : undefined;

  let update = {};
  if (req.body.text1) {
    update["text1"] = req.body.text1;
  }
  if (req.body.text2) {
    update["text2"] = req.body.text2;
  }
  if (req.body.textAlign) {
    update["textAlign"] = req.body.textAlign;
  }
  if (req.files && req.files.length > 0) {
    update["image"] = image;
  }

  try {
    let document;
    let updated;
    switch (param) {
      case "sliders": {
        document = await Slider.findOne({ _id: req.body.id });
        updated = await Slider.updateOne({ _id: req.body.id }, update);
        break;
      }
      case "banners": {
        document = await Banner.findOne({ _id: req.body.id });
        updated = await Banner.updateOne({ _id: req.body.id }, update);
        break;
      }
      case "bestSelling": {
        document = await Bestselling.findOne({ _id: req.body.id });
        updated = await Bestselling.updateOne({ _id: req.body.id }, update);
        break;
      }
    }

    if (req.files && req.files.length > 0 && updated.acknowledged) {
      fs.unlink("files/" + document.image, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("file is deleted");
        }
      });
    }

    return res
      .status(200)
      .json({ status: true, updated: `${param.replace(/.$/, "")} updated` });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const deleteHomePage = async (req, res) => {
  const param = req.params.type;
  try {
    let document;
    let deleted;
    switch (param) {
      case "sliders": {
        document = await Slider.findOne({ _id: req.body.id });
        deleted = await Slider.deleteOne({ _id: req.body.id });
        break;
      }
      case "banners": {
        document = await Banner.findOne({ _id: req.body.id });
        deleted = await Banner.deleteOne({ _id: req.body.id });
        break;
      }
      case "bestSelling": {
        document = await Bestselling.findOne({ _id: req.body.id });
        deleted = await Bestselling.deleteOne({ _id: req.body.id });
        break;
      }
    }

    if (deleted.acknowledged) {
      fs.unlink("files/" + document.image, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("file is deleted");
        }
      });
    }
    return res
      .status(200)
      .json({ status: true, deleted: `${param.replace(/.$/, "")} deleted` });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const createEditSettings = async (req, res) => {
  const title = req.body.title;
  // console.log("title", title);
  const image = req.files
    ? req.files[0]?.path.replaceAll("\\", "/").replace("files/", "")
    : undefined;

  let obj = {};
  if (req.files && req.files.length > 0) {
    obj["image"] = image;
  }
  if (title && title !== undefined && title !== "") {
    console.log("true", title);
    obj["title"] = req.body.title;
  }

  try {
    const doc = await Setting.find();
    if (doc.length > 0) {
      const updated = await Setting.updateOne({}, obj);

      if (req.files && req.files.length > 0 && updated.acknowledged) {
        fs.unlink("files/" + doc[0].image, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("file is deleted");
          }
        });
      }
      return res.status(200).json({ status: true, setting: "Updated" });
    } else {
      const create = await Setting.create(obj);
      return res.status(200).json({ status: true, setting: "Created" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const getSettings = async (req, res) => {
  try {
    const document = await Setting.find();
    return res.status(200).json({ status: true, setting: document[0] });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

module.exports = {
  addHomePage,
  getHomePage,
  editHomePage,
  deleteHomePage,
  createEditSettings,
  getSettings,
};
