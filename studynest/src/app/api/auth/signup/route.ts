import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/signup
 * Sign up uses Supabase Auth - this endpoint is for reference only
 */
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        message: 'Use Supabase Auth directly for sign up',
        info: 'This project uses Supabase authentication',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
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
