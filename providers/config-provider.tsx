'use client';

import { createContext, useContext } from 'react';

const ConfigContext = createContext<any>(null);

export function ConfigProvider({ 
  children, 
  links 
}: { 
  children: React.ReactNode; 
  links: any; 
}) {
  return (
    <ConfigContext.Provider value={links}>
      {children}
    </ConfigContext.Provider>
  );
}

// Hook personalizado para usar en cualquier Client Component
export const useContactLinks = () => useContext(ConfigContext);