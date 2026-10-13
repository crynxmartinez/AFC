'use client';
import { createContext, useContext } from 'react';
import type { State } from '@/lib/types';
export type Action = (
  action: string,
  data?: Record<string, unknown>,
  message?: string,
) => Promise<Record<string, unknown> | null>;
export const ArenaContext = createContext<{
  state: State;
  act: Action;
  busy: boolean;
  toast: (message: string) => void;
  refresh: () => Promise<void>;
} | null>(null);
export function useArena() {
  const c = useContext(ArenaContext);
  if (!c) throw new Error('Arena context missing');
  return c;
}
