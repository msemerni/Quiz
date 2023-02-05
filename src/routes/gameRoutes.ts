import { Router } from "express";
import { JoinGame, CreateQuiz, SendQuestionToUser, GetAnswerReview } from "../api/game/game-controller";
const protectAccess = require("../middleware/auth.js");
const gamePermission = require("../middleware/game-permission.js");
const router: Router = Router();

router.get("/game/new/:gamename/:userid", protectAccess, CreateQuiz);

router.get("/game/:gameuuid", protectAccess, gamePermission, JoinGame);

router.get("/quiz/:gameuuid", protectAccess, gamePermission, SendQuestionToUser);

router.post("/quiz/:gameuuid/:questionid", protectAccess, gamePermission, GetAnswerReview);


export { router };
