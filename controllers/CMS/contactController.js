const ContactOne = require("../../models/CMS/contactSectionOneModel");
const ContactTwo = require("../../models/CMS/contactSectionTwoModel");

const addSectionOne = async (req, res) => {
  const sectionName = req.params.section;
  try {
    let created;
    switch (sectionName) {
      case "one": {
        created = await ContactOne.create(req.body);
        break;
      }
      case "two": {
        created = await ContactTwo.create(req.body);
        break;
      }
    }

    return res.status(200).json({ status: true, created });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const getSectionData = async (req, res) => {
  const sectionName = req.params.section;
  const aggr1 = {
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
        section = await ContactOne.aggregate([aggr1]);
        break;
      }
      case "two": {
        section = await ContactTwo.find();
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

const editSectionData = async (req, res) => {
  const sectionName = req.params.section;

  let obj = {};

  if (req.body.text1) {
    obj["text1"] = req.body.text1;
  }
  if (req.body.text2) {
    obj["text2"] = req.body.text2;
  }
  if (req.body.textAlign) {
    obj["textAlign"] = req.body.textAlign;
  }
  if (req.body.address) {
    obj["address"] = req.body.address;
  }
  if (req.body.email) {
    obj["email"] = req.body.email;
  }
  if (req.body.contact) {
    obj["contact"] = req.body.contact;
  }
  if (req.body.location) {
    obj["location"] = req.body.location;
  }

  try {
    let updated;
    switch (sectionName) {
      case "one": {
        updated = await ContactOne.updateOne({ _id: req.body.id }, obj);
        break;
      }
      case "two": {
        updated = await ContactTwo.updateOne({ _id: req.body.id }, obj);
        break;
      }
    }
    return res.status(200).json({ status: true, section: "Updated" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const deleteSectionData = async (req, res) => {
  const sectionName = req.params.section;
  try {
    let deleted;
    switch (sectionName) {
      case "one": {
        deleted = await ContactOne.deleteOne({ _id: req.body.id });
        break;
      }
      case "two": {
        deleted = await ContactTwo.deleteOne({ _id: req.body.id });
        break;
      }
    }
    return res.status(200).json({ status: true, section: "Deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

module.exports = {
  addSectionOne,
  getSectionData,
  editSectionData,
  deleteSectionData,
};
