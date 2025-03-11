import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type UserFitnessDocument = UserFitness & Document;

@Schema({
  timestamps: true,
})
export class UserFitness {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  // 健身目标
  @Prop({ type: [String], default: [] })
  fitnessGoals: string[];

  // 运动偏好
  @Prop({ type: [String], default: [] })
  preferredWorkoutTypes: string[];

  // 运动历史统计
  @Prop({ type: Object, default: {} })
  workoutStats: {
    totalWorkouts: number;
    totalDuration: number; // 总运动时长（分钟）
    lastWorkout?: Date;
    weeklyAverage?: number;
    monthlyAverage?: number;
  };

  // 健康指标
  @Prop({ type: Object, default: {} })
  healthMetrics: {
    bmi?: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
    lastUpdated?: Date;
  };

  // AI 分析结果
  @Prop({ type: Object, default: {} })
  aiAnalytics: {
    workoutPatterns?: {
      preferredTime?: string[];
      frequentExercises?: string[];
      averageIntensity?: number;
    };
    performanceScores?: {
      overall: number;
      strength?: number;
      endurance?: number;
      flexibility?: number;
    };
    personalizedTips?: string[];
    lastAnalyzed?: Date;
  };

  // 训练目标
  @Prop({ type: Object, default: {} })
  trainingGoals: {
    weeklyWorkouts?: number;
    monthlyWorkouts?: number;
    caloriesBurn?: number;
    targetWeight?: number;
    targetDate?: Date;
  };
}

export const UserFitnessSchema = SchemaFactory.createForClass(UserFitness);
