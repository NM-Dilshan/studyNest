import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidStudentId = (studentId: string): boolean => {
  return studentId.length > 0 && studentId.length <= 20;
};

const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
};

/**
 * POST /api/auth/signup
 * Sign up a new user with form data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, fullName, email, mobileNumber, password, confirmPassword, role = 'student' } = body;

    // Validate required fields
    if (!fullName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['student', 'volunteer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Validate student/volunteer ID (required for both)
    if (!studentId) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    if (!isValidStudentId(studentId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 8 characters with uppercase, lowercase, and number',
        },
        { status: 400 }
      );
    }

    // Check password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Check if student ID already exists (for both students and volunteers)
    const existingStudentId = await prisma.users.findUnique({
      where: { student_id: studentId },
    });

    if (existingStudentId) {
      return NextResponse.json(
        { error: 'This ID is already registered' },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.users.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.users.create({
      data: {
        student_id: studentId,
        name: fullName,
        email,
        mobile: mobileNumber || null,
        password: hashedPassword,
        role: role,
        is_active: true,
      },
      select: {
        user_id: true,
        student_id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign up error:', error);

    // Handle Prisma validation errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          { error: 'Email or student ID already in use' },
          { status: 409 }
        );
      }
      // Log the actual error for debugging
      console.error('Actual error message:', error.message);
      console.error('Error details:', error);
    }

    return NextResponse.json(
      { 
        error: 'Failed to create account. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/auth/signup
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
