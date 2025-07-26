# -*- coding: utf-8 -*-
"""
微信公众号自动回复系统
主应用程序入口
"""

from flask import Flask, request, make_response
import os
from wechat_handler import WeChatHandler
from logger_config import wechat_logger, exception_handler, log_function_call

# 创建Flask应用实例
app = Flask(__name__)

# 获取日志器
logger = wechat_logger.get_logger('app')

# 微信公众号配置
WECHAT_TOKEN = os.environ.get('WECHAT_TOKEN', 'your_wechat_token_here')

# 创建微信处理器实例
wechat_handler = WeChatHandler(WECHAT_TOKEN)

@app.route('/wechat', methods=['GET', 'POST'])
@exception_handler(logger)
@log_function_call(logger)
def wechat_interface():
    """
    微信公众号接口处理函数
    GET请求：用于微信服务器验证
    POST请求：用于接收和处理用户消息
    """
    try:
        logger.info(f"收到微信请求: {request.method} {request.url}")
        
        if request.method == 'GET':
            # 处理微信服务器验证
            logger.info("处理微信服务器验证请求")
            return wechat_handler.verify_signature(request)
        elif request.method == 'POST':
            # 处理用户消息
            logger.info("处理用户消息请求")
            return wechat_handler.handle_message(request)
    except Exception as e:
        logger.error(f"处理微信请求时发生错误: {str(e)}", exc_info=True)
        return make_response("服务器内部错误", 500)

@app.route('/health', methods=['GET'])
@exception_handler(logger)
def health_check():
    """健康检查接口"""
    logger.info("健康检查请求")
    return {"status": "ok", "message": "微信公众号自动回复系统运行正常"}

if __name__ == '__main__':
    logger.info("启动微信公众号自动回复系统...")
    app.run(host='0.0.0.0', port=5000, debug=True)