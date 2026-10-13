'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  Check,
  ChevronRight,
  ClipboardCheck,
  Flag,
  Plus,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react';
import { useArena } from './context';
import { AuthGate, date, Empty, Heading, money } from './ui';
import type { Contest } from '@/lib/types';
export function Admin() {
  const { state, act, busy } = useArena();
  const [tab, setTab] = useState('Submissions');
  const [edit, setEdit] = useState<Contest | 'new' | null>(null);
  const [resultId, setResultId] = useState('');
  const [order, setOrder] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  if (!state.me) return <AuthGate />;
  if (state.me.role !== 'ADMIN')
    return (
      <Empty
        title="The admin studio"
        description="This space is reserved for arena administrators."
        href="/"
      />
    );
  const pending = state.entries.filter((e) => e.status === 'PENDING');
  const reports = state.reports.filter((r) => !r.resolved);
  const resultContest = state.contests.find((c) => c.id === resultId);
  const ranked = state.entries
    .filter((e) => e.contestId === resultId && e.status === 'APPROVED')
    .sort((a, b) => b.voteCount - a.voteCount);
  return (
    <>
      <Heading
        eyebrow="BEHIND THE ARENA"
        title="Admin studio"
        description="Keep the contests inspiring, the process open, and the community welcoming."
        action={
          <button
            className="button primary"
            onClick={() => {
              setEdit('new');
              setTab('Contests');
            }}
          >
            <Plus size={17} />
            Create contest
          </button>
        }
      />
      <div className="stat-grid">
        {[
          [Trophy, state.contests.filter((c) => c.status === 'ACTIVE').length, 'Active contests'],
          [ClipboardCheck, pending.length, 'Awaiting review'],
          [Flag, reports.length, 'Open reports'],
          [Users, state.people.length, 'Creators'],
        ].map(([Icon, value, label], i) => {
          const I = Icon as typeof Trophy;
          return (
            <div className="stat-card" key={i}>
              <I size={23} />
              <strong>{String(value)}</strong>
              <span>{String(label)}</span>
            </div>
          );
        })}
      </div>
      <div className="tabs spaced">
        {['Submissions', 'Contests', 'Reports', 'Members', 'Audit log'].map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
            {t === 'Submissions' && pending.length > 0 && (
              <span className="badge">{pending.length}</span>
            )}
          </button>
        ))}
      </div>
      {tab === 'Submissions' && (
        <>
          {pending.length === 0 && (
            <div className="notice">
              <CheckCircle2Icon />
              All caught up. New submitted entries will appear here.
            </div>
          )}
          <div className="admin-entries">
            {state.entries
              .filter((e) => ['PENDING', 'APPROVED'].includes(e.status))
              .sort((a, b) => Number(b.status === 'PENDING') - Number(a.status === 'PENDING'))
              .map((e) => (
                <section className="panel" key={e.id}>
                  <div className="row between">
                    <div>
                      <span className="eyebrow">{e.status}</span>
                      <h2>{e.title}</h2>
                      <p className="muted">
                        {state.people.find((p) => p.id === e.authorId)?.name} ·{' '}
                        {state.contests.find((c) => c.id === e.contestId)?.title}
                      </p>
                    </div>
                    <Link className="button secondary small" href={`/entries/${e.id}`}>
                      Inspect entry
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                  <div className="admin-stages">
                    {e.stages.map((s) => (
                      <a href={s.url} target="_blank" rel="noreferrer" key={s.id}>
                        <img src={s.url} alt={s.label} />
                        <span>
                          {s.position + 1}. {s.label}
                        </span>
                      </a>
                    ))}
                  </div>
                  <div className="row">
                    {e.status === 'PENDING' && (
                      <>
                        <button
                          disabled={busy}
                          className="button primary small"
                          onClick={() =>
                            act(
                              'moderate',
                              { id: e.id, status: 'APPROVED' },
                              'Entry approved and all stages published',
                            )
                          }
                        >
                          <Check size={16} />
                          Approve
                        </button>
                        <button
                          disabled={busy}
                          className="button secondary small"
                          onClick={() => {
                            const note = prompt('What should the creator change?');
                            if (note)
                              act(
                                'moderate',
                                { id: e.id, status: 'CHANGES', note },
                                'Changes requested',
                              );
                          }}
                        >
                          Request changes
                        </button>
                      </>
                    )}
                    <button
                      disabled={busy}
                      className="button ghost small danger"
                      onClick={() => {
                        const note = prompt(
                          'Reason for disqualification (recorded in the audit log)',
                        );
                        if (note)
                          act(
                            'moderate',
                            { id: e.id, status: 'DISQUALIFIED', note },
                            'Entry disqualified',
                          );
                      }}
                    >
                      Disqualify
                    </button>
                  </div>
                </section>
              ))}
          </div>
        </>
      )}
      {tab === 'Contests' && (
        <>
          {edit && (
            <section className="panel spaced">
              <Heading title={edit === 'new' ? 'Create an arena' : 'Edit draft contest'} />
              <form
                className="form-grid"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  if (
                    await act(
                      'saveContest',
                      {
                        ...(edit !== 'new' ? { id: edit.id } : {}),
                        title: f.get('title'),
                        description: f.get('description'),
                        type: f.get('type'),
                        prize: Math.round(Number(f.get('prize')) * 100),
                        customPrizes: f.get('customPrizes'),
                        rules: f.get('rules'),
                        startsAt: new Date(String(f.get('startsAt'))).toISOString(),
                        endsAt: new Date(String(f.get('endsAt'))).toISOString(),
                      },
                      'Contest draft saved',
                    )
                  )
                    setEdit(null);
                }}
                key={edit === 'new' ? 'new' : edit.id}
              >
                <label>
                  Contest title
                  <input
                    name="title"
                    required
                    minLength={3}
                    defaultValue={edit === 'new' ? '' : edit.title}
                  />
                </label>
                <label>
                  Type
                  <select name="type" defaultValue={edit === 'new' ? 'ART' : edit.type}>
                    <option value="ART">Art</option>
                    <option value="COSPLAY">Cosplay</option>
                  </select>
                </label>
                <label className="span-two">
                  Creative brief
                  <textarea
                    name="description"
                    required
                    minLength={5}
                    defaultValue={edit === 'new' ? '' : edit.description}
                  />
                </label>
                <label>
                  Start (your local time)
                  <input
                    name="startsAt"
                    type="datetime-local"
                    required
                    defaultValue={edit === 'new' ? '' : toLocal(edit.startsAt)}
                  />
                </label>
                <label>
                  Shared submission & voting deadline
                  <input
                    name="endsAt"
                    type="datetime-local"
                    required
                    defaultValue={edit === 'new' ? '' : toLocal(edit.endsAt)}
                  />
                </label>
                <label>
                  Cash prize pool (PHP)
                  <input
                    type="number"
                    name="prize"
                    min={0}
                    step="0.01"
                    defaultValue={edit === 'new' ? 10000 : edit.prize / 100}
                  />
                </label>
                <label>
                  Custom prizes (one line per place)
                  <textarea
                    name="customPrizes"
                    defaultValue={edit === 'new' ? '' : edit.customPrizes}
                    placeholder="1st prize\n2nd prize\n3rd prize"
                  />
                </label>
                <label className="span-two">
                  Rules and eligibility
                  <textarea
                    name="rules"
                    required
                    minLength={10}
                    rows={5}
                    defaultValue={
                      edit === 'new'
                        ? 'Original work only. All process stages are public. One entry per account. One permanent vote per account per entry. No self-voting. Top three win 50%, 30%, and 20%. Admin resolves ties with an explanation.'
                        : edit.rules
                    }
                  />
                </label>
                <div className="row">
                  <button disabled={busy} className="button primary">
                    Save draft
                  </button>
                  <button type="button" className="button secondary" onClick={() => setEdit(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}
          <div className="panel admin-contests">
            {state.contests.map((c) => (
              <div key={c.id} className="admin-contest">
                <img src={c.banner} alt="" />
                <div>
                  <span className="eyebrow">{c.status}</span>
                  <h3>{c.title}</h3>
                  <small>
                    {money(c.prize)} · Ends {date(c.endsAt)}
                  </small>
                </div>
                <div className="row wrap">
                  {c.status === 'DRAFT' && (
                    <>
                      <button className="button secondary small" onClick={() => setEdit(c)}>
                        Edit
                      </button>
                      <button
                        disabled={busy}
                        className="button primary small"
                        onClick={() =>
                          act('contestStatus', { id: c.id, status: 'ACTIVE' }, 'Contest published')
                        }
                      >
                        Publish contest
                      </button>
                    </>
                  )}
                  {c.status === 'ACTIVE' && (
                    <button
                      disabled={busy}
                      className="button secondary small"
                      onClick={() => {
                        if (confirm('Close this contest now? Voting and submissions will stop.'))
                          act('contestStatus', { id: c.id, status: 'CLOSED' }, 'Contest closed');
                      }}
                    >
                      Close contest
                    </button>
                  )}
                  {c.status === 'CLOSED' && (
                    <button
                      className="button primary small"
                      onClick={() => {
                        setResultId(c.id);
                        setOrder(
                          state.entries
                            .filter((e) => e.contestId === c.id && e.status === 'APPROVED')
                            .sort((a, b) => b.voteCount - a.voteCount)
                            .slice(0, 3)
                            .map((e) => e.id),
                        );
                      }}
                    >
                      Publish results
                    </button>
                  )}
                  <Link className="button ghost small" href={`/contests/${c.id}`}>
                    View
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {resultContest && (
            <section className="panel spaced">
              <h2>Results · {resultContest.title}</h2>
              <p className="muted">
                Vote order is enforced by the server. You may reorder tied positions only.
              </p>
              <div className="form-grid">
                {[0, 1, 2].map((i) => (
                  <label key={i}>
                    {i + 1}
                    {['st', 'nd', 'rd'][i]} place · {[50, 30, 20][i]}%
                    <select
                      value={order[i] || ''}
                      onChange={(e) =>
                        setOrder((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
                      }
                    >
                      <option value="">Choose an entry</option>
                      {ranked.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title} · {e.voteCount} votes
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <label>
                Tie resolution (if needed)
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
              </label>
              <div className="row spaced">
                <button
                  disabled={busy}
                  className="button primary"
                  onClick={async () => {
                    if (
                      await act(
                        'publishResults',
                        { id: resultId, order, reason },
                        'Winners announced!',
                      )
                    )
                      setResultId('');
                  }}
                >
                  Confirm and announce
                </button>
                <button className="button secondary" onClick={() => setResultId('')}>
                  Cancel
                </button>
              </div>
            </section>
          )}
        </>
      )}
      {tab === 'Reports' && (
        <div className="stack">
          {!reports.length && (
            <Empty
              title="No open reports"
              description="Content reports from the community will appear here."
            />
          )}
          {reports.map((r) => (
            <section className="panel" key={r.id}>
              <span className="eyebrow">{r.kind} REPORT</span>
              <p>{r.reason}</p>
              <small className="muted">Content ID: {r.targetId}</small>
              <div className="row spaced">
                {r.kind === 'ENTRY' ? (
                  <Link className="button secondary small" href={`/entries/${r.targetId}`}>
                    View entry
                  </Link>
                ) : (
                  <button
                    className="button secondary small"
                    onClick={() => act('hideComment', { id: r.targetId }, 'Comment hidden')}
                  >
                    Hide comment
                  </button>
                )}
                <button
                  className="button primary small"
                  onClick={() => act('resolveReport', { id: r.id }, 'Report resolved')}
                >
                  Mark resolved
                </button>
              </div>
            </section>
          ))}
        </div>
      )}
      {tab === 'Members' && (
        <div className="panel">
          {state.people.map((p) => (
            <div className="member-row" key={p.id}>
              <div>
                <strong>{p.name}</strong>
                <small>
                  {p.role} · {p.suspended ? 'Suspended' : 'Active'}
                </small>
              </div>
              <Link className="text-link" href={`/profile/${p.id}`}>
                Profile
              </Link>
              {p.role !== 'ADMIN' && (
                <button
                  className="button secondary small"
                  onClick={() => act('suspend', { id: p.id }, 'Account access updated')}
                >
                  {p.suspended ? 'Restore access' : 'Suspend'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {tab === 'Audit log' && (
        <div className="panel">
          {state.audits.length ? (
            state.audits.map((a) => (
              <div className="audit-row" key={a.id}>
                <ShieldCheck size={18} />
                <div>
                  <strong>{a.action}</strong>
                  <p>{a.detail || a.targetId}</p>
                  <small>{date(a.createdAt)}</small>
                </div>
              </div>
            ))
          ) : (
            <Empty
              title="A clean slate"
              description="Contest, moderation, and result actions will be recorded here."
            />
          )}
        </div>
      )}
    </>
  );
}
function CheckCircle2Icon() {
  return <Check size={18} />;
}
function toLocal(value: string) {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
