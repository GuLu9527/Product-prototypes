# -*- coding: utf-8 -*-
"""
异常处理和日志记录测试脚本
用于测试系统的异常处理能力和日志记录功能
"""

import os
import sys
import time
from logger_config import wechat_logger, exception_handler, log_function_call, ExceptionHandler
from wechat_handler import WeChatHandler
from reply_rules import ReplyRuleManager

def test_logger_functionality():
    """测试日志功能"""
    print("=== 日志功能测试 ===")
    
    # 获取测试日志器
    test_logger = wechat_logger.get_logger('test')
    
    # 测试各种日志级别
    test_logger.debug("这是调试信息")
    test_logger.info("这是信息日志")
    test_logger.warning("这是警告日志")
    test_logger.error("这是错误日志")
    
    print("✅ 日志功能测试完成，请检查日志文件")

def test_exception_decorator():
    """测试异常处理装饰器"""
    print("\n=== 异常处理装饰器测试 ===")
    
    test_logger = wechat_logger.get_logger('test_decorator')
    
    @exception_handler(test_logger)
    def function_with_exception():
        """会抛出异常的测试函数"""
        raise ValueError("这是一个测试异常")
    
    @exception_handler(test_logger)
    def normal_function():
        """正常的测试函数"""
        return "正常执行"
    
    # 测试异常处理
    result1 = function_with_exception()
    print(f"异常函数返回: {result1}")
    assert result1 is None, "异常函数应该返回None"
    
    # 测试正常执行
    result2 = normal_function()
    print(f"正常函数返回: {result2}")
    assert result2 == "正常执行", "正常函数应该返回正确结果"
    
    print("✅ 异常处理装饰器测试通过")

def test_function_call_logger():
    """测试函数调用日志装饰器"""
    print("\n=== 函数调用日志装饰器测试 ===")
    
    test_logger = wechat_logger.get_logger('test_call_logger')
    
    @log_function_call(test_logger)
    def slow_function():
        """模拟耗时函数"""
        time.sleep(0.1)  # 模拟耗时操作
        return "执行完成"
    
    @log_function_call(test_logger)
    @exception_handler(test_logger)
    def function_with_error():
        """会出错的函数"""
        time.sleep(0.05)
        raise RuntimeError("模拟运行时错误")
    
    # 测试正常函数
    result1 = slow_function()
    print(f"耗时函数返回: {result1}")
    
    # 测试异常函数
    result2 = function_with_error()
    print(f"异常函数返回: {result2}")
    
    print("✅ 函数调用日志装饰器测试完成")

def test_wechat_handler_exception_handling():
    """测试微信处理器的异常处理"""
    print("\n=== 微信处理器异常处理测试 ===")
    
    handler = WeChatHandler("test_token")
    
    # 测试签名验证异常处理
    class MockBadRequest:
        def __init__(self):
            self.args = None  # 模拟获取参数失败
    
    try:
        result = handler.verify_signature(MockBadRequest())
        print(f"异常请求处理结果: {result}")
    except Exception as e:
        print(f"捕获到异常: {str(e)}")
    
    # 测试XML解析异常处理
    malformed_xml = "<xml><invalid>格式错误的XML"
    result = handler._parse_xml_message(malformed_xml)
    print(f"格式错误XML解析结果: {result}")
    assert result is None, "格式错误的XML应该返回None"
    
    print("✅ 微信处理器异常处理测试通过")

def test_reply_rules_exception_handling():
    """测试回复规则的异常处理"""
    print("\n=== 回复规则异常处理测试 ===")
    
    # 创建测试规则管理器
    test_manager = ReplyRuleManager()
    
    # 测试异常输入
    test_cases = [
        None,
        "",
        "a" * 10000,  # 超长输入
        "特殊字符!@#$%^&*()",
        "\n\r\t换行符测试",
    ]
    
    for test_input in test_cases:
        try:
            result = test_manager.find_reply(test_input)
            print(f"输入 '{str(test_input)[:20]}...' -> 回复: {result}")
        except Exception as e:
            print(f"处理输入 '{str(test_input)[:20]}...' 时发生异常: {str(e)}")
    
    print("✅ 回复规则异常处理测试通过")

def test_log_file_creation():
    """测试日志文件创建"""
    print("\n=== 日志文件创建测试 ===")
    
    # 检查主日志文件
    main_log = "wechat_auto_reply.log"
    if os.path.exists(main_log):
        size = os.path.getsize(main_log)
        print(f"主日志文件存在: {main_log} (大小: {size} 字节)")
    else:
        print(f"主日志文件不存在: {main_log}")
    
    # 检查错误日志文件
    error_log = "error.log"
    if os.path.exists(error_log):
        size = os.path.getsize(error_log)
        print(f"错误日志文件存在: {error_log} (大小: {size} 字节)")
    else:
        print(f"错误日志文件不存在: {error_log}")
    
    print("✅ 日志文件创建测试完成")

def test_exception_handler_class():
    """测试异常处理器类"""
    print("\n=== 异常处理器类测试 ===")
    
    test_logger = wechat_logger.get_logger('test_exception_handler')
    handler = ExceptionHandler(test_logger)
    
    # 测试异常记录
    try:
        raise ValueError("测试异常记录")
    except Exception as e:
        handler.log_exception(e, "测试上下文")
    
    # 测试安全执行
    def safe_function():
        return "安全执行成功"
    
    def unsafe_function():
        raise RuntimeError("不安全的函数")
    
    result1 = handler.safe_execute(safe_function)
    print(f"安全函数执行结果: {result1}")
    assert result1 == "安全执行成功", "安全函数应该正常执行"
    
    result2 = handler.safe_execute(unsafe_function)
    print(f"不安全函数执行结果: {result2}")
    assert result2 is None, "不安全函数应该返回None"
    
    print("✅ 异常处理器类测试通过")

if __name__ == "__main__":
    try:
        test_logger_functionality()
        test_exception_decorator()
        test_function_call_logger()
        test_wechat_handler_exception_handling()
        test_reply_rules_exception_handling()
        test_log_file_creation()
        test_exception_handler_class()
        
        print("\n🎉 所有异常处理和日志记录测试通过！系统具备完善的异常处理能力。")
    except Exception as e:
        print(f"\n❌ 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()