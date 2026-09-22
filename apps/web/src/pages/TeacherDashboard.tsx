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

/** Descrive a parole i risultati del bambino (nessun voto, tono osservativo). */
function describeReport(r: Report, exMap: Map<string, Exercise>): string[] {
  if (r.attempts === 0) {
    return [`${r.child.name} non ha ancora svolto nessun esercizio.`];
  }
  const lines: string[] = [];
  lines.push(`${r.child.name} ha svolto ${r.attempts} eserciz${r.attempts === 1 ? 'io' : 'i'}.`);

  const fav = exMap.get(r.favoriteExerciseId ?? '');
  if (fav) lines.push(`L'esercizio che ripete più spesso è "${fav.label}".`);

  if (r.latestAccuracy != null) {
    lines.push(
      `Nell'ultimo tentativo è rimasto sulla linea (dentro i bordi) nel ${Math.round(
        r.latestAccuracy * 100,
      )}% del tratto.`,
    );
  }

  if (r.trend.length >= 2) {
    const first = Math.round((r.trend[0]?.accuracy ?? 0) * 100);
    const last = Math.round((r.trend.at(-1)?.accuracy ?? 0) * 100);
    if (last - first >= 5) {
      lines.push(`Sta migliorando con la pratica: la precisione è passata dal ${first}% al ${last}%.`);
    } else if (first - last >= 5) {
      lines.push(`La precisione è calata dal ${first}% al ${last}%.`);
    } else {
      lines.push(`La precisione è stabile intorno al ${last}%.`);
    }
    const h0 = r.trend[0]?.hintsUsed ?? 0;
    const h1 = r.trend.at(-1)?.hintsUsed ?? 0;
    if (h0 - h1 >= 1) lines.push('Chiede meno aiuti rispetto all’inizio: sta diventando più autonomo.');
  }

  if (r.needsHelp) {
    lines.push('Attenzione: fatica a superare l’esercizio, potrebbe servire un supporto in più.');
  }
  if (r.blockAlert) {
    lines.push('Attenzione: almeno una volta si è bloccato e l’app ha proposto una pausa.');
  }
  return lines;
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(43, 26, 74, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 10;
`;

const Modal = styled(Card)`
  max-width: 520px;
  width: 100%;
  max-height: 85vh;
  overflow: auto;
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
  const [openReport, setOpenReport] = useState<Report | null>(null);

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
              <div style={{ fontWeight: 800, fontSize: 18 }}>{r.child.name}</div>
              <div style={{ color: '#6b5b8a', fontSize: 14 }}>
                {r.attempts > 0
                  ? `${r.attempts} prove svolte`
                  : 'nessuna prova ancora'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <GhostButton onClick={() => setOpenReport(r)}>📄 Report</GhostButton>
              <GhostButton onClick={() => assignOne(r.child.id)}>Assegna</GhostButton>
            </div>
          </Row>
        ))}
      </List>

      {openReport && (
        <Overlay onClick={() => setOpenReport(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <TopBar>
              <div style={{ fontWeight: 800, fontSize: 22 }}>
                {openReport.child.avatar} {openReport.child.name}
              </div>
              <GhostButton onClick={() => setOpenReport(null)}>Chiudi</GhostButton>
            </TopBar>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {describeReport(openReport, exMap).map((line, i) => (
                <p key={i} style={{ fontSize: 16, lineHeight: 1.5, color: '#2b1a4a' }}>
                  {line}
                </p>
              ))}
            </div>
            {openReport.trend.length >= 2 && (
              <div>
                <div style={{ fontSize: 13, color: '#6b5b8a', marginBottom: 4 }}>
                  Andamento della precisione
                </div>
                <Sparkline trend={openReport.trend} />
              </div>
            )}
          </Modal>
        </Overlay>
      )}
    </Screen>
  );
}
