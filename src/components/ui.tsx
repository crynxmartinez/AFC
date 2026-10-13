'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Bookmark, Check, Clock3, Heart, ImageIcon, Trophy } from 'lucide-react';
import { useArena } from './context';
import type { Contest, Entry, Person } from '@/lib/types';
export const money = (value: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: value % 100 ? 2 : 0,
  }).format(value / 100);
export const date = (value: string) =>
  new Date(value).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
export const openContest = (c: Contest) =>
  c.status === 'ACTIVE' &&
  new Date(c.startsAt).getTime() <= Date.now() &&
  new Date(c.endsAt).getTime() > Date.now();
export function Avatar({
  person,
  size = '',
}: {
  person?: Pick<Person, 'name' | 'avatar'>;
  size?: string;
}) {
  return (
    <span className={`avatar ${size}`}>
      {person?.avatar ? (
        <img src={person.avatar} alt="" />
      ) : (
        person?.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('') || 'A'
      )}
    </span>
  );
}
export function Countdown({ contest }: { contest: Contest }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const upcoming = new Date(contest.startsAt).getTime() > now;
  const left = Math.max(0, new Date(upcoming ? contest.startsAt : contest.endsAt).getTime() - now);
  const h = Math.floor(left / 3600000);
  return (
    <span className="countdown">
      <Clock3 size={15} />
      {contest.status === 'ANNOUNCED'
        ? 'Results published'
        : contest.status === 'CLOSED' || !left
          ? 'Contest closed'
          : `${upcoming ? 'Starts in ' : ''}${Math.floor(h / 24)}d ${h % 24}h ${Math.floor(left / 60000) % 60}m${upcoming ? '' : ' left'}`}
    </span>
  );
}
export function SaveButton({ id, kind = 'ENTRY' }: { id: string; kind?: string }) {
  const { state, act } = useArena();
  const saved = state.bookmarks.some((b) => b.targetId === id && b.kind === kind);
  return (
    <button
      type="button"
      className={`icon-button save ${saved ? 'selected' : ''}`}
      title={saved ? 'Remove bookmark' : 'Save for later'}
      aria-label={saved ? 'Remove bookmark' : 'Save for later'}
      onClick={() =>
        act('bookmark', { id, kind }, saved ? 'Removed from saved' : 'Saved for later')
      }
    >
      <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}
export function VoteButton({ entry, compact = false }: { entry: Entry; compact?: boolean }) {
  const { state, act, busy } = useArena();
  const voted = state.myVotes.includes(entry.id);
  const contest = state.contests.find((c) => c.id === entry.contestId)!;
  const own = state.me?.id === entry.authorId;
  const closed = !openContest(contest) || entry.status !== 'APPROVED';
  return (
    <button
      disabled={busy || voted || own || closed}
      className={compact ? 'vote-compact' : `button primary full ${voted ? 'voted' : ''}`}
      onClick={() =>
        act('vote', { id: entry.id }, 'Your vote is in. Thank you for supporting a creator!')
      }
      title={
        own
          ? 'You cannot vote for your own entry'
          : voted
            ? 'You have already voted'
            : 'One permanent vote · 1 point'
      }
    >
      {voted ? <Check size={compact ? 16 : 19} /> : <Heart size={compact ? 16 : 19} />}{' '}
      {compact
        ? entry.voteCount
        : voted
          ? 'Voted · Thank you!'
          : own
            ? 'Your entry'
            : closed
              ? 'Voting closed'
              : 'Vote · 1 point'}
    </button>
  );
}
export function EntryCard({ entry }: { entry: Entry }) {
  const { state } = useArena();
  const person = state.people.find((p) => p.id === entry.authorId);
  const contest = state.contests.find((c) => c.id === entry.contestId);
  return (
    <article className="entry-card">
      <div className="card-image">
        <Link href={`/entries/${entry.id}`}>
          <img
            src={entry.stages.at(-1)?.url || '/art/forest.png'}
            alt={entry.title}
            loading="lazy"
          />
        </Link>
        <SaveButton id={entry.id} />
        <span className="type-tag">{contest?.type === 'ART' ? 'Art' : 'Cosplay'}</span>
      </div>
      <div className="card-copy">
        <Link className="contest-label" href={`/contests/${contest?.id}`}>
          {contest?.title}
        </Link>
        <Link href={`/entries/${entry.id}`}>
          <h3>{entry.title}</h3>
        </Link>
        <div className="card-footer">
          <Link href={`/profile/${entry.authorId}`} className="creator">
            <Avatar person={person} />
            <span>{person?.name}</span>
          </Link>
          <VoteButton entry={entry} compact />
        </div>
      </div>
    </article>
  );
}
export function Empty({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty">
      <ImageIcon size={36} />
      <h2>{title}</h2>
      <p>{description}</p>
      {href && (
        <Link href={href} className="button primary">
          {label || 'Explore the arena'}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function AuthGate() {
  return (
    <Empty
      title="Make yourself at home"
      description="Sign in to save favorites, share your work, and support the creators you love."
      href="/login"
      label="Join the arena"
    />
  );
}
export function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Prizes({ contest }: { contest: Contest }) {
  const amounts = [Math.floor(contest.prize * 0.5), Math.floor(contest.prize * 0.3)];
  amounts.push(contest.prize - amounts[0] - amounts[1]);
  return (
    <div className="prize-strip">
      <div className="prize-total">
        <Trophy />
        <span>
          Prize pool<strong>{contest.prize ? money(contest.prize) : 'Custom prizes'}</strong>
        </span>
      </div>
      {['1st', '2nd', '3rd'].map((p, i) => (
        <div className={`prize place-${i}`} key={p}>
          <span>
            {p} place · {[50, 30, 20][i]}%
          </span>
          <strong>
            {contest.prize
              ? money(amounts[i])
              : contest.customPrizes.split('\n')[i] || 'See contest rules'}
          </strong>
        </div>
      ))}
    </div>
  );
}
