import { AdminChatIntent } from './intentDetection';

const numberFormatter = new Intl.NumberFormat('en-US');

export interface AdminChatPayload {
  intent: AdminChatIntent;
  totalComplaints?: number;
  pendingComplaints?: number;
  resolvedComplaints?: number;
  inProgressComplaints?: number;
  viewedComplaints?: number;
  todayComplaints?: number;
  hallName?: string;
  hallCount?: number;
  issueCategory?: string;
  issueCategoryCount?: number;
  statusBreakdownText?: string;
  hallWiseText?: string;
}

function formatCount(value: number | undefined): string {
  return numberFormatter.format(value ?? 0);
}

export function formatAdminChatReply(payload: AdminChatPayload): string {
  switch (payload.intent) {
    case AdminChatIntent.MOST_COMPLAINED_HALL:
      if (!payload.hallName || payload.hallCount === undefined) {
        return 'I could not identify a lecture hall with complaints yet.';
      }
      return `The most complained lecture hall is ${payload.hallName} with ${formatCount(payload.hallCount)} complaint(s).`;

    case AdminChatIntent.COMPLAINT_SUMMARY:
      return [
        'Here is your complaint summary:',
        `- Total: ${formatCount(payload.totalComplaints)}`,
        `- Pending: ${formatCount(payload.pendingComplaints)}`,
        `- Viewed: ${formatCount(payload.viewedComplaints)}`,
        `- In Progress: ${formatCount(payload.inProgressComplaints)}`,
        `- Resolved: ${formatCount(payload.resolvedComplaints)}`,
      ].join('\n');

    case AdminChatIntent.PENDING_COUNT:
      return `There are ${formatCount(payload.pendingComplaints)} pending complaint(s).`;

    case AdminChatIntent.RESOLVED_COUNT:
      return `There are ${formatCount(payload.resolvedComplaints)} resolved complaint(s).`;

    case AdminChatIntent.STATUS_BREAKDOWN:
      return payload.statusBreakdownText
        ? `Complaint count by status:\n${payload.statusBreakdownText}`
        : 'No status breakdown data is available yet.';

    case AdminChatIntent.TOP_ISSUE_CATEGORY:
      if (!payload.issueCategory || payload.issueCategoryCount === undefined) {
        return 'I could not find an issue category trend right now.';
      }
      return `The top issue category is ${payload.issueCategory} with ${formatCount(payload.issueCategoryCount)} complaint(s).`;

    case AdminChatIntent.TODAY_SUMMARY:
      return [
        'Today\'s complaint summary:',
        `- Complaints created today: ${formatCount(payload.todayComplaints)}`,
        `- Pending: ${formatCount(payload.pendingComplaints)}`,
        `- In Progress: ${formatCount(payload.inProgressComplaints)}`,
        `- Resolved: ${formatCount(payload.resolvedComplaints)}`,
      ].join('\n');

    case AdminChatIntent.HALL_WISE_COUNTS:
      return payload.hallWiseText
        ? `Hall-wise complaint counts:\n${payload.hallWiseText}`
        : 'No hall-wise complaint data is available yet.';

    default:
      return [
        'I can help with complaint analytics. Try asking:',
        '- Complaint summary',
        '- Most complained hall',
        '- Pending complaints',
        '- Today summary',
      ].join('\n');
  }
}
