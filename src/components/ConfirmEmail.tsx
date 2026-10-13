'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useArena } from './context';
export function ConfirmEmail() {
  const { act, busy } = useArena();
  const [token, setToken] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const captured = useRef(false);
  useEffect(() => {
    if (captured.current) return;
    captured.current = true;
    setToken(window.location.hash.slice(1));
    window.history.replaceState(window.history.state, '', window.location.pathname);
  }, []);
  return (
    <section className="empty">
      <h1>{confirmed ? 'Email confirmed!' : 'Confirm your email'}</h1>
      <p>
        {confirmed
          ? 'Your account is active and your 100 welcome points are ready. Sign in to continue.'
          : 'Activate your AFC account. If you did not register, do not confirm this request.'}
      </p>
      {!confirmed && (
        <button
          className="button primary"
          disabled={busy || !token}
          onClick={async () => {
            if (await act('confirmEmail', { token })) {
              setConfirmed(true);
              setToken('');
            }
          }}
        >
          Confirm email
        </button>
      )}
      {!token && !confirmed && (
        <p>Open the link from your confirmation email, or request a new one from sign-in.</p>
      )}
      <Link href="/login" className="button secondary">
        Go to sign in
      </Link>
    </section>
  );
}
