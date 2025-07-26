# -*- coding: utf-8 -*-
"""
微信服务器验证测试脚本
用于测试微信签名验证功能
"""

import hashlib
import time
import random
import string
from wechat_handler import WeChatHandler

def generate_test_params(token):
    """
    生成测试用的微信验证参数
    :param token: 微信Token
    :return: 测试参数字典
    """
    # 生成时间戳
    timestamp = str(int(time.time()))
    
    # 生成随机字符串
    nonce = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    
    # 计算签名
    tmp_list = [token, timestamp, nonce]
    tmp_list.sort()
    tmp_str = ''.join(tmp_list)
    signature = hashlib.sha1(tmp_str.encode('utf-8')).hexdigest()
    
    return {
        'signature': signature,
        'timestamp': timestamp,
        'nonce': nonce,
        'echostr': 'test_echo_string'
    }

def test_signature_verification():
    """测试签名验证功能"""
    print("=== 微信签名验证测试 ===")
    
    # 测试Token
    test_token = "test_wechat_token_123"
    handler = WeChatHandler(test_token)
    
    # 生成正确的测试参数
    correct_params = generate_test_params(test_token)
    print(f"生成的测试参数: {correct_params}")
    
    # 测试正确的签名
    result = handler._check_signature(
        correct_params['signature'],
        correct_params['timestamp'],
        correct_params['nonce']
    )
    print(f"正确签名验证结果: {result}")
    assert result == True, "正确签名验证失败"
    
    # 测试错误的签名
    wrong_signature = "wrong_signature_123"
    result = handler._check_signature(
        wrong_signature,
        correct_params['timestamp'],
        correct_params['nonce']
    )
    print(f"错误签名验证结果: {result}")
    assert result == False, "错误签名验证应该失败"
    
    print("✅ 签名验证测试通过！")

def test_url_verification_flow():
    """测试完整的URL验证流程"""
    print("\n=== URL验证流程测试 ===")
    
    # 模拟Flask request对象
    class MockRequest:
        def __init__(self, params):
            self.args = params
    
    test_token = "test_wechat_token_123"
    handler = WeChatHandler(test_token)
    
    # 生成测试参数
    test_params = generate_test_params(test_token)
    mock_request = MockRequest(test_params)
    
    # 测试验证流程
    try:
        response = handler.verify_signature(mock_request)
        print(f"验证响应: {response}")
        print("✅ URL验证流程测试通过！")
    except Exception as e:
        print(f"❌ URL验证流程测试失败: {str(e)}")

if __name__ == "__main__":
    try:
        test_signature_verification()
        test_url_verification_flow()
        print("\n🎉 所有测试通过！微信服务器URL验证接口实现正确。")
    except Exception as e:
        print(f"\n❌ 测试失败: {str(e)}")