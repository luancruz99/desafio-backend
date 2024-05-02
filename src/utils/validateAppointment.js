const validateAppointment = ({ date, time, description, specialty }) => {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!date) {
    return {
      status: 400,
      message: { message: "Data do agendamento não informada" },
    };
  }

  if (!dateRegex.test(date)) {
    return {
      status: 400,
      message: {
        message: "Data do agendamento inválida. Formato válido: 'DD/MM/AAAA'",
      },
    };
  }

  if (!time) {
    return {
      status: 400,
      message: { message: "Horário do agendamento não informado" },
    };
  }

  if (!timeRegex.test(time)) {
    return {
      status: 400,
      message: {
        message: "Horário do agendamento inválido. Formato válido: 'HH:MM'",
      },
    };
  }

  if (!description) {
    return {
      status: 400,
      message: { message: "Descrição do agendamento não informada" },
    };
  }

  if (!specialty) {
    return {
      status: 400,
      message: { message: "Especialidade da consulta não informada" },
    };
  }

  return { status: 200 };
};

module.exports = validateAppointment;
