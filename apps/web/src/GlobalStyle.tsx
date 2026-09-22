import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    font-family: 'Baloo 2', 'Comic Sans MS', system-ui, -apple-system, sans-serif;
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.ink};
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
    overscroll-behavior: none;
  }
  button { font-family: inherit; cursor: pointer; }
  canvas { touch-action: none; }
`;
