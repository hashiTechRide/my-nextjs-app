export interface Meal {
  id: string;
  date: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Exercise {
  id: string;
  date: string;
  name: string;
  duration: number; // minutes
  caloriesBurned: number;
  type: 'cardio' | 'strength' | 'flexibility' | 'other';
}

export interface DailyStats {
  date: string;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  netCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}
