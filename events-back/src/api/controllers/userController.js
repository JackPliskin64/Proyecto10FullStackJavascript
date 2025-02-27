const { generarLlave } = require("../../utils/jwt");
const { HTTP_RESPONSES } = require("../models/httpResponses");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(HTTP_RESPONSES.NOT_FOUND).json("No hay usuarios");
    }
    return res.status(HTTP_RESPONSES.OK).json(users);
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
      .json(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.message);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(HTTP_RESPONSES.BAD_REQUEST).json("Id faltante");
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(HTTP_RESPONSES.NOT_FOUND).json("Usuario no encontrado");
    }
    return res.status(HTTP_RESPONSES.OK).json(user);
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
      .json(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.message);
  }
};

const register = async (req, res, next) => {
  try {
    if (!req.body.userName || !req.body.email || !req.body.password) {
      return res
        .status(HTTP_RESPONSES.BAD_REQUEST)
        .json("Nombre de usuario, email y/o contraseña faltantes");
    }
    const nameDuplicated = await User.findOne({ userName: req.body.userName });
    const emailDuplicated = await User.findOne({ email: req.body.email });
    if (nameDuplicated) {
      return res.status(HTTP_RESPONSES.CONFLICT).json("Usuario ya existente");
    }
    if (emailDuplicated) {
      return res.status(HTTP_RESPONSES.CONFLICT).json("Email ya registrado");
    }
    const image =
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
    const newUser = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
      image: image,
      rol: "user",
    });
    const user = await newUser.save();
    return res.status(HTTP_RESPONSES.CREATED).json(user);
  } catch (error) {
    return res
      .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
      .json(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.message);
  }
};

const login = async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      return res
        .status(HTTP_RESPONSES.BAD_REQUEST)
        .json("Nombre de usuario y/o contraseña faltantes");
    }
    const user = await User.findOne({ userName });
    if (user) {
      const match = await bcrypt.compare(password.trim(), user.password.trim());
      if (match) {
        console.log("login autoirizado");
        const token = generarLlave(user._id);
        return res.status(HTTP_RESPONSES.OK).json({ token, user });
      } else {
        return res
          .status(HTTP_RESPONSES.UNAUTHORIZED)
          .json("Usuario y/o contraseña incorrectos");
      }
    } else {
      return res.status(HTTP_RESPONSES.NOT_FOUND).json("Usuario no existe");
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
      .json(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.message);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userName } = req.body;
    console.log("Update user: ", id);
    if (!id) {
      return res.status(HTTP_RESPONSES.BAD_REQUEST).json("Id faltante");
    }
    if (req.user._id.toString() !== id) {
      return res
        .status(HTTP_RESPONSES.BAD_REQUEST)
        .json("Id de usuario incorrecto");
    }
    if (!userName) {
      return res
        .status(HTTP_RESPONSES.BAD_REQUEST)
        .json("Nuevo username requerido");
    }
    const oldUser = await User.findById(id);
    if (!oldUser) {
      return res.status(HTTP_RESPONSES.NOT_FOUND).json("Usuario no encontrado");
    }
    const existingUser = await User.findOne({ userName });
    if (existingUser && existingUser._id.toString() !== id) {
      return res
        .status(HTTP_RESPONSES.BAD_REQUEST)
        .json("Username ya está en uso");
    }

    const userUpdated = await User.findByIdAndUpdate(
      id,
      { userName },
      { new: true }
    );
    if (!userUpdated) {
      return res.status(HTTP_RESPONSES.NOT_FOUND).json("Usuario no encontrado");
    }
    return res.status(HTTP_RESPONSES.OK).json(userUpdated);
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
      .json(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.message);
  }
};

const updateImage = async (req, res, next) => {
  const { id } = req.params;
  const img = req.file.path;
  try {
    console.log("Image Path:", req.file.path);
    const userUpdated = await User.findByIdAndUpdate(
      id,
      { image: img },
      { new: true }
    );
    if (!userUpdated) {
      return res.status(HTTP_RESPONSES.NOT_FOUND).json("Usuario no encontrado");
    }
    return res.status(HTTP_RESPONSES.OK).json({ imageUrl: img });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
      .json(HTTP_RESPONSES.INTERNAL_SERVER_ERROR.message);
  }
};

module.exports = {
  getUsers,
  getUserById,
  register,
  updateUser,
  updateImage,
  login,
};
