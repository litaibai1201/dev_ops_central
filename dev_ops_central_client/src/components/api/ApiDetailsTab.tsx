import React from 'react';
import { ApiMethod } from '../../types';
import {
  ApiBasicInfo,
  ApiHeadersTable,
  ApiParametersTable,
  ApiResponseParameters,
  ApiRequestBody,
  ApiResponseExample
} from '../api';

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