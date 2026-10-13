'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Coins,
  Gift,
  ImagePlus,
  Info,
  LoaderCircle,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  Upload,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useArena } from './context';
import { AuthGate, Avatar, Countdown, date, Empty, Heading, openContest } from './ui';
export function Login() {
  const { state, act, busy } = useArena();
  const router = useRouter();
  const [register, setRegister] = useState(false);
  return (
    <div className="auth-layout">
      <section
        className="auth-art"
        style={{
          backgroundImage:
            'linear-gradient(0deg,rgba(10,15,15,.88),transparent),url(/art/forest.png)',
        }}
      >
        <span className="eyebrow">WELCOME TO YOUR CREATIVE SPACE</span>
        <h1>
          A little imagination.
          <br />
          Endless possibility.
        </h1>
        <p>
          Show your process. Find your people.
          <br />
          Make something that matters.
        </p>
      </section>
      <section className="auth-form">
        <span className="eyebrow">ARENA FOR CREATIVES</span>
        <h1>{register ? 'Your story starts here.' : 'Welcome back.'}</h1>
        <p>
          {register
            ? 'Join the arena and get 100 points to support creators.'
            : 'A world of extraordinary creations is waiting.'}
        </p>
        <form
          className="stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            if (
              await act(
                register ? 'register' : 'login',
                Object.fromEntries(f),
                'Welcome to the arena!',
              )
            )
              router.push('/');
          }}
        >
          {register && (
            <label>
              Display name
              <input name="name" required minLength={2} maxLength={60} autoComplete="name" />
            </label>
          )}
          <label>
            Email
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              required
              minLength={8}
              maxLength={128}
              autoComplete={register ? 'new-password' : 'current-password'}
            />
          </label>
          <button disabled={busy} className="button primary full">
            {register ? 'Create account' : 'Sign in'}
            <ArrowRight size={17} />
          </button>
        </form>
        <p className="center">
          {register ? 'Already have an account?' : 'New around here?'}{' '}
          <button className="text-link" onClick={() => setRegister(!register)}>
            {register ? 'Sign in' : 'Join the arena'}
          </button>
        </p>
        {state.demo && (
          <div className="demo-access">
            <span className="eyebrow">LOCAL PREVIEW</span>
            <p>Take a look around with a demo account.</p>
            <button
              className="button secondary full"
              disabled={busy}
              onClick={async () => {
                if (await act('demoLogin', { role: 'USER' })) router.push('/');
              }}
            >
              Explore as a member
              <ArrowRight size={16} />
            </button>
            <button
              className="button ghost full"
              disabled={busy}
              onClick={async () => {
                if (await act('demoLogin', { role: 'ADMIN' })) router.push('/admin');
              }}
            >
              <ShieldCheck size={17} />
              Open admin studio
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
export function Wallet() {
  const { state, act, busy } = useArena();
  const [tab, setTab] = useState('Transactions');
  const [chosen, setChosen] = useState<number | null>(null);
  const [key, setKey] = useState('');
  if (!state.me) return <AuthGate />;
  return (
    <>
      <Heading
        eyebrow="A LITTLE SUPPORT GOES A LONG WAY"
        title="Your points"
        description="Support the work that moves you. Every vote is a small vote of confidence."
      />
      <div className="wallet-hero">
        <div className="wallet-balance">
          <span className="coin-circle">
            <Coins size={34} />
          </span>
          <div>
            <span className="muted">Your available balance</span>
            <h2>
              {state.me.balance}
              <span>points</span>
            </h2>
            <p>1 point = 1 vote. Once per entry.</p>
          </div>
        </div>
        <div className="wallet-note">
          <HeartNote />
          <p>
            Great art goes further
            <br />
            with your support.
          </p>
        </div>
      </div>
      <div className="section-title">
        <div>
          <h2>A little more creative fuel</h2>
          <p>Choose a points package to keep discovering.</p>
        </div>
        <span className="tag">{state.demo ? 'Demo checkout' : 'Coming online soon'}</span>
      </div>
      <div className="package-grid">
        {[50, 100, 200, 500].map((n, i) => (
          <button
            disabled={!state.demo}
            key={n}
            className={`package ${chosen === n ? 'selected' : ''}`}
            onClick={() => {
              setChosen(n);
              setKey(crypto.randomUUID());
            }}
          >
            {i === 1 && <span className="package-badge">A LITTLE EXTRA</span>}
            <Coins size={27} />
            <strong>{n}</strong>
            <span>points</span>
            <span className="package-action">
              Select package
              <ArrowRight size={15} />
            </span>
          </button>
        ))}
      </div>
      {chosen && (
        <div className="notice row between">
          <span>
            Add <strong>{chosen} demo points</strong>? No money will be charged.
          </span>
          <div className="row">
            <button
              disabled={busy}
              className="button primary"
              onClick={async () => {
                if (
                  await act(
                    'topup',
                    { amount: chosen, key },
                    `${chosen} demo points added to your wallet`,
                  )
                )
                  setChosen(null);
              }}
            >
              Confirm demo top-up
            </button>
            <button className="button ghost" onClick={() => setChosen(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <p className="micro row">
        <Info size={15} />
        {state.demo
          ? 'Local demo only. No payment details are collected and no money is charged.'
          : 'Payment provider and pricing will be available when AFC goes online.'}
      </p>
      <section className="panel ledger">
        <div className="tabs">
          {['Transactions', 'My votes'].map((t) => (
            <button className={tab === t ? 'active' : ''} key={t} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        {tab === 'Transactions' ? (
          state.ledger.map((l) => (
            <div className="ledger-row" key={l.id}>
              <span className={`ledger-icon ${l.amount > 0 ? 'credit' : ''}`}>
                {l.amount > 0 ? <Gift size={20} /> : <ArrowDownLeft size={20} />}
              </span>
              <div>
                <strong>{l.description}</strong>
                <small>{date(l.createdAt)}</small>
              </div>
              <strong className={l.amount > 0 ? 'green' : 'muted'}>
                {l.amount > 0 ? '+' : ''}
                {l.amount}
              </strong>
            </div>
          ))
        ) : state.ledger.filter((l) => l.entryId).length ? (
          state.ledger
            .filter((l) => l.entryId)
            .map((l) => (
              <Link key={l.id} className="ledger-row" href={`/entries/${l.entryId}`}>
                <CheckCircle2 size={22} />
                <div>
                  <strong>{l.description.replace('Vote: ', '')}</strong>
                  <small>Supported on {date(l.createdAt)}</small>
                </div>
                <span className="muted">
                  1 point
                  <ArrowRight size={15} />
                </span>
              </Link>
            ))
        ) : (
          <Empty
            title="Your first vote is waiting"
            description="Find a creation you love and give it a little support."
            href="/"
          />
        )}
      </section>
    </>
  );
}
function HeartNote() {
  return <span className="small-spark">✦</span>;
}
export function Notifications() {
  const { state, act } = useArena();
  if (!state.me) return <AuthGate />;
  return (
    <>
      <Heading
        eyebrow="STAY IN THE LOOP"
        title="Your arena updates"
        description="A little news from your corner of the creative world."
        action={
          <button
            className="button secondary"
            onClick={() => act('readNotifications', {}, 'All caught up!')}
          >
            <Check size={16} />
            Mark all read
          </button>
        }
      />
      <section className="panel notification-list">
        {state.notifications.length ? (
          state.notifications.map((n) => (
            <Link href={n.href} key={n.id} className={`notification ${n.read ? '' : 'unread'}`}>
              <span className="notification-icon">
                <Bell size={21} />
              </span>
              <div>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <small>{date(n.createdAt)}</small>
              </div>
              <ArrowRight size={18} />
            </Link>
          ))
        ) : (
          <Empty
            title="All quiet for now"
            description="Contest announcements, moderation updates, and comments will appear here."
          />
        )}
      </section>
      <Link href="/settings" className="text-link spaced">
        Manage notification preferences
        <ArrowRight size={16} />
      </Link>
    </>
  );
}
export function SettingsPage() {
  const { state, act, busy, toast } = useArena();
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [avatar, setAvatar] = useState<string | undefined>();
  useEffect(() => setTheme(localStorage.getItem('afc-theme') || 'dark'), []);
  if (!state.me) return <AuthGate />;
  const me = state.me;
  return (
    <>
      <Heading
        eyebrow="MAKE YOURSELF AT HOME"
        title="Settings"
        description="Your profile, your preferences, your creative space."
      />
      <div className="settings-layout">
        <form
          className="panel stack"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            act(
              'profile',
              {
                name: f.get('name'),
                bio: f.get('bio'),
                featuredEntryId: f.get('featuredEntryId'),
                notifyActivity: f.get('activity') === 'on',
                notifyContests: f.get('contests') === 'on',
                ...(avatar ? { avatar } : {}),
              },
              'Your profile is updated',
            );
          }}
        >
          <h2>Your profile</h2>
          <div className="row">
            <Avatar person={{ name: me.name, avatar: avatar || me.avatar }} size="large" />
            <label className="button secondary upload-label">
              Change avatar
              <input
                hidden
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const form = new FormData();
                  form.set('file', file);
                  try {
                    const r = await fetch('/api/upload', { method: 'POST', body: form });
                    const d = await r.json();
                    if (!r.ok) throw new Error(d.error);
                    setAvatar(d.url);
                  } catch (e) {
                    toast(e instanceof Error ? e.message : 'Upload failed');
                  }
                }}
              />
            </label>
          </div>
          <label>
            Display name
            <input name="name" defaultValue={me.name} required minLength={2} maxLength={60} />
          </label>
          <label>
            Short bio
            <textarea name="bio" maxLength={300} defaultValue={me.bio} rows={3} />
          </label>
          <label>
            Featured entry
            <select
              name="featuredEntryId"
              defaultValue={state.people.find((p) => p.id === me.id)?.featuredEntryId || ''}
            >
              <option value="">No featured entry</option>
              {state.entries
                .filter((e) => e.authorId === me.id && e.status === 'APPROVED')
                .map((e) => (
                  <option value={e.id} key={e.id}>
                    {e.title}
                  </option>
                ))}
            </select>
          </label>
          <hr />
          <h2>Notifications</h2>
          <label className="check-label">
            <input type="checkbox" name="activity" defaultChecked={me.notifyActivity} />
            Comments and activity on my work
          </label>
          <label className="check-label">
            <input type="checkbox" name="contests" defaultChecked={me.notifyContests} />
            New contest announcements
          </label>
          <p className="micro">
            Submission decisions and result notices are always delivered in the app.
          </p>
          <button className="button primary" disabled={busy}>
            Save changes
            <Check size={17} />
          </button>
        </form>
        <div className="stack">
          <section className="panel">
            <h2>Appearance</h2>
            <p className="muted">Set the mood for your gallery.</p>
            <div className="theme-options">
              {['dark', 'light'].map((t) => (
                <button
                  className={`button secondary ${theme === t ? 'selected' : ''}`}
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    localStorage.setItem('afc-theme', t);
                    document.documentElement.dataset.theme = t;
                  }}
                >
                  {t === 'dark' ? <Moon size={18} /> : <Sun size={18} />}{' '}
                  {t === 'dark' ? 'Dark' : 'Light'}
                </button>
              ))}
            </div>
          </section>
          <section className="panel">
            <h2>Account</h2>
            <p className="muted">{me.email}</p>
            {me.role === 'ADMIN' && (
              <Link className="button secondary full spaced" href="/admin">
                <ShieldCheck size={17} />
                Admin studio
              </Link>
            )}
            <button
              className="button ghost"
              onClick={async () => {
                await act('logout');
                router.push('/');
              }}
            >
              <LogOut size={17} />
              Sign out
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
export function Submit() {
  const { state, act, busy, toast } = useArena();
  const router = useRouter();
  const [contestId, setContestId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stages, setStages] = useState<string[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [uploading, setUploading] = useState(-1);
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('contest');
    setContestId(requested || state.contests.find((c) => openContest(c))?.id || '');
  }, []);
  useEffect(() => {
    const draft = state.entries.find(
      (e) => e.authorId === state.me?.id && e.contestId === contestId,
    );
    setTitle(draft?.title || '');
    setDescription(draft?.description || '');
    setStages(
      draft?.stages.reduce<string[]>((a, s) => {
        a[s.position] = s.url;
        return a;
      }, []) || [],
    );
    setAccepted(false);
    setPreview(false);
  }, [contestId, state.me?.id]);
  if (!state.me) return <AuthGate />;
  const contest = state.contests.find((c) => c.id === contestId);
  const existing = state.entries.find(
    (e) => e.contestId === contestId && e.authorId === state.me!.id,
  );
  const locked = existing && !['DRAFT', 'CHANGES'].includes(existing.status);
  const labels =
    contest?.type === 'COSPLAY'
      ? ['The costume', 'Cosplayer in costume']
      : ['Rough sketch', 'Clean line art', 'Final artwork'];
  const complete = labels.every((_, i) => stages[i]);
  const save = async (submit: boolean) => {
    const result = await act(
      'saveEntry',
      {
        contestId,
        title,
        description,
        stages: labels.map((_, i) => stages[i] || ''),
        submit,
        rulesAccepted: accepted,
      },
      submit
        ? 'Entry submitted! Your process is ready for review.'
        : 'Draft saved. Come back whenever inspiration strikes.',
    );
    if (result && submit) router.push(`/entries/${result.id}`);
  };
  return (
    <>
      <Heading
        eyebrow="FROM YOUR IMAGINATION TO THE ARENA"
        title="Share your creation"
        description="Every great creation has a story. Let everyone see yours."
      />
      <div className="submission-layout">
        <div className="stack">
          <section className="panel stack">
            <label>
              Choose your arena
              <select value={contestId} onChange={(e) => setContestId(e.target.value)}>
                {state.contests
                  .filter((c) => openContest(c))
                  .map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.title} · {c.type === 'ART' ? 'Art' : 'Cosplay'}
                    </option>
                  ))}
              </select>
            </label>
            {contest && (
              <div className="row between">
                <Link className="text-link" href={`/contests/${contest.id}`}>
                  Read contest rules
                  <ArrowRight size={15} />
                </Link>
                <Countdown contest={contest} />
              </div>
            )}
          </section>
          {!contest ? (
            <Empty
              title="No open arenas yet"
              description="Come back when the next contest opens."
            />
          ) : locked ? (
            <section className="panel">
              <CheckCircle2 className="orange" size={35} />
              <h2>
                {existing.status === 'PENDING'
                  ? 'Your creation is in review'
                  : existing.status === 'APPROVED'
                    ? 'Your creation is live'
                    : 'Entry unavailable'}
              </h2>
              <p className="muted">
                {existing.moderationNote ||
                  'Your submission is locked so the work viewers see stays consistent.'}
              </p>
              <Link className="button primary" href={`/entries/${existing.id}`}>
                View your entry
                <ArrowRight size={17} />
              </Link>
            </section>
          ) : (
            <>
              <section className="panel stack">
                {existing?.status === 'CHANGES' && (
                  <div className="notice">Changes requested: {existing.moderationNote}</div>
                )}
                <label>
                  Entry title
                  <input
                    placeholder="Give your creation a name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </label>
                <label>
                  The story behind it
                  <textarea
                    placeholder="Your inspiration, your materials, your world…"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                  />
                </label>
              </section>
              <section className="panel">
                <div className="section-title small">
                  <div>
                    <h2>
                      {contest.type === 'ART'
                        ? 'Show your creative process'
                        : 'From costume to character'}
                    </h2>
                    <p>All {labels.length} stages will be visible to everyone.</p>
                  </div>
                </div>
                <div className={`upload-grid ${labels.length === 2 ? 'two' : ''}`}>
                  {labels.map((label, i) => (
                    <div className="upload-stage" key={`${contestId}-${i}`}>
                      <h3>
                        <b>{i + 1}</b>
                        {label}
                      </h3>
                      <label
                        className={`dropzone ${stages[i] ? 'has-image' : ''} ${i > 0 && !stages[i - 1] ? 'disabled' : ''}`}
                      >
                        {stages[i] ? (
                          <img src={stages[i]} alt={label} />
                        ) : (
                          <>
                            <ImagePlus size={30} />
                            <strong>
                              {i > 0 && !stages[i - 1]
                                ? 'Complete the previous stage'
                                : 'Choose an image'}
                            </strong>
                            <small>JPG, PNG or WebP · up to 3 MB</small>
                          </>
                        )}
                        <span className="upload-action">
                          {uploading === i ? (
                            <LoaderCircle className="spin" size={16} />
                          ) : (
                            <Upload size={16} />
                          )}{' '}
                          {uploading === i
                            ? 'Uploading…'
                            : stages[i]
                              ? 'Change image'
                              : 'Upload image'}
                        </span>
                        <input
                          hidden
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={uploading !== -1 || (i > 0 && !stages[i - 1])}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploading(i);
                            try {
                              const form = new FormData();
                              form.set('file', file);
                              const r = await fetch('/api/upload', { method: 'POST', body: form });
                              const result = await r.json();
                              if (!r.ok) throw new Error(result.error);
                              setStages((prev) => {
                                const next = [...prev];
                                next[i] = result.url;
                                return next;
                              });
                            } catch (error) {
                              toast(error instanceof Error ? error.message : 'Upload failed');
                            } finally {
                              setUploading(-1);
                            }
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </section>
              {preview && (
                <section className="panel">
                  <span className="eyebrow">PUBLIC ENTRY PREVIEW</span>
                  <h2>{title || 'Untitled creation'}</h2>
                  <p>{description}</p>
                  <div className="preview-stages">
                    {labels.map((label, i) => (
                      <div key={label}>
                        <strong>
                          {i + 1}. {label}
                        </strong>
                        {stages[i] && <img src={stages[i]} alt={label} />}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
        <aside className="stack">
          <section className="panel submission-checklist">
            <span className="eyebrow">READY WHEN YOU ARE</span>
            <h2>Your entry checklist</h2>
            <div className={title.trim() ? 'checked' : ''}>
              <CheckCircle2 size={18} />
              Give your entry a title
            </div>
            <div className={complete ? 'checked' : ''}>
              <CheckCircle2 size={18} />
              Upload all {labels.length} stages
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              I accept the contest rules and confirm this is my original work.
            </label>
            <hr />
            <button
              className="button primary full"
              disabled={
                busy ||
                uploading !== -1 ||
                !complete ||
                !accepted ||
                !title.trim() ||
                !!locked ||
                !contest
              }
              onClick={() => save(true)}
            >
              Submit entry
              <ArrowRight size={17} />
            </button>
            <div className="row">
              <button
                className="button secondary"
                disabled={busy || uploading !== -1 || !title.trim() || !!locked}
                onClick={() => save(false)}
              >
                Save draft
              </button>
              <button
                className="button secondary"
                disabled={!!locked}
                onClick={() => setPreview(!preview)}
              >
                {preview ? 'Hide preview' : 'Preview'}
              </button>
            </div>
            <p className="micro">
              Drafts are private. Once approved, everyone can view every stage of your submission.
            </p>
          </section>
          <section className="panel subtle">
            <Info size={21} />
            <h3>A process worth sharing</h3>
            <p>
              Show the work behind the work. Your process stays alongside your final creation, so
              the community can appreciate the full story.
            </p>
            <p className="micro">
              Submissions and voting happen together. Earlier entries have more time to be
              discovered.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
