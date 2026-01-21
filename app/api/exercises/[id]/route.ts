import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { date, name, duration, caloriesBurned, type } = body;

    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        date,
        name,
        duration: Number(duration),
        caloriesBurned: Number(caloriesBurned),
        type,
      },
    });

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('PUT /api/exercises/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update exercise' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.exercise.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/exercises/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
}
