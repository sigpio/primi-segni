import styled, { css } from 'styled-components';

export const Screen = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 18px;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
`;

export const Center = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  text-align: center;
`;

export const Title = styled.h1`
  font-size: clamp(28px, 7vw, 44px);
  color: ${({ theme }) => theme.colors.primaryDark};
  line-height: 1.1;
`;

export const Big = styled.p`
  font-size: clamp(20px, 5vw, 28px);
  color: ${({ theme }) => theme.colors.ink};
`;

export const buttonBase = css`
  border: none;
  border-radius: ${({ theme }) => theme.radius};
  font-weight: 800;
  color: #fff;
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadow};
  transition: transform 0.12s ease;
  &:active {
    transform: scale(0.96);
  }
  &:disabled {
    opacity: 0.5;
  }
`;

export const BigButton = styled.button`
  ${buttonBase};
  font-size: clamp(20px, 5vw, 26px);
  padding: 20px 28px;
  min-height: 72px;
`;

export const GhostButton = styled.button`
  border: 2px solid ${({ theme }) => theme.colors.trackLine};
  background: #fff;
  color: ${({ theme }) => theme.colors.primaryDark};
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 700;
  font-size: 15px;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radius};
  box-shadow: ${({ theme }) => theme.shadow};
  padding: 18px 20px;
`;

export const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;
