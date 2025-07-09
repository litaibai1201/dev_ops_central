import React from 'react';
import { ApiMethod } from '../../types';
import ApiBasicInfo from './ApiBasicInfo';
import ApiHeadersTable from './ApiHeadersTable';
import ApiParametersTable from './ApiParametersTable';
import ApiResponseParameters from './ApiResponseParameters';
import ApiRequestBody from './ApiRequestBody';
import ApiResponseExample from './ApiResponseExample';

interface ApiDetailsTabProps {
  api: ApiMethod;
}

const ApiDetailsTab: React.FC<ApiDetailsTabProps> = ({ api }) => {
  return (
    <div>
      <ApiBasicInfo api={api} />
      <ApiHeadersTable headers={api.headers} />
      <ApiParametersTable params={api.params || []} title="请求参数" />
      <ApiResponseParameters />
      <ApiRequestBody body={api.body} />
      <ApiResponseExample responses={api.responses || []} />
    </div>
  );
};

export default ApiDetailsTab;