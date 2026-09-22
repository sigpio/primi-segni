import { useNavigate } from 'react-router-dom';
import { Screen, Center, Title, BigButton } from '../components/ui';

export function Home() {
  const nav = useNavigate();
  return (
    <Screen>
      <Center>
        <div style={{ fontSize: 72 }}>✏️</div>
        <Title>Primi Segni</Title>
        <BigButton style={{ width: '100%' }} onClick={() => nav('/bambino')}>
          🧒 Sono un bambino
        </BigButton>
        <BigButton
          style={{ width: '100%', background: '#5b21b6' }}
          onClick={() => nav('/maestra/login')}
        >
          👩‍🏫 Sono la maestra
        </BigButton>
      </Center>
    </Screen>
  );
}
