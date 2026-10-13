export type Person = {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  featuredEntryId?: string | null;
  suspended?: boolean;
  role?: string;
};
export type Member = Person & {
  email: string;
  balance: number;
  role: string;
  notifyActivity: boolean;
  notifyContests: boolean;
};
export type Contest = {
  id: string;
  title: string;
  description: string;
  type: string;
  banner: string;
  rules: string;
  prize: number;
  customPrizes: string;
  resultsNote: string;
  status: string;
  startsAt: string;
  endsAt: string;
  winners: { entryId: string; place: number; amount: number; voteCount: number }[];
};
export type Entry = {
  id: string;
  title: string;
  description: string;
  authorId: string;
  contestId: string;
  status: string;
  moderationNote: string;
  createdAt: string;
  voteCount: number;
  stages: { id: string; position: number; label: string; url: string }[];
  comments: { id: string; body: string; hidden: boolean; createdAt: string; user: Person }[];
};
export type State = {
  me: Member | null;
  contests: Contest[];
  entries: Entry[];
  people: Person[];
  bookmarks: { id: string; targetId: string; kind: string }[];
  ledger: {
    id: string;
    amount: number;
    description: string;
    entryId: string | null;
    createdAt: string;
  }[];
  notifications: {
    id: string;
    title: string;
    body: string;
    href: string;
    read: boolean;
    createdAt: string;
  }[];
  follows: { followerId: string; followingId: string }[];
  myVotes: string[];
  reports: { id: string; targetId: string; kind: string; reason: string; resolved: boolean }[];
  audits: { id: string; action: string; targetId: string; detail: string; createdAt: string }[];
  demo: boolean;
};
