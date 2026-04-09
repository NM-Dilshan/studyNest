import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/notifications/[id]/read
 * Mark a notification as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    const notification = await prisma.notifications.update({
      where: { notification_id: id },
      data: { is_read: true },
    })

    return NextResponse.json({
      success: true,
      data: notification,
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await prisma.notifications.delete({
      where: { notification_id: id },
    })

    return NextResponse.json({
      success: true,
      message: 'Notification deleted',
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
