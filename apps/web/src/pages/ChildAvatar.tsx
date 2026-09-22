import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { Child } from '@primi-segni/shared';
import { api } from '../api';
import { useSession } from '../store';
import { CLASS_ID } from '../config';
import { speak } from '../audio/speech';
import { Screen, Center, Title, GhostButton, TopBar } from '../components/ui';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
`;

const AvatarBtn = styled.button`
  border: 3px solid #ece3fb;
  background: #fff;
  border-radius: 24px;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: ${({ theme }) => theme.shadow};
  &:active {
    transform: scale(0.96);
  }
  .emoji {
    font-size: 64px;
  }
  .name {
    font-size: 22px;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

export function ChildAvatar() {
  const nav = useNavigate();
  const setChild = useSession((s) => s.setChild);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    void api.childrenOf(CLASS_ID).then(setChildren);
  }, []);

  const pick = (c: Child) => {
    setChild(c);
    speak(`Ciao ${c.name}`);
    nav(`/bambino/${c.id}`);
  };

  return (
    <Screen>
      <TopBar>
        <Title style={{ fontSize: 26 }}>Chi sei?</Title>
        <GhostButton onClick={() => nav('/')}>← Indietro</GhostButton>
      </TopBar>
      <Center style={{ justifyContent: 'flex-start' }}>
        <Grid>
          {children.map((c) => (
            <AvatarBtn key={c.id} onClick={() => pick(c)}>
              <span className="emoji">{c.avatar}</span>
              <span className="name">{c.name}</span>
            </AvatarBtn>
          ))}
        </Grid>
      </Center>
    </Screen>
  );
}
