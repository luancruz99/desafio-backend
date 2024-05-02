const express = require("express");
const verifyToken = require("../middleware/authentication");
const {
  deleteUser,
  updateUser,
  getUserProfile,
  updatePassword,
} = require("../controllers/UserController");

const userRoutes = express();

userRoutes.use(verifyToken);

userRoutes.get("/profile", getUserProfile);
userRoutes.put("/update_profile", updateUser);
userRoutes.put("/update_password", updatePassword);
userRoutes.delete("/delete", deleteUser);

module.exports = userRoutes;
