const SectionOne = require("../../models/CMS/AboutSectionOne");

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

const getSectionOne = async (req, res) => {
  try {
    const sectionOne = await SectionOne.find();
    return res.status(200).json({ status: true, sectionOne });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

module.exports = { addEditSectionOne, getSectionOne };
