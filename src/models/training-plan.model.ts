import mongoose, { Schema, Document } from 'mongoose';
import { TrainingPlan, UserFitnessInfo } from '../interfaces/training';

export interface ITrainingPlanDocument extends Document {
  userId: string;
  userInfo: UserFitnessInfo;
  planJson: TrainingPlan;
  planMarkdown: string;
  createdAt: Date;
  updatedAt: Date;
}

const trainingPlanSchema = new Schema({
  userId: { type: String, required: true },
  userInfo: {
    age: Number,
    gender: String,
    weight: Number,
    height: Number,
    fitnessLevel: String,
    goal: String,
    healthIssues: [String],
    daysPerWeek: Number,
    preferredExercises: [String],
  },
  planJson: Schema.Types.Mixed,
  planMarkdown: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const TrainingPlanModel = mongoose.model<ITrainingPlanDocument>(
  'TrainingPlan',
  trainingPlanSchema,
);
