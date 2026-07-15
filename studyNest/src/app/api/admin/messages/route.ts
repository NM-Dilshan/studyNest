import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const parseDateOrNull = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !value.trim()) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const now = new Date()

    await prisma.admin_broadcast_messages.updateMany({
      where: {
        is_active: true,
        expires_at: {
          lt: now,
        },
      },
      data: {
        is_active: false,
      },
    })

    const messages = await prisma.admin_broadcast_messages.findMany({
      where: includeInactive
        ? undefined
        : {
            is_active: true,
            scheduled_at: { lte: now },
            AND: [
              {
                OR: [{ expires_at: null }, { expires_at: { gte: now } }],
              },
            ],
          },
      orderBy: [{ scheduled_at: 'desc' }, { created_at: 'desc' }],
    })

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error) {
    console.error('Failed to fetch admin messages:', error)
    return NextResponse.json(
      {
        success: false,
        messages: [],
        error: error instanceof Error ? error.message : 'Failed to fetch admin messages',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const title = String(body?.title || '').trim()
    const message = String(body?.message || '').trim()
    const createdBy = String(body?.createdBy || '').trim() || null
    const scheduledAt = parseDateOrNull(body?.scheduledAt) || new Date()
    const expiresAt = parseDateOrNull(body?.expiresAt)
    const isActive = body?.isActive !== false

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      )
    }

    if (expiresAt && expiresAt <= scheduledAt) {
      return NextResponse.json(
        { success: false, error: 'Expire time must be after scheduled time' },
        { status: 400 }
      )
    }

    const created = await prisma.admin_broadcast_messages.create({
      data: {
        title,
        message,
        scheduled_at: scheduledAt,
        expires_at: expiresAt,
        is_active: isActive,
        created_by: createdBy,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin message created successfully',
      data: created,
    })
  } catch (error) {
    console.error('Failed to create admin message:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create admin message',
      },
      { status: 500 }
    )
  }
}
