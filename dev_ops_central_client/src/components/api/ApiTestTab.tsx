import React from 'react';
import { ApiMethod } from '../../types';
import { ApiTestConfig, ApiTestResult } from '../api';

interface ApiTestTabProps {
  api: ApiMethod;
}

const ApiTestTab: React.FC<ApiTestTabProps> = ({ api }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ApiTestConfig api={api} />
      <ApiTestResult />
    </div>
  );
};

export default ApiTestTab;