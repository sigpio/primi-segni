import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useSession } from '../store';
import { Screen, Center, Title, BigButton, GhostButton } from '../components/ui';

export function TeacherLogin() {
  const nav = useNavigate();
  const setTeacher = useSession((s) => s.setTeacher);
  const [email, setEmail] = useState('giulia@scuola.it');
  const [err, setErr] = useState('');

  const submit = async () => {
    setErr('');
    try {
      const res = await api.ssoLogin(email.trim());
      setTeacher(res.teacher);
      nav('/maestra');
    } catch {
      setErr('Email non riconosciuta. Prova giulia@scuola.it');
    }
  };

  return (
    <Screen>
      <Center>
        <div style={{ fontSize: 56 }}>👩‍🏫</div>
        <Title>Accesso maestra</Title>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email della scuola"
          inputMode="email"
          style={{
            width: '100%',
            padding: '16px 18px',
            fontSize: 18,
            borderRadius: 16,
            border: '2px solid #cbb6f2',
            outline: 'none',
          }}
        />
        {err && <p style={{ color: '#ef4444' }}>{err}</p>}
        <BigButton style={{ width: '100%' }} onClick={submit}>
          Entra
        </BigButton>
        <GhostButton onClick={() => nav('/')}>← Indietro</GhostButton>
      </Center>
    </Screen>
  );
}
