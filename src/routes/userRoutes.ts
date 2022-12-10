import { Router } from "express";
import { SignUp, LogIn, LogOut, DeleteUser } from "../api/user/user-controller";

const protectAccess = require("../middleware/auth.js");

const router: Router = Router();

router.post("/user/signup", SignUp);

router.post("/user/login", LogIn);

router.get("/user/logout", LogOut);

router.delete("/user/delete/:id", protectAccess, DeleteUser);


export { router };
