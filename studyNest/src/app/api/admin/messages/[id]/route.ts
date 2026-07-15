import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const parseDateOrNull = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !value.trim()) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const parseId = async (params: Promise<{ id: string }>) => {
  const resolved = await params
  const id = Number.parseInt(resolved.id, 10)
  return Number.isNaN(id) ? null : id
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await parseId(params)

    if (!id) {
      return NextResponse.json({ success: false, error: 'Invalid message ID' }, { status: 400 })
    }

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

    const existing = await prisma.admin_broadcast_messages.findUnique({
      where: { message_id: id },
      select: { message_id: true },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 })
    }

    const updated = await prisma.admin_broadcast_messages.update({
      where: { message_id: id },
      data: {
        title,
        message,
        scheduled_at: scheduledAt,
        expires_at: expiresAt,
        is_active: isActive,
        created_by: createdBy,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin message updated successfully',
      data: updated,
    })
  } catch (error) {
    console.error('Failed to update admin message:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update admin message',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await parseId(params)

    if (!id) {
      return NextResponse.json({ success: false, error: 'Invalid message ID' }, { status: 400 })
    }

    const existing = await prisma.admin_broadcast_messages.findUnique({
      where: { message_id: id },
      select: { message_id: true },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 })
    }

    await prisma.admin_broadcast_messages.delete({
      where: { message_id: id },
    })

    return NextResponse.json({ success: true, message: 'Admin message deleted successfully' })
  } catch (error) {
    console.error('Failed to delete admin message:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete admin message',
      },
      { status: 500 }
    )
  }
}
