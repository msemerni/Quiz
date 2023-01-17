import { model, Schema, Model } from "mongoose";
import { IQuestion, IAnswer } from "../../types/project-types";

const questionSchema: Schema<IQuestion> = new Schema<IQuestion>(
  {
    title: { 
      type: String, 
      required: true },
    answers: { 
      type: Array<IAnswer>, 
      required: true }
  },
  { versionKey: false }
);

const Question: Model<IQuestion> = model<IQuestion>('Question', questionSchema);

export { Question };
