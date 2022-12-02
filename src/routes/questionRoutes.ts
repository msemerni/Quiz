import { Router } from "express";
const protectAccess = require("../middleware/auth.js");
const { ShowQuestions, ShowQuestionById, CreateNewQuestion, UpdateQuestion, DeleteQuestion } = require("../api/question/question-controller");

const router: Router = Router();

router.get("/question", protectAccess, ShowQuestions);

router.get("/question/:id", protectAccess, ShowQuestionById);

router.post("/question", protectAccess, CreateNewQuestion);

router.put("/question/:id", protectAccess, UpdateQuestion);

router.delete("/question/:id", protectAccess, DeleteQuestion);


module.exports = router;
