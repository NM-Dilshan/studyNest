import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AdminChatIntent, detectIntent } from '@/lib/admin-chat/intentDetection';
import { formatAdminChatReply } from '@/lib/admin-chat/responseFormatter';

interface ChatRequestBody {
  message?: string;
}

interface HallCountRow {
  hallId: string;
  hallName: string;
  count: number;
}

function formatList(rows: Array<{ label: string; count: number }>): string {
  if (rows.length === 0) {
    return '- No data available';
  }

  return rows.map((row) => `- ${row.label}: ${row.count}`).join('\n');
}

async function getHallWiseCounts(): Promise<HallCountRow[]> {
  const grouped = await prisma.complaints.groupBy({
    by: ['hall_id'],
    where: {
      hall_id: {
        not: null,
      },
    },
    _count: {
      complaint_id: true,
    },
    orderBy: {
      _count: {
        complaint_id: 'desc',
      },
    },
    take: 8,
  });

  const hallIds = grouped
    .map((row) => row.hall_id)
    .filter((hallId): hallId is string => Boolean(hallId));

  if (hallIds.length === 0) {
    return [];
  }

  const halls = await prisma.lecture_halls.findMany({
    where: {
      hall_id: {
        in: hallIds,
      },
    },
    select: {
      hall_id: true,
      hall_name: true,
    },
  });

  const hallMap = new Map(halls.map((hall) => [hall.hall_id, hall.hall_name]));

  return grouped.map((row) => ({
    hallId: row.hall_id ?? 'unknown',
    hallName: row.hall_id ? hallMap.get(row.hall_id) ?? 'Unknown Hall' : 'Unknown Hall',
    count: row._count.complaint_id,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const message = String(body.message || '').trim();

    if (!message) {
      return NextResponse.json({ reply: 'Please enter a question so I can help.' }, { status: 400 });
    }

    const { intent } = detectIntent(message);

    const [
      totalComplaints,
      pendingComplaints,
      viewedComplaints,
      inProgressComplaints,
      resolvedComplaints,
    ] = await Promise.all([
      prisma.complaints.count(),
      prisma.complaints.count({ where: { status: { equals: 'Pending', mode: 'insensitive' } } }),
      prisma.complaints.count({ where: { status: { equals: 'Viewed', mode: 'insensitive' } } }),
      prisma.complaints.count({ where: { status: { equals: 'In Progress', mode: 'insensitive' } } }),
      prisma.complaints.count({ where: { status: { equals: 'Resolved', mode: 'insensitive' } } }),
    ]);

    const statusGrouped = await prisma.complaints.groupBy({
      by: ['status'],
      _count: {
        complaint_id: true,
      },
      orderBy: {
        _count: {
          complaint_id: 'desc',
        },
      },
    });

    const issueGrouped = await prisma.complaints.groupBy({
      by: ['issue_category'],
      _count: {
        complaint_id: true,
      },
      orderBy: {
        _count: {
          complaint_id: 'desc',
        },
      },
      take: 1,
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [todayComplaints, todayPending, todayInProgress, todayResolved, hallWiseCounts] = await Promise.all([
      prisma.complaints.count({
        where: {
          created_at: {
            gte: todayStart,
            lt: tomorrowStart,
          },
        },
      }),
      prisma.complaints.count({
        where: {
          status: { equals: 'Pending', mode: 'insensitive' },
          created_at: {
            gte: todayStart,
            lt: tomorrowStart,
          },
        },
      }),
      prisma.complaints.count({
        where: {
          status: { equals: 'In Progress', mode: 'insensitive' },
          created_at: {
            gte: todayStart,
            lt: tomorrowStart,
          },
        },
      }),
      prisma.complaints.count({
        where: {
          status: { equals: 'Resolved', mode: 'insensitive' },
          created_at: {
            gte: todayStart,
            lt: tomorrowStart,
          },
        },
      }),
      getHallWiseCounts(),
    ]);

    const statusBreakdownText = formatList(
      statusGrouped.map((row) => ({
        label: row.status ?? 'Unknown',
        count: row._count.complaint_id,
      }))
    );

    const hallWiseText = formatList(
      hallWiseCounts.map((row) => ({
        label: row.hallName,
        count: row.count,
      }))
    );

    const mostComplainedHall = hallWiseCounts[0];
    const topIssueCategory = issueGrouped[0];
    const effectivePending = intent === AdminChatIntent.TODAY_SUMMARY ? todayPending : pendingComplaints;
    const effectiveInProgress =
      intent === AdminChatIntent.TODAY_SUMMARY ? todayInProgress : inProgressComplaints;
    const effectiveResolved = intent === AdminChatIntent.TODAY_SUMMARY ? todayResolved : resolvedComplaints;

    const reply = formatAdminChatReply({
      intent,
      totalComplaints,
      pendingComplaints: effectivePending,
      viewedComplaints,
      inProgressComplaints: effectiveInProgress,
      resolvedComplaints: effectiveResolved,
      todayComplaints,
      hallName: mostComplainedHall?.hallName,
      hallCount: mostComplainedHall?.count,
      issueCategory: topIssueCategory?.issue_category,
      issueCategoryCount: topIssueCategory?._count.complaint_id,
      statusBreakdownText,
      hallWiseText,
    });

    return NextResponse.json({ reply, intent });
  } catch (error) {
    console.error('Admin chat API error:', error);
    return NextResponse.json(
      {
        reply: 'I ran into an issue while reading complaint analytics. Please try again.',
      },
      { status: 500 }
    );
  }
}
