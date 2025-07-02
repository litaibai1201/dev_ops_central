import { useState, useMemo, useCallback } from 'react';

// 通用搜索和过滤Hook
export const useSearchAndFilter = <T,>(
  data: T[],
  searchFields: (keyof T)[],
  initialSearchValue: string = '',
  filterFunction?: (item: T, searchText: string) => boolean
) => {
  const [searchText, setSearchText] = useState(initialSearchValue);

  const filteredData = useMemo(() => {
    if (!searchText.trim()) {
      return data;
    }

    const searchLower = searchText.toLowerCase();
    
    if (filterFunction) {
      return data.filter(item => filterFunction(item, searchLower));
    }

    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchLower);
        }
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(searchLower)
          );
        }
        // 处理嵌套对象（如 group.name）
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(v => 
            typeof v === 'string' && v.toLowerCase().includes(searchLower)
          );
        }
        return false;
      });
    });
  }, [data, searchText, searchFields, filterFunction]);

  return {
    searchText,
    setSearchText,
    filteredData,
    hasSearchText: searchText.trim().length > 0
  };
};

// 表单验证工具
export const FormValidators = {
  // 项目/群组名称验证
  validateName: (minLength: number = 2, maxLength: number = 50, allowSpecial: boolean = false) => 
    (_: any, value: string) => {
      if (!value) {
        return Promise.reject(new Error('请输入名称'));
      }
      if (!allowSpecial && /[^a-zA-Z0-9\u4e00-\u9fa5_-]/.test(value)) {
        return Promise.reject(new Error('名称不能包含特殊字符，只允许中英文、数字、下划线和短横线'));
      }
      if (value.length < minLength || value.length > maxLength) {
        return Promise.reject(new Error(`名称长度应在${minLength}-${maxLength}个字符之间`));
      }
      return Promise.resolve();
    },

  // 描述验证
  validateDescription: (minLength: number = 10, maxLength: number = 500) => 
    (_: any, value: string) => {
      if (!value) {
        return Promise.reject(new Error('请输入描述'));
      }
      if (value.length < minLength) {
        return Promise.reject(new Error(`描述至少需要${minLength}个字符`));
      }
      if (value.length > maxLength) {
        return Promise.reject(new Error(`描述不能超过${maxLength}个字符`));
      }
      return Promise.resolve();
    },

  // 邮箱验证
  validateEmail: (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入邮箱'));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Promise.reject(new Error('请输入有效的邮箱地址'));
    }
    return Promise.resolve();
  },

  // 版本号验证
  validateVersion: (_: any, value: string) => {
    if (!value) {
      return Promise.resolve(); // 版本号可以为空
    }
    const versionRegex = /^v?\d+\.\d+\.\d+$/;
    if (!versionRegex.test(value)) {
      return Promise.reject(new Error('版本号格式应为 v1.0.0 或 1.0.0'));
    }
    return Promise.resolve();
  }
};

// 分页Hook
export const usePagination = (
  pageSize: number = 10,
  showSizeChanger: boolean = true
) => {
  const [current, setCurrent] = useState(1);
  const [size, setSize] = useState(pageSize);

  const paginationConfig = useMemo(() => ({
    current,
    pageSize: size,
    showSizeChanger,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) => 
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
    onChange: (page: number, newSize?: number) => {
      setCurrent(page);
      if (newSize && newSize !== size) {
        setSize(newSize);
      }
    },
    onShowSizeChange: (_: number, newSize: number) => {
      setSize(newSize);
      setCurrent(1); // 重置到第一页
    }
  }), [current, size, showSizeChanger]);

  const resetPagination = useCallback(() => {
    setCurrent(1);
    setSize(pageSize);
  }, [pageSize]);

  return {
    current,
    pageSize: size,
    paginationConfig,
    resetPagination,
    setCurrent,
    setPageSize: setSize
  };
};

// 数据统计Hook
export const useDataStats = <T,>(
  data: T[],
  statsConfig: {
    [key: string]: (items: T[]) => number | string;
  }
) => {
  return useMemo(() => {
    const stats: Record<string, number | string> = {};
    
    Object.entries(statsConfig).forEach(([key, calculator]) => {
      stats[key] = calculator(data);
    });
    
    return stats;
  }, [data, statsConfig]);
};

// 模态框状态管理Hook
export const useModal = (initialState: boolean = false) => {
  const [visible, setVisible] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const showModal = useCallback(() => setVisible(true), []);
  const hideModal = useCallback(() => setVisible(false), []);
  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);

  return {
    visible,
    loading,
    showModal,
    hideModal,
    startLoading,
    stopLoading,
    setVisible,
    setLoading
  };
};

// 选择管理Hook
export const useSelection = <T,>(getKey: (item: T) => string = (item: any) => item.id) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const selectItem = useCallback((item: T) => {
    const key = getKey(item);
    setSelectedKeys(prev => [...prev, key]);
    setSelectedItems(prev => [...prev, item]);
  }, [getKey]);

  const deselectItem = useCallback((item: T) => {
    const key = getKey(item);
    setSelectedKeys(prev => prev.filter(k => k !== key));
    setSelectedItems(prev => prev.filter(i => getKey(i) !== key));
  }, [getKey]);

  const toggleItem = useCallback((item: T) => {
    const key = getKey(item);
    if (selectedKeys.includes(key)) {
      deselectItem(item);
    } else {
      selectItem(item);
    }
  }, [selectedKeys, selectItem, deselectItem, getKey]);

  const clearSelection = useCallback(() => {
    setSelectedKeys([]);
    setSelectedItems([]);
  }, []);

  const isSelected = useCallback((item: T) => {
    return selectedKeys.includes(getKey(item));
  }, [selectedKeys, getKey]);

  return {
    selectedKeys,
    selectedItems,
    selectItem,
    deselectItem,
    toggleItem,
    clearSelection,
    isSelected,
    hasSelection: selectedKeys.length > 0,
    selectionCount: selectedKeys.length
  };
};

// 本地存储Hook
export const useLocalStorage = <T,>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`读取localStorage失败: ${key}`, error);
      return defaultValue;
    }
  });

  const setStorageValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`写入localStorage失败: ${key}`, error);
    }
  }, [key, value]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.warn(`删除localStorage失败: ${key}`, error);
    }
  }, [key, defaultValue]);

  return [value, setStorageValue, removeValue] as const;
};
