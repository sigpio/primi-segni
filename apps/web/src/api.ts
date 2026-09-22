import type { Attempt, Child, Exercise, Report, Teacher } from '@primi-segni/shared';

const base = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(base + path);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(base + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type AttemptInput = Omit<Attempt, 'id' | 'createdAt'>;
export interface TodayResponse {
  exercise: Exercise;
  assignedBy: string;
}

export const api = {
  ssoLogin: (email: string) => post<{ token: string; teacher: Teacher }>('/auth/sso', { email }),
  childrenOf: (classId: string) => get<Child[]>(`/classes/${classId}/children`),
  reports: (classId: string) => get<Report[]>(`/children?classId=${encodeURIComponent(classId)}`),
  report: (id: string) => get<Report>(`/children/${id}/report`),
  today: (id: string) => get<TodayResponse>(`/children/${id}/today`),
  exercises: () => get<Exercise[]>('/exercises'),
  assign: (body: {
    childId?: string | null;
    classId?: string | null;
    exerciseId: string;
    assignedBy: string;
  }) => post<{ id: string }>('/assignments', body),
  saveAttempt: (a: AttemptInput) => post<{ id: string }>('/attempts', a),
};
