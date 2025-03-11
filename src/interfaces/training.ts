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

export interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  rest?: string;
  duration?: string;
  intensity?: string;
  notes?: string;
}

export interface DaySchedule {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface Nutrition {
  dailyCalories: string;
  macronutrients: {
    protein: string;
    carbohydrates: string;
    fats: string;
  };
  hydration: string;
}

export interface TrainingPlan {
  overview: string;
  weeklySchedule: DaySchedule[];
  nutrition: Nutrition;
  tips: string[];
}
