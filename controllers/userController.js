const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/userModel");
const sendEmail = require("../config/sendEmail");
const fs = require("fs");

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
  const image = req.files[0].path.replaceAll("\\", "/").replace("files/", "");

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
        image,
        passwordCreated:
          passwordCreated !== null && passwordCreated !== undefined
            ? passwordCreated
            : true,
        blocked: false,
        verified: role == "basic" ? false : true,
        verification: null,
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
        if (getUser.blocked) {
          return res.status(500).json({
            status: false,
            error: "Your account is locked, please contact admin/super-admin.",
          });
        }

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
          if (!getUser.verified) {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            try {
              const emailRes = await sendEmail(
                email,
                randomNum,
                "verifyUser",
                getUser.firstName
              );
              if (emailRes.status) {
                try {
                  await User.updateOne({ email }, { verification: randomNum });
                } catch (err) {}
                return res.status(200).json({
                  status: false,
                  verify: true,
                  error:
                    "Your account is not verified, please check your email for verification code",
                });
              }
            } catch (err) {
              return res
                .status(500)
                .json({ status: false, error: "Internal server error" });
            }
          }
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

const verifyUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user.verification === req.body.code) {
      const updated = await User.updateOne(
        { email: req.body.email },
        { verified: true, verification: null }
      );
      if (updated.acknowledged) {
        return res.status(200).json({
          status: true,
          verified: "Your account is verified, please login now",
        });
      } else {
        return res
          .status(500)
          .json({ status: false, error: "Internal server error" });
      }
    } else {
      return res
        .status(500)
        .json({ status: false, error: "Verification code is not correct" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const editUser = async (req, res) => {
  const currentPw = req.body.current_pw;
  const newPw = req.body.new_pw;
  const userId = req.headers.id;
  const image = req?.files[0]?.path.replaceAll("\\", "/").replace("files/", "");
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
    const userOld = await User.findOne({ _id: userId });
    if (currentPw !== null && currentPw !== undefined && currentPw !== "") {
      const comparePw = await bcrypt.compare(currentPw, userOld.password);
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

    if (req.files.length > 0) {
      userObj["image"] = image;
    }

    const updated = await User.updateOne({ _id: userId }, userObj);

    if (updated.acknowledged) {
      if (req.files.length > 0) {
        console.log("updated");
        fs.unlink("files/" + userOld.image, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("file deleted!");
          }
        });
      }
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
        image: user.image,
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

const sendEmailVerification = async (req, res) => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  try {
    const user = await User.findOne({ email: req.body.email });
    const verification = await sendEmail(
      req.body.email,
      randomNum,
      "resetPassword",
      user.firstName
    );
    if (verification.status) {
      const updated = await User.updateOne(
        { email: req.body.email },
        { verification: randomNum }
      );

      if (updated.acknowledged) {
        return res.status(200).json({
          status: true,
          message: "Verification code has been sent to your email address",
        });
      }
    } else {
      return res.status(500).json({
        status: false,
        error: "Internal server error",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (req.body.code === user.verification) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      const updated = await User.updateOne(
        { email: req.body.email },
        { password: hashedPassword, verification: null }
      );
      if (updated.acknowledged) {
        return res
          .status(200)
          .json({ status: true, message: "Password has been updated" });
      }
    } else {
      return res
        .status(500)
        .json({ status: false, error: "Verification code is not correct" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
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
  verifyUser,
  sendEmailVerification,
  resetPassword,
};
