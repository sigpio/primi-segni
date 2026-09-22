import { create } from 'zustand';
import type { Child, Teacher } from '@primi-segni/shared';

interface SessionState {
  teacher: Teacher | null;
  child: Child | null;
  setTeacher: (t: Teacher | null) => void;
  setChild: (c: Child | null) => void;
}

export const useSession = create<SessionState>((set) => ({
  teacher: null,
  child: null,
  setTeacher: (teacher) => set({ teacher }),
  setChild: (child) => set({ child }),
}));
