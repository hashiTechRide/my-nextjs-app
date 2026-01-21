import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storage } from '../app/utils/storage';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('storage', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('getMeals', () => {
    it('should fetch all meals successfully', async () => {
      const mockMeals = [
        { id: '1', name: 'Breakfast', calories: 500 },
        { id: '2', name: 'Lunch', calories: 700 },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMeals),
      });

      const result = await storage.getMeals();

      expect(mockFetch).toHaveBeenCalledWith('/api/meals');
      expect(result).toEqual(mockMeals);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(storage.getMeals()).rejects.toThrow('Failed to fetch meals');
    });
  });

  describe('saveMeal', () => {
    it('should create a new meal when id is short', async () => {
      const newMeal = {
        id: '',
        date: '2024-01-01',
        type: 'breakfast' as const,
        name: 'Oatmeal',
        calories: 300,
        protein: 10,
        carbs: 50,
        fat: 5,
      };
      const savedMeal = { ...newMeal, id: 'cuid12345678901234' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(savedMeal),
      });

      const result = await storage.saveMeal(newMeal);

      expect(mockFetch).toHaveBeenCalledWith('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeal),
      });
      expect(result).toEqual(savedMeal);
    });

    it('should update an existing meal when id is long (CUID format)', async () => {
      const existingMeal = {
        id: 'cuid12345678901234',
        date: '2024-01-01',
        type: 'lunch' as const,
        name: 'Salad',
        calories: 400,
        protein: 15,
        carbs: 30,
        fat: 10,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(existingMeal),
      });

      const result = await storage.saveMeal(existingMeal);

      expect(mockFetch).toHaveBeenCalledWith(`/api/meals/${existingMeal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(existingMeal),
      });
      expect(result).toEqual(existingMeal);
    });

    it('should throw error when create fails', async () => {
      const newMeal = {
        id: '',
        date: '2024-01-01',
        type: 'breakfast' as const,
        name: 'Test',
        calories: 100,
        protein: 5,
        carbs: 10,
        fat: 2,
      };
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(storage.saveMeal(newMeal)).rejects.toThrow('Failed to create meal');
    });

    it('should throw error when update fails', async () => {
      const existingMeal = {
        id: 'cuid12345678901234',
        date: '2024-01-01',
        type: 'lunch' as const,
        name: 'Test',
        calories: 100,
        protein: 5,
        carbs: 10,
        fat: 2,
      };
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(storage.saveMeal(existingMeal)).rejects.toThrow('Failed to update meal');
    });
  });

  describe('deleteMeal', () => {
    it('should delete a meal successfully', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await storage.deleteMeal('cuid12345678901234');

      expect(mockFetch).toHaveBeenCalledWith('/api/meals/cuid12345678901234', {
        method: 'DELETE',
      });
    });

    it('should throw error when delete fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(storage.deleteMeal('cuid12345678901234')).rejects.toThrow('Failed to delete meal');
    });
  });

  describe('getMealsByDate', () => {
    it('should fetch meals by date', async () => {
      const mockMeals = [{ id: '1', date: '2024-01-01', name: 'Breakfast' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMeals),
      });

      const result = await storage.getMealsByDate('2024-01-01');

      expect(mockFetch).toHaveBeenCalledWith('/api/meals?date=2024-01-01');
      expect(result).toEqual(mockMeals);
    });

    it('should throw error when fetch by date fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(storage.getMealsByDate('2024-01-01')).rejects.toThrow('Failed to fetch meals by date');
    });
  });

  describe('getExercises', () => {
    it('should fetch all exercises successfully', async () => {
      const mockExercises = [
        { id: '1', name: 'Running', caloriesBurned: 300 },
        { id: '2', name: 'Cycling', caloriesBurned: 400 },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExercises),
      });

      const result = await storage.getExercises();

      expect(mockFetch).toHaveBeenCalledWith('/api/exercises');
      expect(result).toEqual(mockExercises);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(storage.getExercises()).rejects.toThrow('Failed to fetch exercises');
    });
  });

  describe('saveExercise', () => {
    it('should create a new exercise when id is short', async () => {
      const newExercise = {
        id: '',
        date: '2024-01-01',
        name: 'Running',
        duration: 30,
        caloriesBurned: 300,
        type: 'cardio' as const,
      };
      const savedExercise = { ...newExercise, id: 'cuid12345678901234' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(savedExercise),
      });

      const result = await storage.saveExercise(newExercise);

      expect(mockFetch).toHaveBeenCalledWith('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExercise),
      });
      expect(result).toEqual(savedExercise);
    });

    it('should update an existing exercise when id is long', async () => {
      const existingExercise = {
        id: 'cuid12345678901234',
        date: '2024-01-01',
        name: 'Yoga',
        duration: 60,
        caloriesBurned: 200,
        type: 'flexibility' as const,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(existingExercise),
      });

      const result = await storage.saveExercise(existingExercise);

      expect(mockFetch).toHaveBeenCalledWith(`/api/exercises/${existingExercise.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(existingExercise),
      });
      expect(result).toEqual(existingExercise);
    });
  });

  describe('deleteExercise', () => {
    it('should delete an exercise successfully', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await storage.deleteExercise('cuid12345678901234');

      expect(mockFetch).toHaveBeenCalledWith('/api/exercises/cuid12345678901234', {
        method: 'DELETE',
      });
    });

    it('should throw error when delete fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(storage.deleteExercise('cuid12345678901234')).rejects.toThrow('Failed to delete exercise');
    });
  });

  describe('getExercisesByDate', () => {
    it('should fetch exercises by date', async () => {
      const mockExercises = [{ id: '1', date: '2024-01-01', name: 'Running' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExercises),
      });

      const result = await storage.getExercisesByDate('2024-01-01');

      expect(mockFetch).toHaveBeenCalledWith('/api/exercises?date=2024-01-01');
      expect(result).toEqual(mockExercises);
    });

    it('should throw error when fetch by date fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(storage.getExercisesByDate('2024-01-01')).rejects.toThrow('Failed to fetch exercises by date');
    });
  });

  describe('getDailyStats', () => {
    it('should fetch daily stats', async () => {
      const mockStats = {
        date: '2024-01-01',
        totalCaloriesConsumed: 2000,
        totalCaloriesBurned: 500,
        netCalories: 1500,
        totalProtein: 80,
        totalCarbs: 200,
        totalFat: 70,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });

      const result = await storage.getDailyStats('2024-01-01');

      expect(mockFetch).toHaveBeenCalledWith('/api/stats?date=2024-01-01');
      expect(result).toEqual(mockStats);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(storage.getDailyStats('2024-01-01')).rejects.toThrow('Failed to fetch daily stats');
    });
  });

  describe('getWeeklyStats', () => {
    it('should fetch weekly stats', async () => {
      const mockStats = [
        { date: '2024-01-01', totalCaloriesConsumed: 2000 },
        { date: '2024-01-02', totalCaloriesConsumed: 1800 },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });

      const result = await storage.getWeeklyStats('2024-01-07');

      expect(mockFetch).toHaveBeenCalledWith('/api/stats?endDate=2024-01-07');
      expect(result).toEqual(mockStats);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(storage.getWeeklyStats('2024-01-07')).rejects.toThrow('Failed to fetch weekly stats');
    });
  });
});
