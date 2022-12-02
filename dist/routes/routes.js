"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const { SignUp, LogIn, LogOut } = require("../api/user/user-controller.js");
const router = (0, express_1.Router)();
router.post("/user/signup", SignUp);
router.post("/user/login", LogIn);
router.get("/user/logout", LogOut);
module.exports = router;
