import { Router } from "express";
import { CreateQuiz, SendQuestionToUser, SetAnswer } from "../api/game/game-controller";
const protectAccess = require("../middleware/auth.js");
const gamePermission = require("../middleware/game-permission.js");
const router: Router = Router();

router.get("/game/new/:gamename/:userid", protectAccess, CreateQuiz);

router.get("/quiz/:gameuuid", protectAccess, gamePermission, SendQuestionToUser);

router.post("/quiz/:gameuuid/:questionid", protectAccess, gamePermission, SetAnswer);


export { router };
