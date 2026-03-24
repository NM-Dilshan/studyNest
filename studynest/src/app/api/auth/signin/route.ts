import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/signin
 * Sign in uses Supabase Auth - this endpoint is for reference only
 */
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        message: 'Use Supabase Auth directly for sign in',
        info: 'This project uses Supabase authentication',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in. Please try again.' },
      { status: 500 }
    );
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
