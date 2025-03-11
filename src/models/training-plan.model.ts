import mongoose, { Schema, Document } from 'mongoose';
import { UserFitnessInfo, TrainingPlan } from '../interfaces/training';

export interface IUserFitness extends Document {
  userId: string;
  userInfo: UserFitnessInfo;
  planJson: TrainingPlan;
  createdAt: Date;
  updatedAt: Date;
}

const UserFitnessSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userInfo: {
      age: { type: Number, required: true },
      gender: { type: String, required: true, enum: ['male', 'female'] },
      weight: { type: Number, required: true },
      height: { type: Number, required: true },
      fitnessLevel: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced'],
      },
      goal: {
        type: String,
        required: true,
        enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance'],
      },
      daysPerWeek: { type: Number, required: true },
      healthIssues: [{ type: String }],
      preferredExercises: [{ type: String }],
    },
    planJson: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'userfitnesses',
  },
);

// 创建索引以提高查询性能
UserFitnessSchema.index({ userId: 1, createdAt: -1 });

export const UserFitnessModel = mongoose.model<IUserFitness>(
  'UserFitness',
  UserFitnessSchema,
);
