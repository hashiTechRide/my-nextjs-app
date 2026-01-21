import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { format, parseISO } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const endDate = searchParams.get('endDate');

    if (endDate) {
      // Weekly stats
      const stats = [];
      const end = parseISO(endDate);

      for (let i = 6; i >= 0; i--) {
        const currentDate = new Date(end);
        currentDate.setDate(currentDate.getDate() - i);
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        const [meals, exercises] = await Promise.all([
          prisma.meal.findMany({ where: { date: dateStr } }),
          prisma.exercise.findMany({ where: { date: dateStr } }),
        ]);

        const totalCaloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);
        const totalCaloriesBurned = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
        const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
        const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
        const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

        stats.push({
          date: dateStr,
          totalCaloriesConsumed,
          totalCaloriesBurned,
          netCalories: totalCaloriesConsumed - totalCaloriesBurned,
          totalProtein,
          totalCarbs,
          totalFat,
        });
      }

      return NextResponse.json(stats);
    }

    if (date) {
      // Daily stats
      const [meals, exercises] = await Promise.all([
        prisma.meal.findMany({ where: { date } }),
        prisma.exercise.findMany({ where: { date } }),
      ]);

      const totalCaloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);
      const totalCaloriesBurned = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
      const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
      const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
      const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

      const stats = {
        date,
        totalCaloriesConsumed,
        totalCaloriesBurned,
        netCalories: totalCaloriesConsumed - totalCaloriesBurned,
        totalProtein,
        totalCarbs,
        totalFat,
      };

      return NextResponse.json(stats);
    }

    return NextResponse.json(
      { error: 'Date parameter required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
