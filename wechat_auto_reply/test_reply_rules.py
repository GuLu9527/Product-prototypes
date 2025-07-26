# -*- coding: utf-8 -*-
"""
回复规则系统测试脚本
用于测试自动回复规则的匹配和处理功能
"""

from reply_rules import ReplyRuleManager, reply_manager

def test_exact_match_rules():
    """测试精确匹配规则"""
    print("=== 精确匹配规则测试 ===")
    
    # 测试默认的"你好"规则
    reply = reply_manager.find_reply("你好")
    print(f"输入'你好' -> 回复: {reply}")
    assert reply == "你好+1", f"期望'你好+1'，实际得到'{reply}'"
    
    # 测试帮助规则
    reply = reply_manager.find_reply("帮助")
    print(f"输入'帮助' -> 回复: {reply}")
    assert reply is not None, "帮助规则应该有回复"
    
    # 测试不匹配的情况
    reply = reply_manager.find_reply("你好啊")
    print(f"输入'你好啊' -> 回复: {reply}")
    # 这个应该被智能问答处理，不是None
    
    print("✅ 精确匹配规则测试通过！")

def test_contains_match_rules():
    """测试包含匹配规则"""
    print("\n=== 包含匹配规则测试 ===")
    
    # 测试天气询问
    reply = reply_manager.find_reply("今天天气怎么样")
    print(f"输入'今天天气怎么样' -> 回复: {reply}")
    assert reply is not None, "天气询问应该有回复"
    
    # 测试时间询问
    reply = reply_manager.find_reply("现在什么时间")
    print(f"输入'现在什么时间' -> 回复: {reply}")
    assert reply is not None, "时间询问应该有回复"
    
    print("✅ 包含匹配规则测试通过！")

def test_regex_match_rules():
    """测试正则表达式匹配规则"""
    print("\n=== 正则表达式匹配规则测试 ===")
    
    # 测试电话号码识别
    reply = reply_manager.find_reply("我的电话是13812345678")
    print(f"输入'我的电话是13812345678' -> 回复: {reply}")
    assert reply is not None, "电话号码应该被识别"
    
    # 测试邮箱地址识别
    reply = reply_manager.find_reply("我的邮箱是test@example.com")
    print(f"输入'我的邮箱是test@example.com' -> 回复: {reply}")
    assert reply is not None, "邮箱地址应该被识别"
    
    print("✅ 正则表达式匹配规则测试通过！")

def test_function_rules():
    """测试函数规则"""
    print("\n=== 函数规则测试 ===")
    
    # 测试问候处理
    reply = reply_manager.find_reply("您好")
    print(f"输入'您好' -> 回复: {reply}")
    assert reply is not None, "问候应该有回复"
    
    # 测试感谢处理
    reply = reply_manager.find_reply("谢谢你")
    print(f"输入'谢谢你' -> 回复: {reply}")
    assert reply is not None, "感谢应该有回复"
    
    # 测试功能询问
    reply = reply_manager.find_reply("你有什么功能")
    print(f"输入'你有什么功能' -> 回复: {reply}")
    assert reply is not None, "功能询问应该有回复"
    
    print("✅ 函数规则测试通过！")

def test_rule_management():
    """测试规则管理功能"""
    print("\n=== 规则管理功能测试 ===")
    
    # 创建新的规则管理器进行测试
    test_manager = ReplyRuleManager()
    
    # 获取规则信息
    info = test_manager.get_rules_info()
    print(f"规则信息: {info}")
    assert info['total_rules'] > 0, "应该有默认规则"
    
    # 添加新规则
    test_manager.add_rule("测试规则", "测试", "这是测试回复", "exact")
    reply = test_manager.find_reply("测试")
    print(f"新规则测试 - 输入'测试' -> 回复: {reply}")
    assert reply == "这是测试回复", "新规则应该生效"
    
    # 删除规则
    success = test_manager.remove_rule("测试规则")
    print(f"删除规则结果: {success}")
    assert success == True, "删除规则应该成功"
    
    # 验证规则已删除
    reply = test_manager.find_reply("测试")
    print(f"删除后测试 - 输入'测试' -> 回复: {reply}")
    # 应该没有精确匹配的回复了
    
    print("✅ 规则管理功能测试通过！")

def test_edge_cases():
    """测试边界情况"""
    print("\n=== 边界情况测试 ===")
    
    # 测试空输入
    reply = reply_manager.find_reply("")
    print(f"空输入 -> 回复: {reply}")
    assert reply is None, "空输入应该返回None"
    
    # 测试None输入
    reply = reply_manager.find_reply(None)
    print(f"None输入 -> 回复: {reply}")
    assert reply is None, "None输入应该返回None"
    
    # 测试很长的输入
    long_input = "这是一个很长很长的输入" * 100
    reply = reply_manager.find_reply(long_input)
    print(f"长输入 -> 回复: {reply}")
    # 应该能正常处理，不会崩溃
    
    # 测试特殊字符
    special_input = "!@#$%^&*()_+-=[]{}|;':\",./<>?"
    reply = reply_manager.find_reply(special_input)
    print(f"特殊字符输入 -> 回复: {reply}")
    # 应该能正常处理，不会崩溃
    
    print("✅ 边界情况测试通过！")

def test_priority_order():
    """测试规则优先级"""
    print("\n=== 规则优先级测试 ===")
    
    # 创建测试管理器
    test_manager = ReplyRuleManager()
    
    # 清空默认规则
    test_manager.clear_rules()
    
    # 添加多个可能匹配的规则
    test_manager.add_rule("规则1", "你好", "回复1", "exact")
    test_manager.add_rule("规则2", "你好", "回复2", "contains")
    
    # 测试优先级（先添加的规则优先级更高）
    reply = test_manager.find_reply("你好")
    print(f"优先级测试 - 输入'你好' -> 回复: {reply}")
    assert reply == "回复1", "应该匹配第一个规则"
    
    print("✅ 规则优先级测试通过！")

if __name__ == "__main__":
    try:
        test_exact_match_rules()
        test_contains_match_rules()
        test_regex_match_rules()
        test_function_rules()
        test_rule_management()
        test_edge_cases()
        test_priority_order()
        
        print("\n🎉 所有回复规则测试通过！消息内容匹配和自动回复逻辑工作正常。")
    except Exception as e:
        print(f"\n❌ 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()