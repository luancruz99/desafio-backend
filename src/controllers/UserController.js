const dotenv = require("dotenv");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const statusCode = require("../errors/defaultErrors");

dotenv.config();

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  if (!userId) {
    return res
      .status(statusCode.unauthorized.status)
      .json(statusCode.unauthorized.message);
  }

  if (!name) {
    return res.status(400).json({ message: "Nome não informado" });
  }

  if (!email) {
    return res.status(400).json({ message: "Email não informado" });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const updatedUser = await user.update({ name, email });

    delete updatedUser.dataValues.password;

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res
      .status(statusCode.internalServerError.status)
      .json(statusCode.internalServerError.message);
  }
};

const updatePassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const userId = req.user.id;

  if (!userId) {
    return res
      .status(statusCode.unauthorized.status)
      .json(statusCode.unauthorized.message);
  }

  if (!password) {
    return res.status(400).json({ message: "Senha não informada" });
  }

  if (!confirmPassword) {
    return res
      .status(400)
      .json({ message: "Confirmação de senha não informada" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "A senha deve ter pelo menos 8 caracteres" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "As senhas não conferem" });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await user.update({ password: hashedPassword });

    delete updatedUser.dataValues.password;

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res
      .status(statusCode.internalServerError.status)
      .json(statusCode.internalServerError.message);
  }
};

const deleteUser = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res
      .status(statusCode.unauthorized.status)
      .json(statusCode.unauthorized.message);
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const deleted = await User.destroy({ where: { id: userId } });

    if (deleted <= 0) {
      return res.status(400).json({ message: "Falha ao deletar usuário" });
    }

    return res.status(200).json({ message: "Usuário deletado com sucesso!" });
  } catch (error) {
    return res
      .status(statusCode.internalServerError.status)
      .json(statusCode.internalServerError.message);
  }
};

const getUserProfile = async (req, res) => {
  return res.json(req.user);
};

module.exports = {
  deleteUser,
  getUserProfile,
  updateUser,
  updatePassword,
};
