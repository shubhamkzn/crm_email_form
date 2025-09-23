import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { DarkModeProvider } from './components/context/DarkModeContext.jsx'; // import your context

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <DarkModeProvider>
        <App />
      </DarkModeProvider>
    </StrictMode>
  </BrowserRouter>
);
