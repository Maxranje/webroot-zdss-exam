#!/bin/bash

PORT=3777

# 获取占用指定端口的进程ID
pids=$(lsof -ti :$PORT)

if [ -n "$pids" ]; then
    echo "发现占用端口 $PORT 的进程:"
    echo "$pids"
    
    # 强制终止所有相关进程
    kill -9 $pids 2>/dev/null
    
    # 短暂等待进程终止
    sleep 0.5
    
    # 验证是否终止成功
    if lsof -ti :$PORT >/dev/null; then
        echo "警告: 未能完全终止端口 $PORT 的进程，尝试继续启动服务..."
    else
        echo "成功终止所有占用端口 $PORT 的进程"
    fi
else
    echo "端口 $PORT 未被占用，直接启动服务"
fi

# 无论是否终止进程，都执行重启
echo "启动服务: npm run dev"
npm run dev
