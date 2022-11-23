import { Hash } from 'crypto';
const bcrypt = require('bcryptjs');
const joiSchema = require("./validators/joi-validator.js");
const User = require("./user/user-model");

// type UserType = {
//     [key: string]: string
//   }

const SignUp = async (req, res) => {
  try {
    const { login, password, nick } = req.body;
    const isNotValidNewUser = joiSchema.validate({ login, password, nick }).error;

    if (!isNotValidNewUser) {
      const isUserExist = await User.findOne({ login });

      if (isUserExist) {
        return res.status(401).send({ status: "error", message: "user already exist" });
      }

      const passwordHash: Hash = await bcrypt.hash(password, 10);
      const newUser = new User({ login, password: passwordHash, nick: nick || "anon" });
      await newUser.save();

      req.session.user = newUser;
      res.status(201).send({ login: newUser.login, nick: newUser.nick });
    }
    else {
      res.status(401).send(isNotValidNewUser.details[0]);
    }
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
}

const LogIn = async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await User.findOne({ login });

    if (!user) {
      res.status(401).send({ status: "error", message: "user not found" });
    }
    else {
      const isCorrectPassword: Hash = await bcrypt.compare(password, user.password);

      if (isCorrectPassword) {
        req.session.user = user;
        return res.status(200).send({ _id: user._id, login: user.login, nick: user.nick });
      }

      res.status(401).send({ status: "error", message: "wrong password" });
    }
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
}

const LogOut = async (req, res) => {
  try {
    req.session.destroy(() => console.log("complete"));
    res.status(200).json({ status: "success", message: "logout success" });
  }
  catch (error) {
    res.status(500).json({ "error": error });
  }
}

module.exports = { SignUp, LogIn, LogOut };
