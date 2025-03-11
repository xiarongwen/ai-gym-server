export interface UserFitnessInfo {
  age: number;
  gender: 'male' | 'female';
  weight: number; // 单位：kg
  height: number; // 单位：cm
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goal: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance';
  healthIssues?: string[];
  daysPerWeek: number; // 每周训练天数
  preferredExercises?: string[]; // 偏好的运动类型
}

export interface TrainingPlan {
  overview: string;
  weeklySchedule: {
    day: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      rest: string;
      notes?: string;
    }[];
  }[];
  nutrition: {
    dailyCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
    recommendations: string[];
  };
  tips: string[];
}
