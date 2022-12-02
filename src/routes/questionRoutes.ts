import { Router } from "express";
const protectAccess = require("../middleware/auth.js");
const { ShowQuestions, ShowQuestionById, UpsertQuestion, DeleteQuestion } = require("../api/question/question-controller");

const router: Router = Router();

router.get("/question", protectAccess, ShowQuestions);

router.get("/question/:id", protectAccess, ShowQuestionById);

router.post("/question", protectAccess, UpsertQuestion);

router.put("/question/:id", protectAccess, UpsertQuestion);

router.delete("/question/:id", protectAccess, DeleteQuestion);


module.exports = router;
