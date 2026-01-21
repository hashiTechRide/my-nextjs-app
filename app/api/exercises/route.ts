import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (date) {
      const exercises = await prisma.exercise.findMany({
        where: { date },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json(exercises);
    }

    const exercises = await prisma.exercise.findMany({
      orderBy: { date: 'desc', createdAt: 'desc' },
    });
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('GET /api/exercises error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, name, duration, caloriesBurned, type } = body;

    const exercise = await prisma.exercise.create({
      data: {
        date,
        name,
        duration: Number(duration),
        caloriesBurned: Number(caloriesBurned),
        type,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('POST /api/exercises error:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}
