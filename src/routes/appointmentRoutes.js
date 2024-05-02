const express = require("express");
const verifyToken = require("../middleware/authentication");
const {
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAllAppointments,
  getAppointmentDetails,
  generateAppointmentPDF,
} = require("../controllers/AppointmentController");

const appointmentRoutes = express();

appointmentRoutes.use(verifyToken);

appointmentRoutes.post("/create", createAppointment);
appointmentRoutes.get("/getAll", getAllAppointments);
appointmentRoutes.get("/getDetails", getAppointmentDetails);
appointmentRoutes.put("/update", updateAppointment);
appointmentRoutes.delete("/delete", deleteAppointment);
appointmentRoutes.get("/generatePdf", generateAppointmentPDF);

module.exports = appointmentRoutes;
