import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PageContextType {
  apiName?: string;
  setApiName: (name: string) => void;
  projectName?: string;
  setProjectName: (name: string) => void;
  groupName?: string;
  setGroupName: (name: string) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

interface PageProviderProps {
  children: ReactNode;
}

export const PageProvider: React.FC<PageProviderProps> = ({ children }) => {
  const [apiName, setApiName] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');

  const value = {
    apiName,
    setApiName,
    projectName,
    setProjectName,
    groupName,
    setGroupName,
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = (): PageContextType => {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePageContext must be used within a PageProvider');
  }
  return context;
};