const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    title: String,
    answers: []
  },
  { versionKey: false }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
