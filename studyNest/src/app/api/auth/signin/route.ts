import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function jsonError(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function jsonSuccess(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json({ success: true, ...payload }, { status });
}

async function parseBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    throw new Error('Request body must be valid JSON');
  }
}

/**
 * POST /api/auth/signin
 * Sign in a user with email or student ID and password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    let { email, studentId } = body;
    const { password } = body;

    // Validate required fields
    if ((!email && !studentId) || !password) {
      return jsonError('Email/Student ID and password are required', 400);
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
      return jsonError('Invalid email/ID or password', 401);
    }

    // Check if user is active
    if (!user.is_active) {
      return jsonError('Account is inactive', 403);
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return jsonError('Invalid email/ID or password', 401);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return jsonSuccess(
      {
        message: 'Sign in successful',
        user: userWithoutPassword,
      },
      200
    );
  } catch (error) {
    console.error('[POST /api/auth/signin] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to sign in. Please try again.';
    const status = message === 'Request body must be valid JSON' ? 400 : 500;
    return jsonError(message, status);
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
