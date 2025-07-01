import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 设置dayjs中文语言
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);
dayjs.extend(duration);

// 创建根节点并渲染应用
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);