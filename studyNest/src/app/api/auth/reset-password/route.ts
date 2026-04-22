import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const isValidPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, studentId, newPassword, confirmPassword } = body;

    if (!studentId || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'IT number and password fields are required' },
        { status: 400 }
      );
    }

    const normalizedStudentId = String(studentId).trim().toUpperCase();
    const normalizedEmail = email ? String(email).trim().toLowerCase() : undefined;

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (!isValidPassword(newPassword)) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 8 characters with uppercase, lowercase, and number',
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.users.findFirst({
      where: {
        student_id: {
          equals: normalizedStudentId,
          mode: 'insensitive',
        },
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
      },
      select: {
        user_id: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'No matching user found for provided IT number' },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { user_id: existingUser.user_id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { success: true, message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
