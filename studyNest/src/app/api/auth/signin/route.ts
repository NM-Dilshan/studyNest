import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/signin
 * Sign in a user with email or student ID and password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { email, studentId, password } = body;

    // Validate required fields
    if ((!email && !studentId) || !password) {
      return NextResponse.json(
        { error: 'Email/Student ID and password are required' },
        { status: 400 }
      );
    }

    // Normalize inputs (convert to uppercase for case-insensitive matching)
    if (email) {
      email = email.toLowerCase();
    }
    if (studentId) {
      studentId = studentId.toUpperCase();
    }

    // Find user by email or student ID (case-insensitive for student ID)
    let user;
    if (email) {
      user = await prisma.users.findUnique({
        where: { email },
        select: {
          user_id: true,
          student_id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      });
    } else {
      // For student ID, use findFirst with case-insensitive search
      user = await prisma.users.findFirst({
        where: {
          student_id: {
            equals: studentId,
            mode: 'insensitive',
          },
        },
        select: {
          user_id: true,
          student_id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email/ID or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email/ID or password' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'Sign in successful',
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sign in error:', error);

    return NextResponse.json(
      { error: 'Failed to sign in. Please try again.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * OPTIONS /api/auth/signin
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
