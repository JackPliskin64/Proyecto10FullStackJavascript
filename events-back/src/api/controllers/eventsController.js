const { HTTP_RESPONSES } = require("../models/httpResponses");
const Event = require("../models/event");
const mongoose = require("mongoose");

const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate("attendees");
    if (events.length !== 0) {
      return res.status(HTTP_RESPONSES.OK).json(events);
    }
    return res.status(HTTP_RESPONSES.NOT_FOUND).json("No hay eventos");
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
      .json(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.message);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(HTTP_RESPONSES.BAD_REQUEST)
        .json("Id de evento no válido");
    }
    const event = await Event.findById(id).populate("attendees");
    if (!event) {
      return res.status(HTTP_RESPONSES.NOT_FOUND).json("Evento no encontrado");
    }
    return res.status(HTTP_RESPONSES.OK).json(event);
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
      .json(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.message);
  }
};

const getEventByTitle = async (req, res, next) => {
  try {
    const { title } = req.params;
    if (!title) {
      return res.status(HTTP_RESPONSES.BAD_REQUEST).json("Titulo faltante");
    }
    const event = await Event.findOne({ title }).populate("attendees");
    if (!event) {
      return res.status(HTTP_RESPONSES.NOT_FOUND).json("Evento no encontrado");
    }
    return res.status(HTTP_RESPONSES.OK).json(event);
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
      .json(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.message);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const newEvent = new Event({
      title: req.body.title,
      date: req.body.date,
      location: req.body.location,
      description: req.body.description,
      img: req.file ? req.file.path : null,
      creator: req.body.creator,
    });
    const event = await newEvent.save();
    return res.status(HTTP_RESPONSES.CREATED).json(event);
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
      .json(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.message);
  }
};

const addAttendee = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(HTTP_RESPONSES.BAD_REQUEST).json("Id faltante");
    }

    const oldEvent = await Event.findById(id);
    if (!oldEvent) {
      return res.status(HTTP_RESPONSES.NOT_FOUND).json("Evento no encontrado");
    }

    const userId = req.user._id.toString();
    const updates = {};
    if (
      !oldEvent.attendees
        .map((attendee) => attendee.toString())
        .includes(userId)
    ) {
      updates.attendees = [...oldEvent.attendees, userId];
    }

    if (JSON.stringify(updates) === "{}") {
      return res.status(200).json({ message: "No changes" });
    }

    const eventUpdated = await Event.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!eventUpdated) {
      return res.status(HTTP_RESPONSES.NOT_FOUND).json("Evento no encontrado");
    }
    return res.status(HTTP_RESPONSES.OK).json(eventUpdated);
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
      .json(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.message);
  }
};

module.exports = {
  getEvents,
  getEventById,
  getEventByTitle,
  createEvent,
  addAttendee,
};
