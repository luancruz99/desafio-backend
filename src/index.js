const express = require("express");
const sequelize = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const validBodyJsonVerifier = require("./middleware/validBodyJsonVerifier");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();

app.use(express.json());

app.use(validBodyJsonVerifier);

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/appointment", appointmentRoutes);

app.get("/", (req, res) => {
  return res.json({ message: "Servidor rodando!" });
});

const connectWithRetry = () => {
  console.log("Conectando-se ao banco...");
  sequelize
    .sync()
    .then(() => {
      console.log("Conexão com o banco de dados estabelecida com sucesso!");
    })
    .catch((err) => {
      console.log(
        "Falha ao se conectar ao banco de dados. Tentando novamente em 5 segundos..."
      );
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.listen(3000, () => {
  console.log("O servidor está rodando na porta 3000");
});
