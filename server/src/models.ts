
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

export interface IQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

const questionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, required: true },
  category: { type: String, required: true }
});

export interface IAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  score: number;
  total: number;
  percentage: number;
  createdAt: Date;
}

const attemptSchema = new Schema<IAttempt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
export const Question = mongoose.model<IQuestion>(
  "Question",
  questionSchema
);
export const Attempt = mongoose.model<IAttempt>("Attempt", attemptSchema);
