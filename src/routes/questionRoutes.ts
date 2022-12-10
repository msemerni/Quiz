import { Router } from "express";
import { GetQuestions, GetQuestionById, UpsertQuestion, DeleteQuestion } from "../api/question/question-controller";

const protectAccess = require("../middleware/auth.js");

const router: Router = Router();

router.get("/question", protectAccess, GetQuestions);

router.get("/question/:id", protectAccess, GetQuestionById);

router.post("/question", protectAccess, UpsertQuestion);

router.put("/question/:id", protectAccess, UpsertQuestion);

router.delete("/question/:id", protectAccess, DeleteQuestion);


export { router };
