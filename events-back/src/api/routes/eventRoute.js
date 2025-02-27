const express = require("express");
const { isAuth } = require("../../middlewares/auth");
const {
  getEvents,
  getEventById,
  getEventByTitle,
  createEvent,
  addAttendee,
} = require("../controllers/eventsController");
const { upload } = require("../../middlewares/fileStorage");
const router = express.Router();

router.post("/", upload.single("img"), isAuth, createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.get("/get/:title", getEventByTitle);
router.post("/attendees/:id", isAuth, addAttendee);

module.exports = router;
