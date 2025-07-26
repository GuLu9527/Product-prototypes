# -*- coding: utf-8 -*-
"""
微信公众号配置文件
"""

import os

class Config:
    """基础配置类"""
    
    # 微信公众号Token（需要在微信公众平台设置）
    WECHAT_TOKEN = os.environ.get('WECHAT_TOKEN', 'your_wechat_token_here')
    
    # 日志配置
    LOG_LEVEL = 'INFO'
    LOG_FILE = 'wechat_auto_reply.log'
    
    # Flask配置
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
    PORT = int(os.environ.get('FLASK_PORT', 5000))

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'

# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}