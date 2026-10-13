import { sendConfirmationEmail } from '../src/lib/confirmation-email';
const recipient = process.argv[2];
if (!recipient || !recipient.includes('@'))
  throw new Error('Supply an explicitly authorized test recipient.');
sendConfirmationEmail(recipient, '', fetch, true)
  .then(() => {
    console.log(
      'GHL accepted the requested test email. Check the recipient inbox to confirm delivery.',
    );
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
