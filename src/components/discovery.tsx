'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  Flag,
  Heart,
  Share2,
  Sparkles,
  Trophy,
  Users,
  X,
  ZoomIn,
} from 'lucide-react';
import { useArena } from './context';
import {
  Avatar,
  AuthGate,
  Countdown,
  date,
  Empty,
  EntryCard,
  Heading,
  money,
  openContest,
  Prizes,
  SaveButton,
  VoteButton,
} from './ui';
import type { Contest, Entry } from '@/lib/types';
function Hero({ contest }: { contest: Contest }) {
  return (
    <section
      className="hero"
      style={{
        backgroundImage: `linear-gradient(90deg,rgba(15,17,19,.96) 0%,rgba(15,17,19,.76) 36%,rgba(15,17,19,.06) 76%),url(${contest.banner})`,
      }}
    >
      <div className="hero-content">
        <div className="hero-kicker">
          <span className="live-dot" /> THE ARENA IS OPEN <span>•</span>{' '}
          {contest.type === 'ART' ? 'ART CONTEST' : 'COSPLAY CONTEST'}
        </div>
        <h2>{contest.title}</h2>
        <p>{contest.description.split('. ')[0]}.</p>
        <div className="hero-meta">
          <span>
            <Trophy size={18} />
            <strong>{money(contest.prize)}</strong> prize pool
          </span>
          <Countdown contest={contest} />
        </div>
        <Link href={`/contests/${contest.id}`} className="button primary">
          Explore the contest
          <ArrowRight size={17} />
        </Link>
      </div>
      <span className="hero-index">
        01 <span>/ 03</span>
      </span>
    </section>
  );
}
export function Explore({ search }: { search: string }) {
  const { state } = useArena();
  const [filter, setFilter] = useState('ALL');
  const [sort, setSort] = useState('discover');
  const [discoverySeed] = useState(() => Math.floor(Math.random() * 100000));
  const discoveryRank = (id: string) => {
    let hash = discoverySeed;
    for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    return hash;
  };
  const featured = state.contests.find((c) => openContest(c));
  const entries = state.entries
    .filter((e) => e.status === 'APPROVED')
    .filter((e) => {
      const c = state.contests.find((c) => c.id === e.contestId);
      const p = state.people.find((p) => p.id === e.authorId);
      return (
        (filter === 'ALL' || c?.type === filter) &&
        `${e.title} ${p?.name} ${c?.title}`.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) =>
      sort === 'votes'
        ? b.voteCount - a.voteCount
        : sort === 'new'
          ? +new Date(b.createdAt) - +new Date(a.createdAt)
          : discoveryRank(a.id) - discoveryRank(b.id),
    );
  return (
    <>
      <Heading
        eyebrow="A SPACE FOR YOUR IMAGINATION"
        title="Discover the extraordinary."
        description="Original worlds. Incredible creators. Your next favorite is here."
        action={
          <Link href="/submit" className="button secondary desktop-only">
            Share your creativity
            <ArrowUpRight size={17} />
          </Link>
        }
      />
      {featured && !search && <Hero contest={featured} />}
      <div className="section-title">
        <div>
          <h2>{search ? `Results for “${search}”` : 'Made to be discovered'}</h2>
          <p>A little imagination goes a long way.</p>
        </div>
        <Link className="text-link" href="/contests">
          All contests
          <ArrowRight size={16} />
        </Link>
      </div>
      <div className="filterbar">
        <div className="pills">
          {[
            ['ALL', 'All creations'],
            ['ART', 'Art'],
            ['COSPLAY', 'Cosplay'],
          ].map(([v, l]) => (
            <button
              className={filter === v ? 'pill active' : 'pill'}
              key={v}
              onClick={() => setFilter(v)}
            >
              {v === 'ALL' && <Sparkles size={15} />} {l}
            </button>
          ))}
        </div>
        <select aria-label="Sort entries" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="discover">For discovery</option>
          <option value="new">Newest entries</option>
          <option value="votes">Most voted</option>
        </select>
      </div>
      {entries.length ? (
        <div className="entry-grid">
          {entries.map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </div>
      ) : (
        <Empty
          title="A little quiet here"
          description="Try another filter or search to discover more creations."
        />
      )}
      <div className="bottom-callout">
        <div>
          <span className="eyebrow">YOUR IMAGINATION BELONGS HERE</span>
          <h2>Ready to step into the arena?</h2>
          <p>Show your process. Share your creation. Find your people.</p>
        </div>
        <Link href="/submit" className="button secondary">
          Find your next challenge
          <ArrowRight size={17} />
        </Link>
      </div>
    </>
  );
}
export function Contests({ search }: { search: string }) {
  const { state } = useArena();
  const [filter, setFilter] = useState('ALL');
  const list = state.contests.filter(
    (c) =>
      c.status !== 'DRAFT' &&
      (filter === 'ALL' || c.type === filter) &&
      c.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow="FIND YOUR NEXT CHALLENGE"
        title="The arenas"
        description="A prompt, a little courage, and something only you can create."
      />
      <div className="pills spaced">
        {['ALL', 'ART', 'COSPLAY'].map((f) => (
          <button
            className={`pill ${filter === f ? 'active' : ''}`}
            key={f}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All contests' : f === 'ART' ? 'Art' : 'Cosplay'}
          </button>
        ))}
      </div>
      <div className="contest-grid">
        {list.map((c) => (
          <article className="contest-card" key={c.id}>
            <Link href={`/contests/${c.id}`}>
              <img src={c.banner} alt={c.title} />
            </Link>
            <div className="contest-card-body">
              <div className="row between">
                <span className="eyebrow">{c.type} CONTEST</span>
                <SaveButton id={c.id} kind="CONTEST" />
              </div>
              <h2>
                <Link href={`/contests/${c.id}`}>{c.title}</Link>
              </h2>
              <p>{c.description}</p>
              <div className="row between">
                <strong className="orange">{c.prize ? money(c.prize) : 'Custom prizes'}</strong>
                <Countdown contest={c} />
              </div>
              <Link className="button secondary full" href={`/contests/${c.id}`}>
                {c.status === 'ANNOUNCED' ? 'See the winners' : 'Enter the arena'}
                <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!list.length && <Empty title="No contests found" description="Try a different filter." />}
    </>
  );
}
export function ContestDetail({ id }: { id: string }) {
  const { state } = useArena();
  const [tab, setTab] = useState('Entries');
  const c = state.contests.find((c) => c.id === id);
  if (!c)
    return (
      <Empty
        title="Contest not found"
        description="This arena may not be published yet."
        href="/contests"
      />
    );
  const entries = state.entries
    .filter((e) => e.contestId === id && e.status === 'APPROVED')
    .sort((a, b) => b.voteCount - a.voteCount);
  return (
    <>
      <Link href="/contests" className="back">
        <ChevronLeft size={16} />
        All contests
      </Link>
      <div
        className="contest-hero"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(12,15,17,.94),rgba(12,15,17,.25)),url(${c.banner})`,
        }}
      >
        <span className="eyebrow">{c.type} CONTEST</span>
        <h1>{c.title}</h1>
        <p>{c.description}</p>
        <div className="row">
          <span className="status-tag">
            <span className="live-dot" />
            {openContest(c)
              ? 'Active'
              : c.status === 'ACTIVE'
                ? 'Upcoming'
                : c.status === 'ANNOUNCED'
                  ? 'Winners announced'
                  : 'Closed'}
          </span>
          <Countdown contest={c} />
        </div>
        <small>Submit and vote until {date(c.endsAt)} · your local time</small>
        <div className="hero-save">
          <SaveButton id={id} kind="CONTEST" />
        </div>
      </div>
      <Prizes contest={c} />
      <div className="row between contest-toolbar">
        <div className="tabs">
          {['Entries', 'Rules', 'Leaderboard', ...(c.winners.length ? ['Results'] : [])].map(
            (t) => (
              <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
                {t}
              </button>
            ),
          )}
        </div>
        {openContest(c) && (
          <Link className="button primary" href={`/submit?contest=${id}`}>
            Submit entry
            <ArrowUpRight size={16} />
          </Link>
        )}
      </div>
      {tab === 'Rules' ? (
        <section className="panel prose">
          <h2>The creative brief</h2>
          <p>{c.description}</p>
          <h3>Contest rules</h3>
          {c.rules.split('\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <h3>Public process gallery</h3>
          <p>
            {c.type === 'ART'
              ? 'Rough sketch → Clean line art → Final artwork'
              : 'The costume → Cosplayer in costume'}
            . Every viewer can open and inspect each stage.
          </p>
        </section>
      ) : tab === 'Leaderboard' ? (
        <div className="panel leaderboard">
          {entries.map((e, i) => (
            <Link href={`/entries/${e.id}`} key={e.id} className="leader-row">
              <strong className="rank">{String(i + 1).padStart(2, '0')}</strong>
              <img src={e.stages.at(-1)?.url} alt="" />
              <div>
                <h3>{e.title}</h3>
                <span>{state.people.find((p) => p.id === e.authorId)?.name}</span>
              </div>
              <strong>
                <Heart size={16} />
                {e.voteCount} votes
              </strong>
            </Link>
          ))}
        </div>
      ) : tab === 'Results' ? (
        <>
          <Heading
            title="Meet the winners"
            description="Chosen by the community. Every supporter counts."
          />
          {c.resultsNote && <p className="notice">{c.resultsNote}</p>}
          <div className="winner-grid">
            {c.winners.map((w) => {
              const e = entries.find((e) => e.id === w.entryId);
              return e ? (
                <div className="winner-card" key={w.place}>
                  <Trophy size={32} />
                  <h2>
                    #{w.place} ·{' '}
                    {c.prize ? money(w.amount) : c.customPrizes.split('\n')[w.place - 1]}
                  </h2>
                  <EntryCard entry={e} />
                  <p>{w.voteCount} community votes</p>
                </div>
              ) : null;
            })}
          </div>
        </>
      ) : entries.length ? (
        <div className="entry-grid">
          {entries.map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </div>
      ) : (
        <Empty
          title="Be the first to create"
          description="This arena is waiting for its first approved entry."
        />
      )}
    </>
  );
}
export function EntryDetail({ id }: { id: string }) {
  const { state, act, toast, busy } = useArena();
  const entry = state.entries.find((e) => e.id === id);
  const [stage, setStage] = useState(-1);
  const [body, setBody] = useState('');
  const [report, setReport] = useState(false);
  const [reason, setReason] = useState('');
  const [lightbox, setLightbox] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    setStage(-1);
  }, [id]);
  useEffect(() => {
    if (lightbox) dialog.current?.showModal();
    else dialog.current?.close();
  }, [lightbox]);
  if (!entry)
    return (
      <Empty
        title="Entry unavailable"
        description="It may still be a private draft or awaiting review."
        href="/"
      />
    );
  const c = state.contests.find((c) => c.id === entry.contestId)!;
  const person = state.people.find((p) => p.id === entry.authorId);
  const selected = entry.stages[stage < 0 ? entry.stages.length - 1 : stage];
  const following = state.follows.some(
    (f) => f.followerId === state.me?.id && f.followingId === entry.authorId,
  );
  return (
    <>
      <Link href={`/contests/${c.id}`} className="back">
        <ChevronLeft size={16} />
        {c.title}
        <span>/</span>
        {entry.title}
      </Link>
      {entry.status !== 'APPROVED' && (
        <div className="notice">
          Private preview · {entry.status.toLowerCase()} · {entry.moderationNote}
        </div>
      )}
      <div className="entry-layout">
        <section className="art-column">
          <button
            className="art-view"
            onClick={() => setLightbox(true)}
            aria-label="View full size image"
          >
            <img
              src={selected?.url || '/art/forest.png'}
              alt={`${entry.title} — ${selected?.label}`}
            />
            <span>
              <ZoomIn size={17} />
              View full size
            </span>
          </button>
          <div className="section-title small">
            <h2>The creative process</h2>
            <span className="muted">Every stage, open to everyone</span>
          </div>
          <div className={`stage-gallery ${entry.stages.length === 2 ? 'two' : ''}`}>
            {entry.stages.map((s, i) => (
              <button
                key={s.id}
                className={`stage-thumb ${selected?.id === s.id ? 'active' : ''}`}
                onClick={() => setStage(i)}
              >
                <img src={s.url} alt={`${i + 1}. ${s.label}`} />
                <span>
                  <b>{i + 1}</b>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
          <div className="process-note">
            <CheckCircle2 size={17} />
            {c.type === 'ART'
              ? 'From the first sketch to the final brushstroke.'
              : 'From the costume to the character.'}{' '}
            All {entry.stages.length} stages are publicly visible.
          </div>
        </section>
        <aside className="entry-info">
          <section className="panel">
            <Link href={`/contests/${c.id}`} className="eyebrow">
              {c.title}
            </Link>
            <h1>{entry.title}</h1>
            <div className="row between">
              <Link className="creator" href={`/profile/${entry.authorId}`}>
                <Avatar person={person} />
                <strong>{person?.name}</strong>
              </Link>
              {state.me?.id !== entry.authorId && (
                <button
                  className="button small secondary"
                  onClick={() =>
                    act(
                      'follow',
                      { id: entry.authorId },
                      following ? 'Unfollowed' : 'Following creator',
                    )
                  }
                >
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            <p className="entry-description">{entry.description}</p>
            <div className="entry-tags">
              <span>{c.type === 'ART' ? 'Digital art' : 'Cosplay'}</span>
              <span>Public process</span>
            </div>
            <div className="vote-block">
              <div className="row between">
                <strong className="vote-total">
                  {entry.voteCount}
                  <small>votes</small>
                </strong>
                <div className="row">
                  <SaveButton id={id} />
                  <button
                    className="icon-button"
                    aria-label="Copy share link"
                    onClick={() =>
                      navigator.clipboard
                        .writeText(window.location.href)
                        .then(() => toast('Entry link copied'))
                        .catch(() => toast('Copy the address from your browser to share.'))
                    }
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
              <VoteButton entry={entry} />
              <p className="micro center">One vote per entry. A little support means a lot.</p>
              <Link href="/wallet" className="wallet-line">
                <span>Your wallet</span>
                <strong>
                  {state.me?.balance ?? 'Sign in for 100'} points
                  <ArrowRight size={14} />
                </strong>
              </Link>
            </div>
            <Countdown contest={c} />
            <button className="report-link" onClick={() => setReport(!report)}>
              <Flag size={13} />
              Report entry
            </button>
            {report && (
              <form
                className="stack"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (
                    await act(
                      'report',
                      { id, kind: 'ENTRY', reason },
                      'Report received. Our team will review it.',
                    )
                  ) {
                    setReport(false);
                    setReason('');
                  }
                }}
              >
                <label>
                  Reason
                  <textarea
                    required
                    minLength={5}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
                <button disabled={busy} className="button secondary">
                  Send report
                </button>
              </form>
            )}
          </section>
          <section className="panel comments">
            <h2>
              Comments <span>{entry.comments.filter((c) => !c.hidden).length}</span>
            </h2>
            {state.me ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (await act('comment', { id, body }, 'Comment added')) setBody('');
                }}
              >
                <textarea
                  aria-label="Write a comment"
                  placeholder="Leave a little encouragement…"
                  maxLength={1000}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <button className="button secondary small" disabled={busy || !body.trim()}>
                  Post comment
                </button>
              </form>
            ) : (
              <Link className="text-link" href="/login">
                Sign in to join the conversation
                <ArrowRight size={15} />
              </Link>
            )}
            {entry.comments
              .filter((c) => !c.hidden)
              .map((comment) => (
                <div key={comment.id} className="comment">
                  <Avatar person={comment.user} />
                  <div>
                    <strong>{comment.user.name}</strong>
                    <p>{comment.body}</p>
                    <button
                      className="report-link"
                      onClick={() => {
                        const reason = window.prompt('Why are you reporting this comment?');
                        if (reason)
                          act(
                            'report',
                            { id: comment.id, kind: 'COMMENT', reason },
                            'Comment reported',
                          );
                      }}
                    >
                      Report
                    </button>
                  </div>
                </div>
              ))}
          </section>
        </aside>
      </div>
      <dialog
        ref={dialog}
        className="lightbox"
        onCancel={() => setLightbox(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setLightbox(false);
        }}
      >
        <button
          autoFocus
          className="icon-button"
          aria-label="Close full size image"
          onClick={() => setLightbox(false)}
        >
          <X />
        </button>
        <img src={selected?.url} alt={`${entry.title} — ${selected?.label}`} />
        <p>{selected?.label}</p>
      </dialog>
    </>
  );
}
export function Saved() {
  const { state } = useArena();
  const [tab, setTab] = useState('ENTRY');
  if (!state.me) return <AuthGate />;
  const ids = state.bookmarks.filter((b) => b.kind === tab).map((b) => b.targetId);
  return (
    <>
      <Heading
        eyebrow="YOUR PERSONAL COLLECTION"
        title="Worth coming back to"
        description="The creations and contests that caught your eye. Saving is always free."
      />
      <div className="tabs spaced">
        {[
          ['ENTRY', 'Saved entries'],
          ['CONTEST', 'Saved contests'],
        ].map(([v, l]) => (
          <button key={v} className={tab === v ? 'active' : ''} onClick={() => setTab(v)}>
            {l}
          </button>
        ))}
      </div>
      {!ids.length ? (
        <Empty
          title="Save a little inspiration"
          description="Tap the bookmark on any entry or contest. You will find it here."
          href="/"
        />
      ) : tab === 'ENTRY' ? (
        <div className="entry-grid">
          {state.entries
            .filter((e) => ids.includes(e.id) && e.status === 'APPROVED')
            .map((e) => (
              <EntryCard key={e.id} entry={e} />
            ))}
        </div>
      ) : (
        <div className="contest-grid">
          {state.contests
            .filter((c) => ids.includes(c.id))
            .map((c) => (
              <div key={c.id} className="contest-card">
                <img src={c.banner} alt="" />
                <div className="contest-card-body">
                  <h2>{c.title}</h2>
                  <Countdown contest={c} />
                  <Link className="button secondary full" href={`/contests/${c.id}`}>
                    View contest
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
        </div>
      )}
    </>
  );
}
export function Profile({ id }: { id: string }) {
  const { state, act } = useArena();
  if (id === 'me' && !state.me) return <AuthGate />;
  const person = state.people.find((p) => p.id === (id === 'me' ? state.me?.id : id));
  if (!person)
    return (
      <Empty
        title="Creator not found"
        description="Explore the arena to meet more creators."
        href="/"
      />
    );
  const own = person.id === state.me?.id;
  const entries = state.entries.filter((e) => e.authorId === person.id && e.status === 'APPROVED');
  const followers = state.follows.filter((f) => f.followingId === person.id).length;
  const following = state.follows.some(
    (f) => f.followerId === state.me?.id && f.followingId === person.id,
  );
  const featured = entries.find((e) => e.id === person.featuredEntryId);
  return (
    <>
      <div
        className="profile-cover"
        style={{
          backgroundImage:
            'linear-gradient(90deg,rgba(17,20,22,.6),rgba(17,20,22,.1)),url(/art/city.png)',
        }}
      />
      <div className="profile-header">
        <Avatar person={person} size="large" />
        <div className="profile-copy">
          <span className="eyebrow">CREATOR PORTFOLIO</span>
          <h1>{person.name}</h1>
          <p>{person.bio || 'A new imagination in the arena.'}</p>
          <div className="row muted">
            <span>
              <strong>{entries.length}</strong> entries
            </span>
            <span>
              <strong>{followers}</strong> followers
            </span>
            <span>
              <strong>{state.follows.filter((f) => f.followerId === person.id).length}</strong>{' '}
              following
            </span>
          </div>
        </div>
        {own ? (
          <Link href="/settings" className="button secondary">
            Edit profile
          </Link>
        ) : (
          <button className="button primary" onClick={() => act('follow', { id: person.id })}>
            <Users size={17} />
            {following ? 'Following' : 'Follow creator'}
          </button>
        )}
      </div>
      {featured && (
        <>
          <h2 className="spaced">Featured creation</h2>
          <div className="featured-entry">
            <EntryCard entry={featured} />
          </div>
        </>
      )}
      <div className="section-title">
        <h2>Inside the arena</h2>
        <span className="muted">Contest work, and the stories behind it.</span>
      </div>
      {entries.length ? (
        <div className="entry-grid">
          {entries.map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </div>
      ) : (
        <Empty
          title={own ? 'Your story starts with a creation' : 'The first creation is on its way'}
          description="Published contest entries and all their process stages will appear here."
          href={own ? '/submit' : '/'}
          label={own ? 'Create your first entry' : 'Explore creations'}
        />
      )}
    </>
  );
}
