import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * POST /api/admin/signin
 * Sign in an admin with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let email = body.email
    const { password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Normalize email to lowercase
    email = email.toLowerCase()

    // Find admin user by email
    const admin = await prisma.users.findUnique({
      where: { email },
      select: {
        user_id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    })

    // Check if user exists and has admin or volunteer role
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password', success: false },
        { status: 401 }
      )
    }

    // Check if user has admin or volunteer role
    if (admin.role !== 'admin' && admin.role !== 'volunteer') {
      return NextResponse.json(
        { error: 'You must be an admin to access this panel', success: false },
        { status: 403 }
      )
    }

    // Check if admin is active
    if (!admin.is_active) {
      return NextResponse.json(
        { error: 'Your account is inactive. Please contact support', success: false },
        { status: 403 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password', success: false },
        { status: 401 }
      )
    }

    // Return admin data (without sensitive fields)
    return NextResponse.json(
      {
        success: true,
        admin: {
          admin_id: admin.user_id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          is_active: admin.is_active,
          created_at: admin.created_at,
        },
        message: 'Admin login successful',
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Admin signin error:', err)
    return NextResponse.json(
      { error: 'An error occurred during sign in', success: false },
      { status: 500 }
    )
  }
}
