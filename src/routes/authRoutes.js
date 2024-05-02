const express = require("express");
const { login, register } = require("../controllers/AuthController");

const authRoutes = express();

authRoutes.post("/login", login);
authRoutes.post("/register", register);

module.exports = authRoutes;
