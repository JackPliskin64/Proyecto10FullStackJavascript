const { isAuth } = require("../../middlewares/auth");
const {
  getUsers,
  getUserById,
  register,
  login,
  updateUser,
  updateImage,
} = require("../controllers/userController");

const usersRouter = require("express").Router();
const { upload } = require("../../middlewares/fileStorage");

usersRouter.get("/", getUsers);
usersRouter.get("/:id", getUserById);
usersRouter.post("/register", register);
usersRouter.post("/login", login);
usersRouter.put("/:id", isAuth, updateUser);
usersRouter.put("/profileImage/:id", upload.single("img"), isAuth, updateImage);

module.exports = usersRouter;
