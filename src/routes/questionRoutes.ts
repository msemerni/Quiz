import { Router } from "express";
import { 
    GetAllQuestions, 
    GetQuestionById, 
    UpsertQuestion, 
    DeleteQuestion, 
    StartQuiz, 
    SendQuestionToUser,
    CheckAnswerResult
} from "../api/question/question-controller";

const protectAccess = require("../middleware/auth.js");

const router: Router = Router();

router.get("/question", protectAccess, GetAllQuestions);

router.get("/question/:id", protectAccess, GetQuestionById);

router.post("/question", protectAccess, UpsertQuestion);

router.put("/question/:id", protectAccess, UpsertQuestion);

router.delete("/question/:id", protectAccess, DeleteQuestion);

router.get("/quiz", protectAccess, StartQuiz);

router.get("/quiz/question/:questionNumber", protectAccess, SendQuestionToUser);

router.post("/quiz/question/:id", protectAccess, CheckAnswerResult);


export { router };
