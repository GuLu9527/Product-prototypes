# -*- coding: utf-8 -*-
"""
日志配置模块
统一管理系统日志配置和异常处理
"""

import logging
import logging.handlers
import os
import sys
from datetime import datetime
import traceback
from functools import wraps

class WeChatLogger:
    """微信公众号日志管理器"""
    
    def __init__(self, log_level='INFO', log_file='wechat_auto_reply.log', max_bytes=10*1024*1024, backup_count=5):
        """
        初始化日志管理器
        :param log_level: 日志级别
        :param log_file: 日志文件路径
        :param max_bytes: 单个日志文件最大大小
        :param backup_count: 保留的日志文件数量
        """
        self.log_level = getattr(logging, log_level.upper(), logging.INFO)
        self.log_file = log_file
        self.max_bytes = max_bytes
        self.backup_count = backup_count
        
        # 创建日志目录
        log_dir = os.path.dirname(os.path.abspath(log_file))
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        self._setup_logger()
    
    def _setup_logger(self):
        """设置日志配置"""
        # 创建根日志器
        self.logger = logging.getLogger('wechat_auto_reply')
        self.logger.setLevel(self.log_level)
        
        # 清除已有的处理器
        self.logger.handlers.clear()
        
        # 创建格式化器
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # 文件处理器（支持日志轮转）
        try:
            file_handler = logging.handlers.RotatingFileHandler(
                self.log_file,
                maxBytes=self.max_bytes,
                backupCount=self.backup_count,
                encoding='utf-8'
            )
            file_handler.setLevel(self.log_level)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
        except Exception as e:
            print(f"创建文件日志处理器失败: {str(e)}")
        
        # 控制台处理器
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(self.log_level)
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        # 错误日志单独处理器
        try:
            error_handler = logging.handlers.RotatingFileHandler(
                'error.log',
                maxBytes=self.max_bytes,
                backupCount=self.backup_count,
                encoding='utf-8'
            )
            error_handler.setLevel(logging.ERROR)
            error_handler.setFormatter(formatter)
            self.logger.addHandler(error_handler)
        except Exception as e:
            print(f"创建错误日志处理器失败: {str(e)}")
    
    def get_logger(self, name=None):
        """
        获取日志器
        :param name: 日志器名称
        :return: 日志器实例
        """
        if name:
            return logging.getLogger(f'wechat_auto_reply.{name}')
        return self.logger

class ExceptionHandler:
    """异常处理器"""
    
    def __init__(self, logger):
        """
        初始化异常处理器
        :param logger: 日志器实例
        """
        self.logger = logger
    
    def handle_exception(self, exc_type, exc_value, exc_traceback):
        """
        全局异常处理函数
        :param exc_type: 异常类型
        :param exc_value: 异常值
        :param exc_traceback: 异常追踪
        """
        if issubclass(exc_type, KeyboardInterrupt):
            # 键盘中断不记录日志
            sys.__excepthook__(exc_type, exc_value, exc_traceback)
            return
        
        # 记录异常信息
        self.logger.error(
            "未捕获的异常",
            exc_info=(exc_type, exc_value, exc_traceback)
        )
    
    def log_exception(self, exception, context=""):
        """
        记录异常信息
        :param exception: 异常对象
        :param context: 上下文信息
        """
        error_msg = f"异常发生: {context}" if context else "异常发生"
        self.logger.error(f"{error_msg} - {str(exception)}", exc_info=True)
    
    def safe_execute(self, func, *args, **kwargs):
        """
        安全执行函数，捕获并记录异常
        :param func: 要执行的函数
        :param args: 位置参数
        :param kwargs: 关键字参数
        :return: 函数执行结果或None
        """
        try:
            return func(*args, **kwargs)
        except Exception as e:
            self.log_exception(e, f"执行函数 {func.__name__}")
            return None

def exception_handler(logger=None):
    """
    异常处理装饰器
    :param logger: 日志器实例
    :return: 装饰器函数
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if logger:
                    logger.error(f"函数 {func.__name__} 执行异常: {str(e)}", exc_info=True)
                else:
                    print(f"函数 {func.__name__} 执行异常: {str(e)}")
                    traceback.print_exc()
                return None
        return wrapper
    return decorator

def log_function_call(logger=None):
    """
    函数调用日志装饰器
    :param logger: 日志器实例
    :return: 装饰器函数
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = datetime.now()
            if logger:
                logger.info(f"开始执行函数: {func.__name__}")
            
            try:
                result = func(*args, **kwargs)
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds()
                
                if logger:
                    logger.info(f"函数 {func.__name__} 执行完成，耗时: {duration:.3f}秒")
                
                return result
            except Exception as e:
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds()
                
                if logger:
                    logger.error(f"函数 {func.__name__} 执行失败，耗时: {duration:.3f}秒，错误: {str(e)}", exc_info=True)
                
                raise
        return wrapper
    return decorator

# 创建全局日志管理器
wechat_logger = WeChatLogger()
logger = wechat_logger.get_logger()
exception_handler_instance = ExceptionHandler(logger)

# 设置全局异常处理
sys.excepthook = exception_handler_instance.handle_exception

# 导出常用的日志函数
def log_info(message, module_name=None):
    """记录信息日志"""
    if module_name:
        module_logger = wechat_logger.get_logger(module_name)
        module_logger.info(message)
    else:
        logger.info(message)

def log_warning(message, module_name=None):
    """记录警告日志"""
    if module_name:
        module_logger = wechat_logger.get_logger(module_name)
        module_logger.warning(message)
    else:
        logger.warning(message)

def log_error(message, module_name=None, exc_info=False):
    """记录错误日志"""
    if module_name:
        module_logger = wechat_logger.get_logger(module_name)
        module_logger.error(message, exc_info=exc_info)
    else:
        logger.error(message, exc_info=exc_info)

def log_debug(message, module_name=None):
    """记录调试日志"""
    if module_name:
        module_logger = wechat_logger.get_logger(module_name)
        module_logger.debug(message)
    else:
        logger.debug(message)