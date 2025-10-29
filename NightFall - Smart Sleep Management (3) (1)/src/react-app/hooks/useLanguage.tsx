import { createContext, useContext, ReactNode } from 'react';

interface LanguageContextType {
  language: 'en';
  setLanguage: (lang: 'en') => void;
  t: (ar: string, en: string) => string;
  dir: 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = 'en' as const;

  const t = (_ar: string, en: string) => {
    return en;
  };

  const dir = 'ltr' as const;

  const setLanguage = (_lang: 'en') => {
    // No-op since we only support English
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
