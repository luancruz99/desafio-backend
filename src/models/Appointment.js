const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Appointment = sequelize.define("Appointment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  date: DataTypes.DATEONLY,
  time: DataTypes.TIME,
  description: DataTypes.STRING,
  specialty: DataTypes.STRING,
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  token: {
    type: DataTypes.UUID,
  },
});

module.exports = Appointment;
