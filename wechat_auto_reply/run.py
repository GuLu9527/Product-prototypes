# -*- coding: utf-8 -*-
"""
微信公众号自动回复系统启动脚本
"""

import os
import sys
from app import app
from config import config

def main():
    """主函数"""
    # 获取运行环境
    env = os.environ.get('FLASK_ENV', 'development')
    
    # 加载配置
    app_config = config.get(env, config['default'])
    
    print("=== 微信公众号自动回复系统 ===")
    print(f"运行环境: {env}")
    print(f"调试模式: {app_config.DEBUG}")
    print(f"监听地址: {app_config.HOST}:{app_config.PORT}")
    
    # 检查Token配置
    if app_config.WECHAT_TOKEN == 'your_wechat_token_here':
        print("⚠️  警告: 请设置正确的微信Token!")
        print("   可以通过环境变量设置: export WECHAT_TOKEN=your_actual_token")
    
    print(f"微信接口地址: http://{app_config.HOST}:{app_config.PORT}/wechat")
    print(f"健康检查地址: http://{app_config.HOST}:{app_config.PORT}/health")
    print("=" * 40)
    
    try:
        # 启动Flask应用
        app.run(
            host=app_config.HOST,
            port=app_config.PORT,
            debug=app_config.DEBUG
        )
    except KeyboardInterrupt:
        print("\n👋 系统已停止运行")
    except Exception as e:
        print(f"❌ 启动失败: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()