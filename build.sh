
#!/bin/bash

# 默认值
PORT=3777
MODE="run"
OUT_DIR="/Users/maxranje/app/work/code/webserver-zdss-mapi/public"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        run|build)
            MODE="$1"
            shift
            ;;
        -d|--dir)
            OUT_DIR="$2"
            shift 2
            ;;
        *)
            echo "未知参数: $1"
            exit 1
            ;;
    esac
done

# 处理端口占用（仅在 run 模式需要）
if [ "$MODE" = "run" ]; then
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
fi

# 根据模式执行对应操作
case $MODE in
    "run")
        echo "启动开发服务器: npm run dev"
        npm run dev
        ;;
    "build")
        echo "构建生产版本，输出目录: $OUT_DIR"
        rm -rf $OUT_DIR/dist
	rm -rf dist
	npm run build
        mv dist $OUT_DIR
	;;
    *)
        echo "错误: 未知模式 $MODE"
        exit 1
        ;;
esac
