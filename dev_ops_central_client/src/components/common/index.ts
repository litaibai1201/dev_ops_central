// 通用组件导出文件

// API 相关组件
export { default as HttpMethodTag } from './HttpMethodTag';
export { default as CodeBlock } from './CodeBlock';
export { default as CopyButton } from './CopyButton';
export { default as ResponseStatus } from './ResponseStatus';
export { default as ApiParamsTable } from './ApiParamsTable';
export { default as CodeExamples } from './CodeExamples';

// 导航组件
export { default as PageHeader } from './PageHeader';
export { default as PageBreadcrumb } from './PageBreadcrumb';
export { PageProvider, usePageContext } from './PageContext';

// 数据展示组件
export { default as StatisticsCards } from './StatisticsCards';
export { default as StatusTag } from './StatusTag';
export { default as UserDisplay } from './UserDisplay';
export { default as LoadingState } from './LoadingState';

// 表格相关组件
export { default as TableActions, createViewAction, createEditAction, createDeleteAction, createTestAction, createSettingsAction } from './TableActions';
export { default as SearchAndFilterBar } from './SearchAndFilterBar';

// 表单组件
export { default as AuthForm, loginFormFields, registerFormFields } from './AuthForm';
export { default as ModalForm, groupFormFields, projectFormFields } from './ModalForm';

// 权限相关组件
export { default as PermissionGuard } from './PermissionGuard';

// 新增的公共工具和Hook
export * from './DataService';
export * from './PermissionUtils';
export * from './CommonHooks';
export * from './TableConfigs';
export * from './UIComponents';