import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '1', 10)
    const limit = Number.isNaN(requestedLimit) ? 1 : Math.min(Math.max(requestedLimit, 1), 20)
    const now = new Date()

    const messages = await prisma.admin_broadcast_messages.findMany({
      where: {
        is_active: true,
        scheduled_at: { lte: now },
        OR: [{ expires_at: null }, { expires_at: { gt: now } }],
      },
      orderBy: [{ scheduled_at: 'desc' }, { created_at: 'desc' }],
      take: limit,
    })

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error) {
    console.error('Failed to fetch active admin messages:', error)
    return NextResponse.json(
      {
        success: false,
        messages: [],
        error: error instanceof Error ? error.message : 'Failed to fetch active admin messages',
      },
      { status: 500 }
    )
  }
}
