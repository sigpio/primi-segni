import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Child } from '@primi-segni/shared';
import { api, type TodayResponse } from '../api';
import { useSession } from '../store';
import { CLASS_ID } from '../config';
import { speak } from '../audio/speech';
import { Screen, Center, Title, Big, BigButton, GhostButton, Card } from '../components/ui';

export function ChildToday() {
  const { childId } = useParams();
  const nav = useNavigate();
  const sessionChild = useSession((s) => s.child);
  const [child, setChild] = useState<Child | null>(sessionChild);
  const [today, setToday] = useState<TodayResponse | null>(null);

  useEffect(() => {
    if (!childId) return;
    if (!child) {
      void api.childrenOf(CLASS_ID).then((list) => {
        setChild(list.find((c) => c.id === childId) ?? null);
      });
    }
    void api.today(childId).then(setToday);
  }, [childId, child]);

  useEffect(() => {
    if (child && today) {
      speak(`Ciao ${child.name}. Oggi studiamo ${today.exercise.label}, scelto da ${today.assignedBy}.`);
    }
  }, [child, today]);

  if (!child || !today) {
    return (
      <Screen>
        <Center>
          <Big>Un momento…</Big>
        </Center>
      </Screen>
    );
  }

  const playable = today.exercise.playable;

  return (
    <Screen>
      <Center>
        <div style={{ fontSize: 80 }}>{child.avatar}</div>
        <Title>CIAO {child.name.toUpperCase()}!</Title>
        <Card style={{ width: '100%' }}>
          <Big>
            Oggi studiamo <b>{today.exercise.icon} {today.exercise.label}</b>
          </Big>
          <p style={{ color: '#6b5b8a', marginTop: 6 }}>scelto da {today.assignedBy}</p>
        </Card>

        {playable ? (
          <BigButton style={{ width: '100%' }} onClick={() => nav(`/bambino/${child.id}/esercizio`)}>
            ▶️ Cominciamo!
          </BigButton>
        ) : (
          <Card style={{ width: '100%', background: '#fff7ed', color: '#9a3412' }}>
            <Big>🚧 Questo gioco arriva presto!</Big>
          </Card>
        )}

        <GhostButton onClick={() => nav('/bambino')}>← Cambia bambino</GhostButton>
      </Center>
    </Screen>
  );
}
