import React from 'react';
import { Card, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showCopy?: boolean;
  maxHeight?: string | number;
  theme?: 'light' | 'dark' | 'github';
  onCopy?: (code: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'text',
  title,
  showCopy = true,
  maxHeight = '500px',
  theme = 'light',
  onCopy
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    if (onCopy) {
      onCopy(code);
    }
  };

  const getThemeStyle = () => {
    const themes = {
      light: {
        backgroundColor: '#f6f8fa',
        color: '#24292e',
        border: '1px solid #d1d9e0'
      },
      dark: {
        backgroundColor: '#282c34',
        color: '#abb2bf',
        border: 'none'
      },
      github: {
        backgroundColor: '#f8f8f2',
        color: '#24292e',
        border: '1px solid #e1e4e8'
      }
    };
    return themes[theme];
  };

  const themeStyle = getThemeStyle();

  const content = (
    <div style={{ 
      ...themeStyle,
      padding: '16px', 
      borderRadius: '6px',
      overflow: 'auto',
      maxHeight,
      userSelect: 'none',  // 禁用文本选中
      WebkitUserSelect: 'none',  // Safari 兼容
      MozUserSelect: 'none',  // Firefox 兼容
      msUserSelect: 'none'  // IE 兼容
    }}>
      <pre style={{ 
        margin: 0, 
        fontSize: '13px', 
        lineHeight: '1.45',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        userSelect: 'none',  // 禁用 pre 标签文本选中
        textDecoration: 'none',  // 去掉下划线
        backgroundColor: 'inherit',  // 继承父容器背景色
        color: 'inherit'  // 继承父容器文字颜色
      }}>
        <code style={{
          userSelect: 'none',  // 禁用 code 标签文本选中
          textDecoration: 'none',  // 去掉下划线
          outline: 'none',  // 去掉焦点框
          border: 'none',  // 去掉边框
          backgroundColor: 'inherit',  // 继承父容器背景色
          color: 'inherit'  // 继承父容器文字颜色
        }}>{code}</code>
      </pre>
    </div>
  );

  if (title || showCopy) {
    return (
      <Card 
        title={title}
        size="small"
        extra={showCopy ? (
          <Button 
            icon={<CopyOutlined />} 
            size="small"
            onClick={handleCopy}
          >
            复制代码
          </Button>
        ) : null}
      >
        {content}
      </Card>
    );
  }

  return content;
};

export default CodeBlock;
