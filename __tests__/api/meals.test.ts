import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/meals/route';

// Mock Prisma
vi.mock('../../app/lib/prisma', () => ({
  prisma: {
    meal: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from '../../app/lib/prisma';

describe('Meals API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/meals', () => {
    it('should return all meals when no date filter', async () => {
      const mockMeals = [
        {
          id: 'cuid123',
          date: '2024-01-01',
          type: 'breakfast',
          name: 'Oatmeal',
          calories: 300,
          protein: 10,
          carbs: 50,
          fat: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(prisma.meal.findMany).mockResolvedValueOnce(mockMeals);

      const request = new NextRequest('http://localhost:3000/api/meals');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe('cuid123');
      expect(data[0].name).toBe('Oatmeal');
      expect(data[0].calories).toBe(300);
      expect(prisma.meal.findMany).toHaveBeenCalledWith({
        orderBy: { date: 'desc', createdAt: 'desc' },
      });
    });

    it('should filter meals by date when date param provided', async () => {
      const mockMeals = [
        {
          id: 'cuid123',
          date: '2024-01-01',
          type: 'breakfast',
          name: 'Oatmeal',
          calories: 300,
          protein: 10,
          carbs: 50,
          fat: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(prisma.meal.findMany).mockResolvedValueOnce(mockMeals);

      const request = new NextRequest('http://localhost:3000/api/meals?date=2024-01-01');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].date).toBe('2024-01-01');
      expect(prisma.meal.findMany).toHaveBeenCalledWith({
        where: { date: '2024-01-01' },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should return 500 when database error occurs', async () => {
      vi.mocked(prisma.meal.findMany).mockRejectedValueOnce(new Error('DB Error'));

      const request = new NextRequest('http://localhost:3000/api/meals');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch meals');
    });
  });

  describe('POST /api/meals', () => {
    it('should create a new meal', async () => {
      const newMeal = {
        date: '2024-01-01',
        type: 'breakfast',
        name: 'Oatmeal',
        calories: 300,
        protein: 10,
        carbs: 50,
        fat: 5,
      };
      const createdMeal = {
        id: 'cuid123',
        ...newMeal,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(prisma.meal.create).mockResolvedValueOnce(createdMeal);

      const request = new NextRequest('http://localhost:3000/api/meals', {
        method: 'POST',
        body: JSON.stringify(newMeal),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('cuid123');
      expect(data.name).toBe('Oatmeal');
      expect(data.calories).toBe(300);
      expect(prisma.meal.create).toHaveBeenCalledWith({
        data: {
          date: '2024-01-01',
          type: 'breakfast',
          name: 'Oatmeal',
          calories: 300,
          protein: 10,
          carbs: 50,
          fat: 5,
        },
      });
    });

    it('should convert string numbers to numbers', async () => {
      const newMeal = {
        date: '2024-01-01',
        type: 'lunch',
        name: 'Salad',
        calories: '400',
        protein: '15',
        carbs: '30',
        fat: '10',
      };
      const createdMeal = {
        id: 'cuid456',
        date: '2024-01-01',
        type: 'lunch',
        name: 'Salad',
        calories: 400,
        protein: 15,
        carbs: 30,
        fat: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(prisma.meal.create).mockResolvedValueOnce(createdMeal);

      const request = new NextRequest('http://localhost:3000/api/meals', {
        method: 'POST',
        body: JSON.stringify(newMeal),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(prisma.meal.create).toHaveBeenCalledWith({
        data: {
          date: '2024-01-01',
          type: 'lunch',
          name: 'Salad',
          calories: 400,
          protein: 15,
          carbs: 30,
          fat: 10,
        },
      });
    });

    it('should return 500 when create fails', async () => {
      vi.mocked(prisma.meal.create).mockRejectedValueOnce(new Error('DB Error'));

      const request = new NextRequest('http://localhost:3000/api/meals', {
        method: 'POST',
        body: JSON.stringify({
          date: '2024-01-01',
          type: 'breakfast',
          name: 'Test',
          calories: 100,
          protein: 5,
          carbs: 10,
          fat: 2,
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create meal');
    });
  });
});
