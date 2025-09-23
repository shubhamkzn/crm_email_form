        // src/hooks/useDarkMode.jsx
import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'Email Builder:theme'; // localStorage key

export default function useDarkMode() {
  // initial value: localStorage -> system preference -> false
  const getInitial = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark') return true;
      if (stored === 'light') return false;

      // system preference fallback
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
      }
    } catch (e) {
      // ignore
    }
    return false;
  };

  const [isDark, setIsDark] = useState(getInitial);

  // keep DOM class and localStorage in sync whenever isDark changes
useEffect(() => {
  const root = document.documentElement;

  if (isDark) {
    root.classList.add("darkCustom");  // 👈 custom class
    localStorage.setItem(STORAGE_KEY, "dark");
  } else {
    root.classList.remove("darkCustom");
    localStorage.setItem(STORAGE_KEY, "light");
  }
}, [isDark]);


  const toggle = useCallback(() => setIsDark((v) => !v), []);
  const setDark = useCallback((value) => setIsDark(!!value), []);

  return { isDark, toggle, setDark };
}
