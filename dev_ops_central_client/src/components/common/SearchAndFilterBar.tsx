import React from 'react';
import { Input, Select, Space, Button } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

interface FilterOption {
  label: string;
  value: string | number;
}

interface SearchAndFilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchWidth?: number;
  
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;
  filterWidth?: number;
  filterOptions?: FilterOption[];
  
  showCreateButton?: boolean;
  createButtonText?: string;
  onCreateClick?: () => void;
  createButtonIcon?: React.ReactNode;
  
  extraActions?: React.ReactNode;
  style?: React.CSSProperties;
}

const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = '搜索...',
  searchWidth = 300,
  
  filterValue,
  onFilterChange,
  filterPlaceholder = '选择筛选条件',
  filterWidth = 120,
  filterOptions = [],
  
  showCreateButton = false,
  createButtonText = '新建',
  onCreateClick,
  createButtonIcon = <PlusOutlined />,
  
  extraActions,
  style
}) => {
  return (
    <div 
      className="flex justify-between items-center mb-4"
      style={style}
    >
      <Space>
        <Input
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          style={{ width: searchWidth }}
          allowClear
        />
        {filterOptions.length > 0 && (
          <Select
            placeholder={filterPlaceholder}
            value={filterValue}
            onChange={onFilterChange}
            style={{ width: filterWidth }}
            allowClear
          >
            {filterOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        )}
        {extraActions}
      </Space>
      
      {showCreateButton && (
        <Button 
          type="primary" 
          icon={createButtonIcon}
          onClick={onCreateClick}
        >
          {createButtonText}
        </Button>
      )}
    </div>
  );
};

export default SearchAndFilterBar;
