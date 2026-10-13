import { AppError } from './domain';

export async function sendConfirmationEmail(
  email: string,
  token: string,
  send: typeof fetch = fetch,
  deliveryTest = false,
) {
  const apiToken = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const from = process.env.GHL_FROM_EMAIL;
  if (!apiToken || !locationId || !from || !process.env.APP_URL) {
    throw new AppError('Confirmation email is not configured yet. Please try again later.', 503);
  }
  const base = new URL(process.env.APP_URL);
  if (base.protocol !== 'https:')
    throw new AppError('Confirmation email is not configured yet.', 503);
  const link = new URL('/confirm-email', base);
  // Fragment is not sent to access logs or in the referrer header.
  link.hash = token;
  if (deliveryTest) {
    link.pathname = '/login';
    link.hash = '';
  }
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    Version: '2021-07-28',
    'Content-Type': 'application/json',
  };
  try {
    const contactResponse = await send('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers,
      body: JSON.stringify({ locationId, email }),
      signal: AbortSignal.timeout(12000),
    });
    if (!contactResponse.ok) throw new Error('Contact unavailable');
    const { contact } = await contactResponse.json();
    if (
      !contact?.id ||
      contact.email?.toLowerCase() !== email.toLowerCase() ||
      contact.locationId !== locationId
    )
      throw new Error('Recipient mismatch');
    const tags = await send(
      `https://services.leadconnectorhq.com/contacts/${encodeURIComponent(contact.id)}/tags`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ tags: ['afc'] }),
        signal: AbortSignal.timeout(12000),
      },
    );
    if (!tags.ok) throw new Error(`Tag request failed (${tags.status})`);
    const response = await send('https://services.leadconnectorhq.com/conversations/messages', {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        type: 'Email',
        status: 'pending',
        contactId: contact.id,
        emailFrom: from,
        emailTo: email,
        subject: deliveryTest
          ? 'AFC confirmation email — delivery test'
          : 'Confirm your AFC email address',
        message: deliveryTest
          ? `AFC email delivery test. No account is created or activated. Open AFC: ${link.href}`
          : `Confirm your AFC account: ${link.href}\nThis link expires in 24 hours. If you did not register, ignore this email.`,
        html: deliveryTest
          ? `<h1>AFC email is connected</h1><p>This is your requested confirmation-email delivery test. No account was created or activated.</p><p><a href="${link.href}">Open AFC</a></p>`
          : `<h1>Welcome to AFC</h1><p>Confirm your email to activate your account and receive your 100 welcome points.</p><p><a href="${link.href}" style="display:inline-block;padding:14px 24px;background:#ff9547;color:#111;text-decoration:none;border-radius:8px">Confirm email</a></p><p>This link expires in 24 hours. If you did not register, ignore this email.</p>`,
      }),
    });
    if (!response.ok) throw new Error('Email unavailable');
    const result = await response.json();
    if (!result.messageId && !result.emailMessageId) throw new Error('Email not accepted');
  } catch {
    // Never log provider bodies: they can contain recipient data or bearer links.
    throw new AppError(
      'We could not send your confirmation email. Please sign in and use Resend confirmation to retry.',
      503,
    );
  }
}
