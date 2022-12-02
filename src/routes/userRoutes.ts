import { Router } from "express";
const protectAccess = require("../middleware/auth.js");
const { SignUp, LogIn, LogOut, DeleteUser } = require("../api/user/user-controller.js");

const router: Router = Router();

router.post("/user/signup", SignUp);

router.post("/user/login", LogIn);

router.get("/user/logout", LogOut);

router.delete("/user/delete/:id", protectAccess, DeleteUser);

module.exports = router;
