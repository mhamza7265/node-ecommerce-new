const Notification = require("../models/notificationModel");
const jwt = require("jsonwebtoken");

const saveNotification = async (req, res) => {
  try {
    const verify = jwt.verify(
      req.headers?.authorization?.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    if (verify) {
      const notification = await Notification.create({
        ...req.body,
        email: verify.email,
      });
      return res.status(200).json({ status: true, notification });
    } else {
      return res
        .status(500)
        .json({ status: false, error: "Authentication error, token required" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const getNotifications = async (req, res) => {
  try {
    const verify = jwt.verify(
      req.headers?.authorization?.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    const notifications = await Notification.find({ email: verify.email });
    return res.status(200).json({ status: true, notifications });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

module.exports = { saveNotification, getNotifications };
