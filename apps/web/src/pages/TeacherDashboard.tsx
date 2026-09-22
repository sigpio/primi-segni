import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { Exercise, Report, TrendPoint } from '@primi-segni/shared';
import { api } from '../api';
import { useSession } from '../store';
import { CLASS_ID } from '../config';
import { Screen, TopBar, Title, Card, GhostButton, BigButton } from '../components/ui';

function Sparkline({ trend }: { trend: TrendPoint[] }) {
  if (trend.length < 2) return <span style={{ color: '#9a8bbf', fontSize: 13 }}>poche prove</span>;
  const w = 130;
  const h = 36;
  const pts = trend.map((t, i) => {
    const x = (i / (trend.length - 1)) * w;
    const y = h - t.accuracy * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const rising = (trend.at(-1)?.accuracy ?? 0) >= (trend[0]?.accuracy ?? 0);
  return (
    <svg width={w} height={h} aria-label="andamento precisione">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={rising ? '#22c55e' : '#f59e0b'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled(Card)`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Avatar = styled.div`
  font-size: 40px;
  width: 56px;
  text-align: center;
`;

export function TeacherDashboard() {
  const nav = useNavigate();
  const teacher = useSession((s) => s.teacher);
  const [reports, setReports] = useState<Report[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState('');
  const [toast, setToast] = useState('');

  const exMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const playable = exercises.filter((e) => e.playable);

  const load = async () => {
    const [r, e] = await Promise.all([api.reports(CLASS_ID), api.exercises()]);
    setReports(r);
    setExercises(e);
    if (!selected && e.length) setSelected(e.find((x) => x.playable)?.id ?? e[0]!.id);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assignedBy = teacher?.id ?? 'teacher-1';

  const assignAll = async () => {
    if (!selected) return;
    await api.assign({ classId: CLASS_ID, exerciseId: selected, assignedBy });
    flash(`Assegnato a tutta la classe: ${exMap.get(selected)?.label ?? ''}`);
  };
  const assignOne = async (childId: string) => {
    if (!selected) return;
    await api.assign({ childId, exerciseId: selected, assignedBy });
    flash(`Assegnato a ${reports.find((r) => r.child.id === childId)?.child.name ?? ''}`);
  };
  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(''), 2500);
  };

  return (
    <Screen>
      <TopBar>
        <Title style={{ fontSize: 30 }}>Classe 1ª A</Title>
        <GhostButton onClick={() => nav('/')}>Esci</GhostButton>
      </TopBar>

      <Card style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700 }}>Assegna esercizio:</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: 12, border: '2px solid #cbb6f2', fontSize: 15 }}
        >
          {playable.map((e) => (
            <option key={e.id} value={e.id}>
              {e.subject === 'italiano' ? '📕' : '🔢'} {e.label}
            </option>
          ))}
        </select>
        <BigButton style={{ minHeight: 48, padding: '10px 18px', fontSize: 16 }} onClick={assignAll}>
          A tutta la classe
        </BigButton>
      </Card>

      {toast && (
        <Card style={{ background: '#dcfce7', color: '#166534', fontWeight: 700 }}>✓ {toast}</Card>
      )}

      <List>
        {reports.map((r) => (
          <Row key={r.child.id}>
            <Avatar>{r.child.avatar}</Avatar>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>
                {r.child.name}{' '}
                {r.needsHelp && <span title="Ha difficoltà">🩹</span>}
                {r.blockAlert && <span title="Si è bloccato">🔔</span>}
              </div>
              <div style={{ color: '#6b5b8a', fontSize: 14 }}>
                {r.attempts > 0 ? (
                  <>
                    preferito: <b>{exMap.get(r.favoriteExerciseId ?? '')?.label ?? '—'}</b> · precisione{' '}
                    <b>{r.latestAccuracy != null ? Math.round(r.latestAccuracy * 100) : 0}%</b>
                  </>
                ) : (
                  'nessuna prova ancora'
                )}
              </div>
            </div>
            <Sparkline trend={r.trend} />
            <GhostButton onClick={() => assignOne(r.child.id)}>Assegna</GhostButton>
          </Row>
        ))}
      </List>
    </Screen>
  );
}
