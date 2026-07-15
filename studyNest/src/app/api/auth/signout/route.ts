import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/signout
 * Sign out user and redirect to login page
 */
export async function POST(request: NextRequest) {
  try {
    // Create response object
    const response = NextResponse.json(
      { message: 'Signed out successfully' },
      { status: 200 }
    );

    // Clear any auth cookies if using cookies for session
    response.cookies.delete('auth_token');
    response.cookies.delete('session');

    // Redirect to login page
    return NextResponse.redirect(new URL('/login/signIN', request.url));
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { error: 'Signout failed' },
      { status: 500 }
    );
  }
}
