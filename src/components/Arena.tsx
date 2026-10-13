'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  Bookmark,
  ChevronRight,
  Coins,
  Compass,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  X,
  LogOut,
} from 'lucide-react';
import type { State } from '@/lib/types';
import { ArenaContext, type Action } from './context';
import { Avatar } from './ui';
import { Explore, Contests, ContestDetail, EntryDetail, Profile, Saved } from './discovery';
import { Login, Wallet, Notifications, SettingsPage, Submit } from './participation';
import { Admin } from './admin';
const nav = [
  { href: '/', label: 'Explore', icon: Compass },
  { href: '/contests', label: 'Contests', icon: Trophy },
  { href: '/submit', label: 'Submit', icon: PlusCircle },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/wallet', label: 'Wallet', icon: Coins },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: UserRound },
];
export function Arena() {
  const path = usePathname();
  const router = useRouter();
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const refresh = useCallback(async () => {
    const r = await fetch('/api/state', { cache: 'no-store' });
    if (!r.ok) throw new Error('Could not load the arena. Please try again.');
    setState(await r.json());
    setError('');
  }, []);
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, [refresh]);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 4500);
    return () => clearTimeout(t);
  }, [message]);
  useEffect(() => {
    document.documentElement.dataset.theme = localStorage.getItem('afc-theme') || 'dark';
  }, []);
  const act: Action = async (action, data = {}, success) => {
    if (busy) return null;
    setBusy(true);
    try {
      const r = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });
      const result = await r.json();
      if (!r.ok) {
        if (r.status === 401) router.push('/login');
        throw new Error(result.error || 'Something went wrong.');
      }
      await refresh();
      if (success) setMessage(success);
      return result;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Please try again.');
      return null;
    } finally {
      setBusy(false);
    }
  };
  if (!state)
    return (
      <div className="startup">
        <span className="wordmark">
          AFC<span>.</span>
        </span>
        {error ? (
          <>
            <p>{error}</p>
            <button
              className="button primary"
              onClick={() => refresh().catch((e) => setError(e.message))}
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <div className="loader" />
            <p>Opening the arena…</p>
          </>
        )}
      </div>
    );
  const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  const unread = state.notifications.filter((n) => !n.read).length;
  const navLink = (item: (typeof nav)[number], mobile = false) => (
    <Link
      key={item.href}
      href={item.href === '/profile' ? `/profile/${state.me?.id || 'me'}` : item.href}
      className={`nav-item ${active(item.href) ? 'active' : ''}`}
      aria-current={active(item.href) ? 'page' : undefined}
    >
      <item.icon size={mobile ? 22 : 20} />
      <span>{item.label}</span>
      {item.label === 'Notifications' && unread > 0 && <b className="nav-count">{unread}</b>}
    </Link>
  );
  let page;
  if (path === '/') page = <Explore search={search} />;
  else if (path === '/contests') page = <Contests search={search} />;
  else if (path.startsWith('/contests/')) page = <ContestDetail id={path.split('/')[2]} />;
  else if (path.startsWith('/entries/')) page = <EntryDetail id={path.split('/')[2]} />;
  else if (path === '/submit') page = <Submit />;
  else if (path === '/wallet') page = <Wallet />;
  else if (path === '/saved') page = <Saved />;
  else if (path === '/notifications') page = <Notifications />;
  else if (path.startsWith('/profile')) page = <Profile id={path.split('/')[2] || 'me'} />;
  else if (path === '/settings') page = <SettingsPage />;
  else if (path === '/login') page = <Login />;
  else if (path === '/admin') page = <Admin />;
  else page = <Explore search={search} />;
  return (
    <ArenaContext.Provider value={{ state, act, busy, toast: setMessage, refresh }}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="wordmark">
            AFC<span>.</span>
          </span>
          <span>
            Arena for
            <br />
            Creatives
          </span>
        </Link>
        <div className="nav-caption">YOUR CREATIVE SPACE</div>
        <nav aria-label="Main navigation">{nav.map((n) => navLink(n))}</nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sparkles size={19} />
            <strong>
              A little support.
              <br />A world of possibility.
            </strong>
            <p>Every vote counts.</p>
          </div>
          {state.me?.role === 'ADMIN' && (
            <Link className={`nav-item ${active('/admin') ? 'active' : ''}`} href="/admin">
              <ShieldCheck size={20} />
              Admin studio
            </Link>
          )}
          <Link className={`nav-item ${active('/settings') ? 'active' : ''}`} href="/settings">
            <Settings size={20} />
            Settings
          </Link>
          {state.me ? (
            <div className="sidebar-user">
              <Link href={`/profile/${state.me.id}`}>
                <Avatar person={state.me} />
                <span>
                  <strong>{state.me.name}</strong>
                  <small>
                    {state.me.role === 'ADMIN' ? 'Arena administrator' : 'Creative member'}
                  </small>
                </span>
              </Link>
              <button
                title="Sign out"
                className="icon-button"
                onClick={async () => {
                  await act('logout');
                  router.push('/');
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="button primary full">
              Join the arena
              <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <Link className="mobile-brand wordmark" href="/">
            AFC<span>.</span>
          </Link>
          <div className="search-box">
            <Search size={18} />
            <input
              aria-label="Search artworks, creators or contests"
              placeholder="Search artworks, creators, or contests…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (path !== '/' && path !== '/contests') router.push('/');
              }}
            />
            <kbd>/</kbd>
          </div>
          <div className="top-actions">
            <Link href="/wallet" className="balance-chip">
              <Coins size={18} />
              <b>{state.me?.balance ?? 100}</b>
              <span>points</span>
            </Link>
            <Link href="/notifications" className="icon-button bell" aria-label="Notifications">
              <Bell size={20} />
              {unread > 0 && <i />}
            </Link>
            {state.me ? (
              <Link className="top-avatar" href={`/profile/${state.me.id}`}>
                <Avatar person={state.me} />
              </Link>
            ) : (
              <Link className="top-signin" href="/login">
                Sign in
              </Link>
            )}
          </div>
        </header>
        <main id="main">
          {(path === '/' || path === '/contests') && (
            <div className="mobile-search">
              <Search size={17} />
              <input
                aria-label="Search the arena"
                placeholder="Search creations, creators, contests…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          {page}
        </main>
        <footer className="app-footer">
          <span>AFC · Arena for Creatives</span>
          <span>
            {state?.demo
              ? 'Local preview · sample artwork & demo payments'
              : 'AFC · Arena for Creatives'}
          </span>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {nav
          .filter((n) => ['Explore', 'Contests', 'Submit', 'Saved', 'Profile'].includes(n.label))
          .map((n) => navLink(n, true))}
      </nav>
      {message && (
        <div className="toast" role="status">
          <span>{message}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setMessage('')}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </ArenaContext.Provider>
  );
}
