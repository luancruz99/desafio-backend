const dotenv = require("dotenv");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const statusCode = require("../errors/defaultErrors");

dotenv.config();

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Nome não informado" });
  }

  if (!email) {
    return res.status(400).json({ message: "Email não informado" });
  }

  if (!password) {
    return res.status(400).json({ message: "Senha não informada" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "A senha deve ter pelo menos 8 caracteres" });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Já existe um usuário com esse email cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    delete user.dataValues.password;
    return res.status(201).json(user);
  } catch (error) {
    return res
      .status(statusCode.internalServerError.status)
      .json(statusCode.internalServerError.message);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email não informado" });
  }

  if (!password) {
    return res.status(400).json({ message: "Senha não informada" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Email ou senha inválidos" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email ou senha inválidos" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    delete user.dataValues.password;
    return res.json({ user, token });
  } catch (error) {
    return res
      .status(statusCode.internalServerError.status)
      .json(statusCode.internalServerError.message);
  }
};

module.exports = {
  register,
  login,
};
