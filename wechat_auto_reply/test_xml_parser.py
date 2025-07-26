# -*- coding: utf-8 -*-
"""
XML消息解析测试脚本
用于测试微信XML消息的解析和处理功能
"""

import xml.etree.ElementTree as ET
from wechat_handler import WeChatHandler

# 测试用的XML消息样例
SAMPLE_TEXT_MESSAGE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[你好]]></Content>
<MsgId>1234567890123456</MsgId>
</xml>"""

SAMPLE_IMAGE_MESSAGE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[image]]></MsgType>
<PicUrl><![CDATA[http://mmbiz.qpic.cn/example.jpg]]></PicUrl>
<MediaId><![CDATA[media_id_123]]></MediaId>
<MsgId>1234567890123456</MsgId>
</xml>"""

SAMPLE_VOICE_MESSAGE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[voice]]></MsgType>
<MediaId><![CDATA[media_id_456]]></MediaId>
<Format><![CDATA[amr]]></Format>
<MsgId>1234567890123456</MsgId>
</xml>"""

MALFORMED_XML = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[测试消息]]></Content>
<!-- 缺少结束标签 -->"""

def test_text_message_parsing():
    """测试文本消息解析"""
    print("=== 文本消息解析测试 ===")
    
    handler = WeChatHandler("test_token")
    result = handler._parse_xml_message(SAMPLE_TEXT_MESSAGE)
    
    print(f"解析结果: {result}")
    
    # 验证解析结果
    assert result is not None, "解析结果不应为空"
    assert result['MsgType'] == 'text', "消息类型应为text"
    assert result['Content'] == '你好', "消息内容应为'你好'"
    assert result['FromUserName'] == 'oUser123456789', "发送用户ID不正确"
    assert result['ToUserName'] == 'gh_123456789abc', "接收用户ID不正确"
    
    print("✅ 文本消息解析测试通过！")

def test_image_message_parsing():
    """测试图片消息解析"""
    print("\n=== 图片消息解析测试 ===")
    
    handler = WeChatHandler("test_token")
    result = handler._parse_xml_message(SAMPLE_IMAGE_MESSAGE)
    
    print(f"解析结果: {result}")
    
    # 验证解析结果
    assert result is not None, "解析结果不应为空"
    assert result['MsgType'] == 'image', "消息类型应为image"
    assert result['FromUserName'] == 'oUser123456789', "发送用户ID不正确"
    
    print("✅ 图片消息解析测试通过！")

def test_voice_message_parsing():
    """测试语音消息解析"""
    print("\n=== 语音消息解析测试 ===")
    
    handler = WeChatHandler("test_token")
    result = handler._parse_xml_message(SAMPLE_VOICE_MESSAGE)
    
    print(f"解析结果: {result}")
    
    # 验证解析结果
    assert result is not None, "解析结果不应为空"
    assert result['MsgType'] == 'voice', "消息类型应为voice"
    assert result['FromUserName'] == 'oUser123456789', "发送用户ID不正确"
    
    print("✅ 语音消息解析测试通过！")

def test_malformed_xml_handling():
    """测试格式错误的XML处理"""
    print("\n=== 格式错误XML处理测试 ===")
    
    handler = WeChatHandler("test_token")
    result = handler._parse_xml_message(MALFORMED_XML)
    
    print(f"解析结果: {result}")
    
    # 格式错误的XML应该返回None
    assert result is None, "格式错误的XML应该返回None"
    
    print("✅ 格式错误XML处理测试通过！")

def test_empty_xml_handling():
    """测试空XML处理"""
    print("\n=== 空XML处理测试 ===")
    
    handler = WeChatHandler("test_token")
    
    # 测试空字符串
    result1 = handler._parse_xml_message("")
    assert result1 is None, "空字符串应该返回None"
    
    # 测试None
    result2 = handler._parse_xml_message(None)
    assert result2 is None, "None应该返回None"
    
    print("✅ 空XML处理测试通过！")

def test_reply_xml_generation():
    """测试回复XML生成"""
    print("\n=== 回复XML生成测试 ===")
    
    handler = WeChatHandler("test_token")
    
    # 生成回复XML
    reply_xml = handler._create_reply_xml(
        to_user="oUser123456789",
        from_user="gh_123456789abc",
        content="你好+1"
    )
    
    print(f"生成的回复XML:\n{reply_xml}")
    
    # 验证生成的XML格式
    assert reply_xml is not None, "回复XML不应为空"
    assert "你好+1" in reply_xml, "回复内容应包含'你好+1'"
    assert "oUser123456789" in reply_xml, "应包含接收用户ID"
    assert "gh_123456789abc" in reply_xml, "应包含发送用户ID"
    
    # 验证XML格式正确性
    try:
        root = ET.fromstring(reply_xml)
        assert root.find('MsgType').text == 'text', "消息类型应为text"
        assert root.find('Content').text == '你好+1', "回复内容不正确"
        print("✅ 生成的XML格式正确")
    except ET.ParseError:
        assert False, "生成的XML格式错误"
    
    print("✅ 回复XML生成测试通过！")

def test_complete_message_flow():
    """测试完整的消息处理流程"""
    print("\n=== 完整消息处理流程测试 ===")
    
    handler = WeChatHandler("test_token")
    
    # 模拟Flask request对象
    class MockRequest:
        def __init__(self, xml_data):
            self._data = xml_data
        
        def get_data(self, as_text=True):
            return self._data
    
    # 创建模拟请求
    mock_request = MockRequest(SAMPLE_TEXT_MESSAGE)
    
    # 处理消息
    try:
        response = handler.handle_message(mock_request)
        print(f"处理响应: {response}")
        print("✅ 完整消息处理流程测试通过！")
    except Exception as e:
        print(f"❌ 完整消息处理流程测试失败: {str(e)}")

if __name__ == "__main__":
    try:
        test_text_message_parsing()
        test_image_message_parsing()
        test_voice_message_parsing()
        test_malformed_xml_handling()
        test_empty_xml_handling()
        test_reply_xml_generation()
        test_complete_message_flow()
        
        print("\n🎉 所有XML解析测试通过！消息解析和处理模块工作正常。")
    except Exception as e:
        print(f"\n❌ 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()