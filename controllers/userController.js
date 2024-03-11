const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/userModel");

const registerUser = async (req, res) => {
  const {
    email,
    firstName,
    middleName,
    lastName,
    role,
    password,
    passwordCreated,
  } = req.body;

  const verify = jwt.verify(
    req.headers.authorization.replace("Bearer ", ""),
    process.env.JWT_SECRET
  );
  if (verify) {
    if (role == "admin" && verify.role !== "superAdmin") {
      return res.status(401).json({
        status: false,
        error: "Unauthorised, Super-Admin privilege required",
      });
    }
  } else {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const checkUser = await User.find({ email });
    if (!checkUser.length > 0) {
      const user = await User.create({
        email,
        firstName,
        middleName,
        lastName,
        password: hashedPassword,
        role,
        passwordCreated:
          passwordCreated !== null && passwordCreated !== undefined
            ? passwordCreated
            : true,
        blocked: false,
      });
      return res.json({
        status: true,
        message: "User successfully created!",
        user: {
          email: user.email,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } else {
      return res.json({ status: false, error: "User already exists!" });
    }
  } catch (err) {
    return res.json({ status: false, error: err });
  }
};

const loginUser = async (req, res) => {
  const { email, password, userRole } = req.body;

  try {
    const getUser = await User.findOne({ email });
    if (getUser.blocked) {
      return res.status(500).json({
        status: false,
        error: "Your account is locked, please contact admin/super-admin.",
      });
    }
    const token = jwt.sign(
      {
        id: getUser._id,
        email: getUser.email,
        firstName: getUser.firstName,
        middleName: getUser.middleName,
        lastName: getUser.lastName,
        role: getUser.role,
        passwordCreated: getUser.passwordCreated,
        blocked: getUser.blocked,
      },
      process.env.JWT_SECRET
    );
    if (getUser) {
      if (await bcrypt.compare(password, getUser.password)) {
        if (
          userRole &&
          userRole == "admin" &&
          (getUser.role == "admin" || getUser.role == "superAdmin")
        ) {
          return res.json({
            status: true,
            login: "Login Success",
            token: `Bearer ${token}`,
          });
        } else if (!userRole || userRole == null) {
          return res.json({
            status: true,
            login: "Login Success",
            token: `Bearer ${token}`,
          });
        } else {
          return res.json({
            status: false,
            error: "Not authorised!",
          });
        }
      } else {
        return res.json({ status: false, error: "Wrong Password!" });
      }
    } else {
      return res.json({ status: false, error: "No user found!" });
    }
  } catch (err) {
    return res.json({ status: false, error: "Wrong password or email" });
  }
};

const editUser = async (req, res) => {
  const currentPw = req.body.current_pw;
  const newPw = req.body.new_pw;
  const userId = req.headers.id;
  if (newPw !== "" && newPw !== undefined && newPw !== null) {
    if (currentPw == null || currentPw == undefined || currentPw == "") {
      return res
        .status(500)
        .json({ status: false, error: "Please enter current password!" });
    }
  }
  try {
    const userObj = {
      firstName: req.body.first_name,
      lastName: req.body.last_name,
    };
    const user = await User.findOne({ _id: userId });
    if (currentPw !== null && currentPw !== undefined && currentPw !== "") {
      const comparePw = await bcrypt.compare(currentPw, user.password);
      if (comparePw && newPw !== undefined) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPw, salt);
        userObj["password"] = hashedPassword;
      } else if (!comparePw) {
        return res.status(500).json({
          status: false,
          error: "Wrong password, try with correct password again!",
        });
      }
    }

    const updated = await User.updateOne({ _id: userId }, userObj);
    if (updated.acknowledged) {
      const user = await User.findOne({ _id: userId });
      return res.status(200).json({
        status: true,
        updated,
        message: "User record updated!",
        user: {
          id: user._id,
          first_name: user.firstName,
          middle_name: user.middleName,
          last_name: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      return res
        .status(500)
        .json({ status: false, error: "Internal server error" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  const type = req.query.type;
  try {
    if (type) {
      const users = await User.find({ role: type });
      return res.json({ status: true, users: users });
    } else {
      const users = await User.find();
      return res.json({ status: true, users: users });
    }
  } catch (err) {
    return res.json({ status: false, error: "Internal server error" });
  }
};

const getCurrentUser = async (req, res) => {
  const id = req.headers.id;
  try {
    const user = await User.findOne({ _id: id });
    return res.json({
      status: true,
      user: {
        id: user._id,
        first_name: user.firstName,
        middle_name: user.middleName,
        last_name: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.json({ status: false, error: "Internal server error" });
  }
};

const updatePassword = async (req, res) => {
  const currentPw = req.body.current_pw;
  const newPw = req.body.new_pw;
  try {
    const verify = jwt.verify(
      req.headers.authorization.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );

    const userId = verify.id;
    const user = await User.findOne({ _id: userId });
    const comparePw = await bcrypt.compare(currentPw, user.password);

    if (comparePw) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPw, salt);
      const updated = await User.updateOne(
        { _id: userId },
        {
          password: hashedPassword,
          passwordCreated: true,
        }
      );
      if (updated.acknowledged) {
        return res
          .status(200)
          .json({ status: true, passwordUpdated: "Password updated!" });
      } else {
        return res
          .status(500)
          .json({ status: false, error: "Internal server error" });
      }
    } else {
      return res
        .status(500)
        .json({ status: false, error: "Wrong current password" });
    }
  } catch (err) {}
};

const userRole = async (req, res) => {
  const verify = jwt.verify(
    req.headers?.authorization?.replace("Bearer ", ""),
    process.env.JWT_SECRET
  );
  if (verify) {
    return res.status(200).json({ status: true, role: verify.role });
  } else {
    return res
      .status(200)
      .json({ status: false, error: "User authentication error" });
  }
};

const blockUnblockUser = async (req, res) => {
  if (req.body.type == "admin" && req.headers.role !== "superAdmin") {
    return res.status(401).json({
      status: false,
      error: "Unauthorised, Super-Admin privilege required",
    });
  }
  try {
    const editBlocked = await User.updateOne(
      { _id: req.body.userId },
      {
        blocked: req.body.blocked,
      }
    );
    if (editBlocked.acknowledged) {
      if (req.body.type) {
        const users = await User.find({ role: req.body.type });
        return res.status(200).json({ status: true, users });
      } else {
        const users = await User.find({});
        return res.status(200).json({ status: true, users });
      }
    } else {
      return res
        .status(500)
        .json({ status: false, error: "Error in execution" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "internal server error" });
  }
};

const getUsersByPage = async (req, res) => {
  const currentPage = req.query.page;
  const type = req.query.type;
  let page = 1;
  const limit = 5;
  if (currentPage) page = currentPage;
  try {
    if (type) {
      const users = await User.paginate({ role: type }, { page, limit });
      return res.status(200).json({ status: true, users });
    } else {
      const users = await User.paginate({}, { page, limit });
      return res.status(200).json({ status: true, users });
    }
  } catch (err) {
    return res.status(500).json({ status: false, error: err });
  }
};

const deleteUser = async (req, res) => {
  userId = req.body.userId;
  try {
    const getUser = await User.findOne({ _id: userId });
    if (getUser.role !== "basic" && req.headers.role !== "superAdmin") {
      return res.status(401).json({
        status: false,
        error: "Unauthorised, Super-Admin privilege required",
      });
    } else if (
      getUser.role == "basic" &&
      (req.headers.role == "superAdmin" || req.headers.role == "admin")
    ) {
      const deleted = await User.deleteOne({ _id: userId });
      return res
        .status(200)
        .json({ status: true, deleted, message: "User successfully deleted" });
    } else if (req.headers.role == "superAdmin") {
      const deleted = await User.deleteOne({ _id: userId });
      return res
        .status(200)
        .json({ status: true, deleted, message: "User successfully deleted" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const userListSelect2 = async (req, res) => {
  try {
    const usersList = await User.find();
    const users = usersList.map((item) => {
      const obj = {
        value: item._id,
        label:
          item?.firstName + " " + item?.lastName + " " + `(${item?.email})`,
      };
      return obj;
    });
    return res.status(200).json({ status: true, users });
    // console.log("users", users);
  } catch (err) {}
};

module.exports = {
  registerUser,
  loginUser,
  editUser,
  getAllUsers,
  getCurrentUser,
  updatePassword,
  userRole,
  blockUnblockUser,
  getUsersByPage,
  deleteUser,
  userListSelect2,
};
