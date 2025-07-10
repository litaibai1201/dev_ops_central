#!/bin/bash

# 修复 watchdog 版本兼容性问题

echo "=== 修复 watchdog 版本兼容性问题 ==="

# 方案1: 降级 watchdog 到兼容版本
echo "方案1: 降级 watchdog 到兼容版本..."
pip install watchdog==3.0.0

echo "✅ watchdog 已降级到兼容版本"

# 方案2: 如果方案1不行，使用替代方案
echo ""
echo "如果仍有问题，可以尝试以下命令:"
echo "pip install watchdog==2.3.1"
echo ""
echo "或者禁用自动重载:"
echo "在 app.py 中将 debug=True 改为 debug=False"
echo "或添加 use_reloader=False 参数"
