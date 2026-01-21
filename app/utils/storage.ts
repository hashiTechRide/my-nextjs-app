import { Meal, Exercise, DailyStats } from '../types/diet';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';

const MEALS_KEY = 'diet-app-meals';
const EXERCISES_KEY = 'diet-app-exercises';

export const storage = {
  // Meal operations
  getMeals: (): Meal[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(MEALS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveMeal: (meal: Meal): void => {
    const meals = storage.getMeals();
    const existingIndex = meals.findIndex(m => m.id === meal.id);

    if (existingIndex >= 0) {
      meals[existingIndex] = meal;
    } else {
      meals.push(meal);
    }

    localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  },

  deleteMeal: (id: string): void => {
    const meals = storage.getMeals().filter(m => m.id !== id);
    localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  },

  getMealsByDate: (date: string): Meal[] => {
    return storage.getMeals().filter(m => m.date === date);
  },

  // Exercise operations
  getExercises: (): Exercise[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(EXERCISES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveExercise: (exercise: Exercise): void => {
    const exercises = storage.getExercises();
    const existingIndex = exercises.findIndex(e => e.id === exercise.id);

    if (existingIndex >= 0) {
      exercises[existingIndex] = exercise;
    } else {
      exercises.push(exercise);
    }

    localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
  },

  deleteExercise: (id: string): void => {
    const exercises = storage.getExercises().filter(e => e.id !== id);
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
  },

  getExercisesByDate: (date: string): Exercise[] => {
    return storage.getExercises().filter(e => e.date === date);
  },

  // Statistics
  getDailyStats: (date: string): DailyStats => {
    const meals = storage.getMealsByDate(date);
    const exercises = storage.getExercisesByDate(date);

    const totalCaloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalCaloriesBurned = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
    const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
    const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

    return {
      date,
      totalCaloriesConsumed,
      totalCaloriesBurned,
      netCalories: totalCaloriesConsumed - totalCaloriesBurned,
      totalProtein,
      totalCarbs,
      totalFat,
    };
  },

  getWeeklyStats: (endDate: string): DailyStats[] => {
    const stats: DailyStats[] = [];
    const end = parseISO(endDate);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(end);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      stats.push(storage.getDailyStats(dateStr));
    }

    return stats;
  },
};
