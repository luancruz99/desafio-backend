const validBodyJsonVerifier = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(400)
      .send({ message: "O formato do objeto enviado é inválido" });
  }
  next();
};

module.exports = validBodyJsonVerifier;
