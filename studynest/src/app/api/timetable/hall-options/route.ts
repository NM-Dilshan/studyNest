import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const halls = await prisma.lecture_halls.findMany({
			where: { is_active: true },
			orderBy: { hall_name: 'asc' },
			select: {
				hall_id: true,
				hall_name: true,
				building: true,
			},
		});

		return NextResponse.json({
			success: true,
			data: halls.map((hall) => ({
				id: hall.hall_id,
				name: hall.hall_name,
				building: hall.building ?? null,
			})),
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Failed to fetch hall options';
		return NextResponse.json({ success: false, error: message }, { status: 500 });
	}
}
