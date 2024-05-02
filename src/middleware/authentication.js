const statusCode = require("../errors/defaultErrors");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res
      .status(statusCode.unauthorized.status)
      .json(statusCode.unauthorized.message);
  }

  try {
    const { userId } = jwt.verify(authorization, process.env.JWT_SECRET);
    if (!userId) {
      return res.status(401).json({ message: "Token inválido" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    delete user.dataValues.password;

    req.user = user;

    next();
  } catch (error) {
    return res
      .status(statusCode.unauthorized.status)
      .json(statusCode.unauthorized.message);
  }
};

module.exports = verifyToken;
