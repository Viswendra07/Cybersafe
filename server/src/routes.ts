
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User, Question, Attempt } from "./models.js";
import { verifyToken } from "./auth.js";

const router = Router();

router.post(
  "/auth/register",
  async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      if (
        typeof name !== "string" ||
        !name.trim() ||
        name.trim().length > 80 ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        password.length < 8 ||
        password.length > 128 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ) {
        res.status(400).json({
          message: "Enter a valid name and email, and a password of 8–128 characters"
        });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail });

      if (existing) {
        res.status(409).json({ message: "Email already registered" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword
      });

      res.status(201).json({
        message: "Registration successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      if (
        error instanceof mongoose.Error ||
        (error as { code?: number })?.code === 11000
      ) {
        res.status(409).json({ message: "Email already registered" });
        return;
      }

      console.error(error);
      res.status(500).json({ message: "Registration failed" });
    }
  }
);

router.post(
  "/auth/login",
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        res.status(400).json({ message: "Email and password required" });
        return;
      }

      const user = await User.findOne({
        email: email.trim().toLowerCase()
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        res.status(500).json({ message: "Server configuration error" });
        return;
      }

      const token = jwt.sign(
        { userId: user._id.toString() },
        secret,
        { expiresIn: "2h" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Login failed" });
    }
  }
);

router.get(
  "/quiz/questions",
  verifyToken,
  async (_req: Request, res: Response) => {
    try {
      const questions = await Question.find()
        .select("_id question options category")
        .lean();

      res.json(questions);
    } catch {
      res.status(500).json({ message: "Could not load questions" });
    }
  }
);

router.post(
  "/quiz/submit",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const answers = req.body.answers;

      if (!Array.isArray(answers) || answers.length === 0 ||
          answers.length > 50) {
        res.status(400).json({ message: "Submit 1–50 answers" });
        return;
      }

      const ids = answers.map((a: any) => a?.questionId);

      if (
        answers.some(
          (a: any) =>
            !a ||
            typeof a.questionId !== "string" ||
            !mongoose.isValidObjectId(a.questionId) ||
            !Number.isInteger(a.selectedOption) ||
            a.selectedOption < 0 ||
            a.selectedOption > 3
        ) ||
        new Set(ids).size !== ids.length
      ) {
        res.status(400).json({ message: "Invalid or duplicate answers" });
        return;
      }

      const questions = await Question.find({
        _id: { $in: ids }
      });

      if (questions.length !== ids.length) {
        res.status(400).json({ message: "Unknown question submitted" });
        return;
      }

      const questionMap = new Map(
        questions.map((q) => [q._id.toString(), q])
      );

      const details = answers.map((answer: {
        questionId: string;
        selectedOption: number;
      }) => {
        const question = questionMap.get(answer.questionId)!;
        const isCorrect =
          question.correctAnswer === answer.selectedOption;

        return {
          questionId: answer.questionId,
          question: question.question,
          selectedOption: answer.selectedOption,
          correctAnswer: question.correctAnswer,
          isCorrect,
          explanation: question.explanation
        };
      });

      const score = details.filter((d) => d.isCorrect).length;
      const total = details.length;
      const percentage = Math.round((score / total) * 100);

      const attempt = await Attempt.create({
        userId: req.userId,
        score,
        total,
        percentage
      });

      res.json({
        message: "Quiz submitted successfully",
        attemptId: attempt._id.toString(),
        score,
        total,
        percentage,
        details
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Could not submit quiz" });
    }
  }
);

router.get(
  "/quiz/history",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const attempts = await Attempt.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("score total percentage createdAt")
        .lean();

      res.json(attempts);
    } catch {
      res.status(500).json({ message: "Could not load history" });
    }
  }
);

export default router;
