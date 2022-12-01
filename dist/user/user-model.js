"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    login: String,
    password: String,
    nick: String,
}, { versionKey: false });
const User = mongoose.model("User", userSchema);
exports.default = User;
