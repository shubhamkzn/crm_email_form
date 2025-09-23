// src/context/DarkModeContext.jsx
import { createContext, useContext } from 'react';
import useDarkMode from '../hooks/useDarkMode.jsx';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const darkMode = useDarkMode();
  return (
    <DarkModeContext.Provider value={darkMode}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkModeContext = () => useContext(DarkModeContext);
