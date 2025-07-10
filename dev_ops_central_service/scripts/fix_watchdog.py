#!/usr/bin/env python3
"""
快速修复 watchdog 版本兼容性问题
"""

import subprocess
import sys

def fix_watchdog():
    """修复 watchdog 版本问题"""
    print("=== 修复 watchdog 版本兼容性问题 ===")
    
    try:
        # 尝试降级 watchdog 到兼容版本
        print("正在降级 watchdog 到兼容版本...")
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', 'watchdog==3.0.0'
        ], check=True, capture_output=True, text=True)
        
        print("✅ watchdog 已成功降级到 3.0.0")
        print("\n现在可以重新启动应用:")
        print("python app.py")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ 降级失败: {e}")
        print("\n请手动运行以下命令:")
        print("pip install watchdog==3.0.0")
        print("\n或者尝试其他兼容版本:")
        print("pip install watchdog==2.3.1")
        
    except Exception as e:
        print(f"❌ 修复过程中出现错误: {e}")

if __name__ == '__main__':
    fix_watchdog()
