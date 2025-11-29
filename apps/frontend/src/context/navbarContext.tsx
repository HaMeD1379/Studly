// src/context/NavbarContext.tsx
import { createContext, type ReactNode, useContext, useState } from 'react';

type NavbarContextType = {
  globalPath: string;
  setGlobalPath: (path: string) => void;
};

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [globalPath, setGlobalPath] = useState(window.location.pathname);

  return (
    <NavbarContext.Provider value={{ globalPath, setGlobalPath }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => {
  const ctx = useContext(NavbarContext);
  if (!ctx) throw new Error('useNavbar must be used within a NavbarProvider');
  return ctx;
};
