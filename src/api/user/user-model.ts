import { model, Schema, Model } from 'mongoose';
import { IUser } from "../../types/project-types";

const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    login: { 
      type: String, 
      required: true },
    password: { 
      type: String, 
      required: true },
    nick: { 
      type: String, 
      required: false }
  },
  { versionKey: false }
  );

const User: Model<IUser> = model<IUser>('User', userSchema);

export { User };
