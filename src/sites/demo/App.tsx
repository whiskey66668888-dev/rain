import React from 'react';

import { MainLayout } from '@/common/components/layouts/MainLayout';

import { useRegisterGlobalActions } from '@/common/hooks/useGlobalNavigate';

import { AppRoutes } from './routes';

/**
 * 应用根组件
 */
const App: React.FC = () => {
  useRegisterGlobalActions();

  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
};

export default App;
