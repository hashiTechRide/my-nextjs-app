import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (date) {
      const meals = await prisma.meal.findMany({
        where: { date },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json(meals);
    }

    const meals = await prisma.meal.findMany({
      orderBy: { date: 'desc', createdAt: 'desc' },
    });
    return NextResponse.json(meals);
  } catch (error) {
    console.error('GET /api/meals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, type, name, calories, protein, carbs, fat } = body;

    const meal = await prisma.meal.create({
      data: {
        date,
        type,
        name,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
      },
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    console.error('POST /api/meals error:', error);
    return NextResponse.json(
      { error: 'Failed to create meal' },
      { status: 500 }
    );
  }
}
