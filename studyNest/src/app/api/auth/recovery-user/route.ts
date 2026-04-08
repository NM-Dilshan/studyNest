import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const studentId = String(body?.studentId || '').trim().toUpperCase();

    if (!studentId) {
      return NextResponse.json(
        { error: 'IT number is required' },
        { status: 400 }
      );
    }

    const user = await prisma.users.findFirst({
      where: {
        student_id: {
          equals: studentId,
          mode: 'insensitive',
        },
      },
      select: {
        student_id: true,
        email: true,
        is_active: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found for this IT number' },
        { status: 404 }
      );
    }

    if (user.is_active === false) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        studentId: user.student_id,
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Recovery user lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to look up account' },
      { status: 500 }
    );
  }
}
