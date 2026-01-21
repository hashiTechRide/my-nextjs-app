import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../../app/api/stats/route';

// Mock Prisma
vi.mock('../../app/lib/prisma', () => ({
  prisma: {
    meal: {
      findMany: vi.fn(),
    },
    exercise: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '../../app/lib/prisma';

describe('Stats API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/stats', () => {
    it('should return 400 when no date parameter provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Date parameter required');
    });

    it('should return daily stats for a specific date', async () => {
      const mockMeals = [
        { id: '1', calories: 500, protein: 20, carbs: 60, fat: 15 },
        { id: '2', calories: 700, protein: 30, carbs: 80, fat: 25 },
      ];
      const mockExercises = [
        { id: '1', caloriesBurned: 300 },
        { id: '2', caloriesBurned: 200 },
      ];

      vi.mocked(prisma.meal.findMany).mockResolvedValueOnce(mockMeals);
      vi.mocked(prisma.exercise.findMany).mockResolvedValueOnce(mockExercises);

      const request = new NextRequest('http://localhost:3000/api/stats?date=2024-01-01');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        date: '2024-01-01',
        totalCaloriesConsumed: 1200,
        totalCaloriesBurned: 500,
        netCalories: 700,
        totalProtein: 50,
        totalCarbs: 140,
        totalFat: 40,
      });
    });

    it('should return zero stats when no meals or exercises', async () => {
      vi.mocked(prisma.meal.findMany).mockResolvedValueOnce([]);
      vi.mocked(prisma.exercise.findMany).mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost:3000/api/stats?date=2024-01-01');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        date: '2024-01-01',
        totalCaloriesConsumed: 0,
        totalCaloriesBurned: 0,
        netCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      });
    });

    it('should return weekly stats when endDate provided', async () => {
      // Mock responses for 7 days
      for (let i = 0; i < 7; i++) {
        vi.mocked(prisma.meal.findMany).mockResolvedValueOnce([
          { id: `meal-${i}`, calories: 1000, protein: 40, carbs: 100, fat: 30 },
        ]);
        vi.mocked(prisma.exercise.findMany).mockResolvedValueOnce([
          { id: `exercise-${i}`, caloriesBurned: 200 },
        ]);
      }

      const request = new NextRequest('http://localhost:3000/api/stats?endDate=2024-01-07');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(7);
      expect(data[0]).toHaveProperty('date');
      expect(data[0]).toHaveProperty('totalCaloriesConsumed', 1000);
      expect(data[0]).toHaveProperty('totalCaloriesBurned', 200);
      expect(data[0]).toHaveProperty('netCalories', 800);
      expect(data[0]).toHaveProperty('totalProtein', 40);
      expect(data[0]).toHaveProperty('totalCarbs', 100);
      expect(data[0]).toHaveProperty('totalFat', 30);
    });

    it('should return 500 when database error occurs', async () => {
      vi.mocked(prisma.meal.findMany).mockRejectedValueOnce(new Error('DB Error'));

      const request = new NextRequest('http://localhost:3000/api/stats?date=2024-01-01');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch stats');
    });
  });
});
