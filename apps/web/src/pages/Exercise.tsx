import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Exercise as Ex } from '@primi-segni/shared';
import { api } from '../api';
import { TraceCanvas, type TraceApi, type TraceMetrics } from '../components/TraceCanvas';
import { Fireworks } from '../components/Fireworks';
import { speak } from '../audio/speech';
import { playCheer } from '../audio/sfx';
import { Screen, Center, Title, Big, BigButton, GhostButton } from '../components/ui';

type Phase = 'trace' | 'done' | 'rest';

export function Exercise() {
  const { childId } = useParams();
  const nav = useNavigate();
  const [exercise, setExercise] = useState<Ex | null>(null);
  const [phase, setPhase] = useState<Phase>('trace');
  const [feedback, setFeedback] = useState('');
  const [fireworks, setFireworks] = useState(false);
  const [attemptKey, setAttemptKey] = useState(0);

  const finishApi = useRef<TraceApi | null>(null);
  const childIdRef = useRef(childId);
  const exIdRef = useRef<string>('');
  childIdRef.current = childId;

  useEffect(() => {
    if (!childId) return;
    void api.today(childId).then((t) => {
      setExercise(t.exercise);
      exIdRef.current = t.exercise.id;
    });
  }, [childId]);

  // consegna audio all'inizio di ogni tentativo
  useEffect(() => {
    if (exercise && phase === 'trace') {
      speak(`Ricalca ${exercise.label} seguendo la linea con il dito.`);
    }
  }, [exercise, phase, attemptKey]);

  const save = useCallback((m: TraceMetrics, completed: boolean, blocked: boolean) => {
    const cid = childIdRef.current;
    if (!cid) return;
    void api
      .saveAttempt({
        childId: cid,
        exerciseId: exIdRef.current,
        accuracy: m.accuracy,
        durationMs: m.durationMs,
        stalls: m.stalls,
        hintsUsed: m.hintsUsed,
        outOfBounds: m.outOfBounds,
        completed,
        blocked,
      })
      .catch(() => {
        /* offline: best-effort, il tentativo verrà perso (scelta di scope MVP) */
      });
  }, []);

  const onComplete = useCallback(
    (m: TraceMetrics) => {
      setPhase('done');
      setFireworks(true);
      playCheer();
      speak('Evviva! Hai finito!');
      save(m, true, false);
    },
    [save],
  );

  const onBlock = useCallback(
    (m: TraceMetrics) => {
      setPhase('rest');
      setFireworks(true);
      playCheer();
      speak('Per oggi abbiamo finito. Bravo!');
      save(m, false, true);
    },
    [save],
  );

  const onFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    speak(msg);
  }, []);

  const onReady = useCallback((a: TraceApi) => {
    finishApi.current = a;
  }, []);

  const again = () => {
    setPhase('trace');
    setFeedback('');
    setFireworks(false);
    setAttemptKey((k) => k + 1);
  };

  if (!exercise) {
    return (
      <Screen>
        <Center>
          <Big>Un momento…</Big>
        </Center>
      </Screen>
    );
  }

  if (phase === 'done') {
    return (
      <Screen>
        <Fireworks run={fireworks} />
        <Center>
          <div style={{ fontSize: 72 }}>🎉</div>
          <Title>Evviva!</Title>
          <Big>Hai finito! 💜</Big>
          <BigButton style={{ width: '100%' }} onClick={again}>
            🔁 Ancora una volta
          </BigButton>
          <GhostButton onClick={() => nav('/bambino')}>Torna ai giochi</GhostButton>
        </Center>
      </Screen>
    );
  }

  if (phase === 'rest') {
    return (
      <Screen>
        <Fireworks run={fireworks} />
        <Center>
          <div style={{ fontSize: 64 }}>🎆</div>
          <Title>Per oggi abbiamo finito, yuppi!</Title>
          <Big>Ti sei impegnato tanto. Riposati! 💜</Big>
          <BigButton style={{ width: '100%' }} onClick={() => nav('/bambino')}>
            Torna ai giochi
          </BigButton>
        </Center>
      </Screen>
    );
  }

  return (
    <Screen>
      <Center>
        <Title style={{ fontSize: 26 }}>
          Ricalca {exercise.icon} {exercise.label}
        </Title>
        <TraceCanvas
          key={attemptKey}
          value={exercise.value}
          onComplete={onComplete}
          onBlock={onBlock}
          onFeedback={onFeedback}
          onReady={onReady}
        />
        <Big style={{ minHeight: 34, color: '#7c3aed' }}>{feedback}</Big>
        <BigButton style={{ width: '100%' }} onClick={() => finishApi.current?.finish()}>
          ✓ Ho finito
        </BigButton>
        <GhostButton onClick={() => nav(`/bambino/${childId}`)}>← Torna indietro</GhostButton>
      </Center>
    </Screen>
  );
}
