import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import React from 'react';

interface QueryProviderProps {
  client: QueryClient;
  children: React.ReactNode;
}

/**
 * QueryClientProvider 包装组件
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ client, children }) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
