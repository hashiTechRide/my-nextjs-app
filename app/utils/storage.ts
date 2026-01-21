import { Meal, Exercise, DailyStats } from '../types/diet';

export const storage = {
  // Meal operations
  getMeals: async (): Promise<Meal[]> => {
    const response = await fetch('/api/meals');
    if (!response.ok) throw new Error('Failed to fetch meals');
    return response.json();
  },

  saveMeal: async (meal: Meal): Promise<Meal> => {
    if (meal.id && meal.id.length > 13) {
      // Update existing meal (CUID format)
      const response = await fetch(`/api/meals/${meal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal),
      });
      if (!response.ok) throw new Error('Failed to update meal');
      return response.json();
    } else {
      // Create new meal
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal),
      });
      if (!response.ok) throw new Error('Failed to create meal');
      return response.json();
    }
  },

  deleteMeal: async (id: string): Promise<void> => {
    const response = await fetch(`/api/meals/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete meal');
  },

  getMealsByDate: async (date: string): Promise<Meal[]> => {
    const response = await fetch(`/api/meals?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch meals by date');
    return response.json();
  },

  // Exercise operations
  getExercises: async (): Promise<Exercise[]> => {
    const response = await fetch('/api/exercises');
    if (!response.ok) throw new Error('Failed to fetch exercises');
    return response.json();
  },

  saveExercise: async (exercise: Exercise): Promise<Exercise> => {
    if (exercise.id && exercise.id.length > 13) {
      // Update existing exercise (CUID format)
      const response = await fetch(`/api/exercises/${exercise.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exercise),
      });
      if (!response.ok) throw new Error('Failed to update exercise');
      return response.json();
    } else {
      // Create new exercise
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exercise),
      });
      if (!response.ok) throw new Error('Failed to create exercise');
      return response.json();
    }
  },

  deleteExercise: async (id: string): Promise<void> => {
    const response = await fetch(`/api/exercises/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete exercise');
  },

  getExercisesByDate: async (date: string): Promise<Exercise[]> => {
    const response = await fetch(`/api/exercises?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch exercises by date');
    return response.json();
  },

  // Statistics
  getDailyStats: async (date: string): Promise<DailyStats> => {
    const response = await fetch(`/api/stats?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch daily stats');
    return response.json();
  },

  getWeeklyStats: async (endDate: string): Promise<DailyStats[]> => {
    const response = await fetch(`/api/stats?endDate=${endDate}`);
    if (!response.ok) throw new Error('Failed to fetch weekly stats');
    return response.json();
  },
};
