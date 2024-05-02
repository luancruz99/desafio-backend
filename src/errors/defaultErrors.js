const statusCode = {
  internalServerError: {
    status: 500,
    message: { message: "Erro interno no servidor" },
  },
  unauthorized: {
    status: 401,
    message: { message: "Não autorizado" },
  },
};

module.exports = statusCode;
