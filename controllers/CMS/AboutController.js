const SectionOne = require("../../models/CMS/AboutSectionOne");
const SectionFour = require("../../models/CMS/aboutSectionFour");
const SectionThree = require("../../models/CMS/aboutSectionThree");
const SectionTwo = require("../../models/CMS/aboutSectionTwo");
const fs = require("fs");

const getSection = async (req, res) => {
  const sectionName = req.params.section;
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
      text2Sub: { $substr: ["$text2", 0, 21] },
      text3Sub: { $substr: ["$text3", 0, 21] },
      text1: 1,
      text2: 1,
      text3: 1,
      image: 1,
      textAlign: 1,
    },
  };

  const aggr3 = {
    $project: {
      text1Sub: { $substr: ["$text1", 0, 21] },
      text2Sub: { $substr: ["$text2", 0, 21] },
      text1: 1,
      text2: 1,
      textAlign: 1,
    },
  };
  try {
    let section;
    switch (sectionName) {
      case "one": {
        section = await SectionOne.find();
        break;
      }
      case "two": {
        section = await SectionTwo.aggregate([aggr1]);
        break;
      }
      case "three": {
        section = await SectionThree.aggregate([aggr2]);
        break;
      }
      case "four": {
        section = await SectionFour.aggregate([aggr3]);
        break;
      }
    }
    return res.status(200).json({ status: true, section });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const deleteSection = async (req, res) => {
  const sectionName = req.params.section;
  try {
    let deleted;
    let document;
    switch (sectionName) {
      case "two": {
        document = await SectionTwo.findOne({ _id: req.body.id });
        deleted = await SectionTwo.deleteOne({ _id: req.body.id });
        break;
      }
      case "four": {
        deleted = await SectionFour.deleteOne({ _id: req.body.id });
        break;
      }
    }

    if (sectionName == "two" && deleted.acknowledged) {
      fs.unlink("files/" + document.image, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("file is deleted");
        }
      });
    }

    return res.status(200).json({ status: true, section: "Deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const editSection = async (req, res) => {
  const sectionName = req.params.section;
  const image = req.files
    ? req.files[0]?.path.replaceAll("\\", "/").replace("files/", "")
    : undefined;

  let obj = {};
  if (req.files && req.files.length > 0) {
    obj["image"] = image;
  }
  if (req.body.text1) {
    obj["text1"] = req.body.text1;
  }
  if (req.body.text2) {
    obj["text2"] = req.body.text2;
  }
  if (req.body.textAlign) {
    obj["textAlign"] = req.body.textAlign;
  }
  try {
    let document;
    let updated;
    switch (sectionName) {
      case "two": {
        document = await SectionTwo.findOne({ _id: req.body.id });
        updated = await SectionTwo.updateOne({ _id: req.body.id }, obj);
        break;
      }
      case "four": {
        updated = await SectionFour.updateOne({ _id: req.body.id }, obj);
      }
    }

    if (
      sectionName == "two" &&
      updated.acknowledged &&
      req.files &&
      req.files.length > 0
    ) {
      fs.unlink("files/" + document.image, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("file is deleted");
        }
      });
    }
    return res.status(200).json({ status: true, section: "updated" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

/****************************************************************************************/

const addEditSectionOne = async (req, res) => {
  const singleImage = req.files
    ? req.files.filter((file) => file.fieldname == "image")
    : undefined;
  const carImages = req.files
    ? req.files.filter((file) => file.fieldname == "carouselImages")
    : undefined;
  const image = singleImage
    ? singleImage[0]?.path.replaceAll("\\", "/").replace("files/", "")
    : undefined;
  const carouselImages = carImages
    ? carImages.map((file) => {
        return file?.path.replaceAll("\\", "/").replace("files/", "");
      })
    : undefined;

  console.log("body", req.body.title);

  let obj = {};
  if (req.body.description) {
    obj["description"] = req.body.description;
  }
  if (req.body.title) {
    obj["title"] = req.body.title;
  }
  if (image && image.length > 0) {
    obj["image"] = image;
  }
  if (carouselImages && carouselImages.length > 0) {
    obj["carouselImages"] = carouselImages;
  }
  try {
    const doc = await SectionOne.find();
    if (doc.length > 0) {
      const updated = await SectionOne.updateOne({}, obj);
      if (updated.acknowledged && image && image.length > 0) {
        fs.unlink("files/" + doc[0].image, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("file is deleted");
          }
        });
      }
      if (updated.acknowledged && carouselImages && carouselImages.length > 0) {
        doc[0].carouselImages.forEach((image) => {
          fs.unlink("files/" + image, (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("file is deleted");
            }
          });
        });
      }
      return res.status(200).json({ status: true, sectionOne: "Updated" });
    } else {
      const created = await SectionOne.create(obj);
      return res.status(200).json({ status: true, sectionOne: "Created" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const addSectionTwo = async (req, res) => {
  const sectionName = req.params.section;
  const image = req.files
    ? req.files[0]?.path.replaceAll("\\", "/").replace("files/", "")
    : undefined;
  const obj = { ...req.body, image };
  try {
    let created;
    switch (sectionName) {
      case "two": {
        created = await SectionTwo.create(obj);
        break;
      }
      case "four": {
        created = await SectionFour.create(obj);
        break;
      }
    }

    return res.status(200).json({ status: true, section: created });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const addEditSectionThree = async (req, res) => {
  const image = req.files
    ? req.files[0]?.path.replaceAll("\\", "/").replace("files/", "")
    : undefined;

  console.log("body", req.body.title);

  let obj = {};
  if (req.body.text2) {
    obj["text2"] = req.body.text2;
  }
  if (req.body.text1) {
    obj["text1"] = req.body.text1;
  }
  if (req.body.text3) {
    obj["text3"] = req.body.text3;
  }
  if (req.body.textAlign) {
    obj["textAlign"] = req.body.textAlign;
  }
  if (req.files && req.files.length > 0) {
    obj["image"] = image;
  }
  try {
    const doc = await SectionThree.find();
    if (doc.length > 0) {
      const updated = await SectionThree.updateOne({}, obj);

      if (updated.acknowledged && req.files && req.files.length > 0) {
        fs.unlink("files/" + doc[0].image, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("file is deleted");
          }
        });
      }

      return res.status(200).json({ status: true, section: "Updated" });
    } else {
      const created = await SectionThree.create(obj);
      return res.status(200).json({ status: true, section: "Created" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

module.exports = {
  addEditSectionOne,
  getSection,
  deleteSection,
  editSection,
  addSectionTwo,
  addEditSectionThree,
};
