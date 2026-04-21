import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/notifications/[id]/read
 * Mark a single notification as read
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = Number.parseInt(params.id, 10)

		if (!Number.isFinite(id)) {
			return NextResponse.json(
				{ success: false, error: 'Invalid notification id' },
				{ status: 400 }
			)
		}

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
