const Appointment = require("../models/Appointment");
const statusCode = require("../errors/defaultErrors");
const uuid = require("uuid");
const moment = require("moment");
const puppeteer = require("puppeteer");
const validateAppointment = require("../utils/validateAppointment");

const createAppointment = async (req, res) => {
  const { date, time, description, specialty } = req.body;
  const userId = req.user.id;

  if (!userId) {
    return res
      .status(statusCode.unauthorized.status)
      .json(statusCode.unauthorized.message);
  }

  const validation = validateAppointment(req.body);

  if (validation.status !== 200) {
    return res.status(validation.status).json(validation.message);
  }

  try {
    const appointment = await Appointment.create({
      date: moment(date, "DD/MM/YYYY"),
      time,
      description,
      specialty,
      userId,
    });

    delete appointment.dataValues.token;

    return res.status(201).json(appointment);
  } catch (error) {
    return res
      .status(statusCode.internalServerError.status)
      .json(statusCode.internalServerError.message);
  }
};

const getAllAppointments = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res
      .status(statusCode.unauthorized.status)
      .json(statusCode.unauthorized.message);
  }
  try {
    const appointments = await Appointment.findAll({
      where: { userId },
      attributes: ["id", "date", "time", "token"],
      order: [["id", "ASC"]],
    });

    if (appointments.lenght === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum agendamento encontrado para esse usuário" });
    }

    appointments.forEach(async (appointment) => {
      const token = uuid.v4();
      appointment.token = token;
      await Appointment.update({ token }, { where: { id: appointment.id } });
    });

    return res.status(200).json(appointments);
  } catch (error) {
    return res
      .status(statusCode.internalServerError.status)
      .json(statusCode.internalServerError.message);
  }
};

const getAppointmentDetails = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res
      .status(400)
      .json({ message: "Token do agendamento não informado" });
  }

  if (token.length !== 36) {
    return res.status(400).json({ message: "Token do agendamento inválido" });
  }

  try {
    const appointment = await Appointment.findOne({
      where: { token: token },
    });

    if (!appointment) {
      return res
        .status(400)
        .json({ message: "Token do agendamento incorreto ou inválido" });
    }

    if (appointment.userId !== req.user.id) {
      return res.status(401).json({
        message: "Usuário sem permissão para acessar esse agendamento",
      });
    }

    appointment.token = null;
    await appointment.save();
    delete appointment.dataValues.token;

    return res.status(200).json(appointment);
  } catch (error) {
    return res
      .status(statusCode.internalServerError.status)
      .json(statusCode.internalServerError.message);
  }
};

const updateAppointment = async (req, res) => {
  const { id, date, time, description, specialty } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Id do agendamento não informado" });
  }

  const validation = validateAppointment(req.body);

  if (validation.status !== 200) {
    return res.status(validation.status).json(validation.message);
  }

  try {
    //Desestrutura o primeiro elemento do array retornado pelo método update, que é a quantidade de linhas atualizadas
    const [updated] = await Appointment.update(
      { date: moment(date, "DD/MM/YYYY"), time, description, specialty },
      {
        where: { id: id, userId: req.user.id },
      }
    );

    if (updated <= 0) {
      return res.status(404).json({ message: "Agendamento não encontrado" });
    }

    const updatedAppointment = await Appointment.findByPk(id);

    if (!updatedAppointment) {
      return res.status(400).json({
        message: "Falha ao recuperar dados atualizados do agendamento",
      });
    }

    delete updatedAppointment.dataValues.token;

    return res.status(200).json({ appointment: updatedAppointment });
  } catch (error) {
    return res
      .status(statusCode.internalServerError.status)
      .json(statusCode.internalServerError.message);
  }
};

const deleteAppointment = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Id do agendamento não informado" });
  }

  try {
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: "Agendamento não encontrado" });
    }

    if (appointment.userId !== req.user.id) {
      return res.status(401).json({
        message: "Usuário sem permissão para excluir esse agendamento",
      });
    }

    const deleted = await Appointment.destroy({
      where: { id: id },
    });

    if (deleted <= 0) {
      return res.status(400).json({ message: "Falha ao excluir agendamento" });
    }

    return res
      .status(200)
      .json({ message: "Agendamento excluido com sucesso!" });
  } catch (error) {
    return res
      .status(statusCode.internalServerError.status)
      .json(statusCode.internalServerError.message);
  }
};

const generateAppointmentPDF = async (req, res) => {
  const { id } = req.query;
  const user = req.user;

  if (!id) {
    return res.status(400).json({ message: "Id do agendamento não informado" });
  }

  try {
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: "Agendamento não encontrado" });
    }

    if (appointment.userId !== user.id) {
      return res.status(401).json({
        message: "Usuário sem permissão para acessar esse agendamento",
      });
    }

    const html = `
    <h1>Agendamento</h1>
    <p>Nome do paciente: ${user.name}</p>
    <p>Email do paciente: ${user.email}</p>    
    <br/><br/>    
    <p>Data: ${appointment.date}</p>
    <p>Horário: ${appointment.time}</p>
    <p>Descrição: ${appointment.description}</p>
    <p>Especialidade: ${appointment.specialty}</p>
  `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html);

    const pdf = await page.pdf({ format: "A4" });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdf.length,
      "Content-Disposition": "attachment; filename=appointment.pdf",
    });

    res.send(pdf);
  } catch (error) {
    return res
      .status(statusCode.internalServerError.status)
      .json(statusCode.internalServerError.message);
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentDetails,
  updateAppointment,
  deleteAppointment,
  generateAppointmentPDF,
};
