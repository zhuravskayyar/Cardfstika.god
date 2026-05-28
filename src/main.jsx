import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GameProvider } from './store/GameContext.jsx';
import App from './App.jsx';
import './styles/variables.css';
import './styles/reset.css';
import './styles/patch.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>
);
