import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_saahsk2';
const TEMPLATE_ID = 'template_2xzrwdb';
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

export interface EmailSendResult {
  ok: boolean;
  error?: string;
}

function describeEmailJsError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || 'Unknown EmailJS error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const maybeStatus = Reflect.get(error, 'status');
    const maybeText = Reflect.get(error, 'text');
    const maybeMessage = Reflect.get(error, 'message');

    const parts: string[] = [];
    if (typeof maybeStatus === 'number' || typeof maybeStatus === 'string') {
      parts.push(`status=${String(maybeStatus)}`);
    }
    if (typeof maybeText === 'string' && maybeText.trim()) {
      parts.push(`text=${maybeText}`);
    }
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      parts.push(`message=${maybeMessage}`);
    }

    if (parts.length > 0) {
      return parts.join(', ');
    }

    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown EmailJS object error';
    }
  }

  return 'Unknown EmailJS error type';
}

export interface EmailTemplateParams extends Record<string, unknown> {
  to_email: string;
  it_number: string;
  message: string;
  email: string;
}

export function isEmailJsConfigured(): boolean {
  return Boolean(PUBLIC_KEY);
}

export async function sendEmail(params: EmailTemplateParams): Promise<EmailSendResult> {
  try {
    if (!PUBLIC_KEY) {
      const configError =
        'Missing NEXT_PUBLIC_EMAILJS_PUBLIC_KEY. Add it to .env.local and restart Next.js.';
      console.warn('EmailJS configuration warning:', configError);
      return { ok: false, error: configError };
    }

    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, {
      publicKey: PUBLIC_KEY,
    });

    console.log('EmailJS success:', result.status, result.text);
    return { ok: true };
  } catch (error) {
    const errorMessage = describeEmailJsError(error);
    console.error('EmailJS send failed:', errorMessage, error);

    // Extra hint for common EmailJS dashboard restrictions.
    if (errorMessage.toLowerCase().includes('forbidden') || errorMessage.includes('status=403')) {
      console.warn('EmailJS hint: check allowed origins/domains and template/service IDs in EmailJS dashboard.');
    }

    return {
      ok: false,
      error: errorMessage || 'Failed to send email',
    };
  }
}

export async function sendVerificationEmail(toEmail: string, itNumber: string): Promise<EmailSendResult> {
  return sendEmail({
    to_email: toEmail,
    it_number: itNumber,
    message:
      'Your StudyNest account has been created successfully. Please use this email as your verification confirmation.',
    email: toEmail,
  });
}

export async function sendSignUpVerificationCodeEmail(
  toEmail: string,
  itNumber: string,
  code: string
): Promise<EmailSendResult> {
  return sendEmail({
    to_email: toEmail,
    it_number: itNumber,
    message: `Your StudyNest sign up verification code is ${code}. This code expires in 10 minutes.`,
    email: toEmail,
  });
}

export async function sendPasswordRecoveryEmail(toEmail: string, itNumber: string): Promise<EmailSendResult> {
  return sendEmail({
    to_email: toEmail,
    it_number: itNumber,
    message:
      'Password recovery request received. If this was you, please reset your password immediately from the StudyNest sign-in flow.',
    email: toEmail,
  });
}

export async function sendPasswordRecoveryCodeEmail(
  toEmail: string,
  itNumber: string,
  code: string
): Promise<EmailSendResult> {
  return sendEmail({
    to_email: toEmail,
    it_number: itNumber,
    message: `Hello ${itNumber},\n\nYour StudyNest password recovery code is:\n\n${code}\n\nThis code expires in 10 minutes.\n\nRegards,\nStudyNest Team`,
    email: toEmail,
  });
}
