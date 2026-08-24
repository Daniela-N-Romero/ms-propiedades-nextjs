'use client';

import { createContext, useContext, useState } from 'react';

interface ConfigContextType {
  links: any;
  propiedadId: string | number | null;
  setPropiedadId: (id: string | number | null) => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export function ConfigProvider({ 
  children, 
  links 
}: { 
  children: React.ReactNode; 
  links: any; 
}) {
 // Añadimos el estado interno para guardar el ID de forma segura en memoria
  const [propiedadId, setPropiedadId] = useState<string | number | null>(null);

  return (
    <ConfigContext.Provider value={{ links, propiedadId, setPropiedadId }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useContactLinks = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useContactLinks debe usarse dentro de ConfigProvider');
  return context.links;
};

export const useAdminConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useAdminConfig debe usarse dentro de ConfigProvider');
  return { propiedadId: context.propiedadId, setPropiedadId: context.setPropiedadId };
};