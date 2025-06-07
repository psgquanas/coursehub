import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    lecureCompleted: [],
  },
  { minimize: false }
);

export const courseProgress = new mongoose.model(
  "CourseProgress",
  courseProgressSchema
);
