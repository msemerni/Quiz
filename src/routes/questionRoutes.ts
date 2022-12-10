import { Router } from "express";
import { ShowQuestions, ShowQuestionById, UpsertQuestion, DeleteQuestion } from "../api/question/question-controller";

const protectAccess = require("../middleware/auth.js");

const router: Router = Router();

router.get("/question", protectAccess, ShowQuestions);

router.get("/question/:id", protectAccess, ShowQuestionById);

router.post("/question", protectAccess, UpsertQuestion);

router.put("/question/:id", protectAccess, UpsertQuestion);

router.delete("/question/:id", protectAccess, DeleteQuestion);


export { router };
