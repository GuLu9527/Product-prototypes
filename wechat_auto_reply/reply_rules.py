# -*- coding: utf-8 -*-
"""
自动回复规则管理器
负责管理和执行各种自动回复规则
"""

import re
import logging
from typing import Optional, Dict, List, Callable

logger = logging.getLogger(__name__)

class ReplyRule:
    """回复规则类"""
    
    def __init__(self, name: str, pattern: str, reply: str, rule_type: str = 'exact'):
        """
        初始化回复规则
        :param name: 规则名称
        :param pattern: 匹配模式
        :param reply: 回复内容
        :param rule_type: 规则类型 (exact/contains/regex/function)
        """
        self.name = name
        self.pattern = pattern
        self.reply = reply
        self.rule_type = rule_type
        
        # 如果是正则表达式，预编译
        if rule_type == 'regex':
            try:
                self.compiled_pattern = re.compile(pattern, re.IGNORECASE)
            except re.error as e:
                logger.error(f"正则表达式编译失败: {pattern}, 错误: {str(e)}")
                self.compiled_pattern = None

class ReplyRuleManager:
    """回复规则管理器"""
    
    def __init__(self):
        """初始化规则管理器"""
        self.rules: List[ReplyRule] = []
        self.function_rules: Dict[str, Callable] = {}
        self._load_default_rules()
    
    def _load_default_rules(self):
        """加载默认回复规则"""
        # 精确匹配规则
        self.add_rule("问候回复", "你好", "你好+1", "exact")
        self.add_rule("再见回复", "再见", "再见，期待下次见面！", "exact")
        self.add_rule("帮助回复", "帮助", "我是智能客服机器人，可以回答您的问题。发送'你好'试试看！", "exact")
        
        # 包含匹配规则
        self.add_rule("天气询问", "天气", "抱歉，我暂时无法提供天气信息，请查看天气预报应用。", "contains")
        self.add_rule("时间询问", "时间", "请查看您的设备时间，或者说'现在几点'获取当前时间。", "contains")
        
        # 正则表达式规则
        self.add_rule("电话号码", r"1[3-9]\d{9}", "检测到电话号码，请注意保护个人隐私信息。", "regex")
        self.add_rule("邮箱地址", r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "检测到邮箱地址，请注意保护个人隐私信息。", "regex")
        
        # 注册函数规则
        self.register_function_rule("智能问答", self._smart_qa_handler)
        
        logger.info(f"已加载 {len(self.rules)} 条默认回复规则")
    
    def add_rule(self, name: str, pattern: str, reply: str, rule_type: str = 'exact'):
        """
        添加回复规则
        :param name: 规则名称
        :param pattern: 匹配模式
        :param reply: 回复内容
        :param rule_type: 规则类型
        """
        rule = ReplyRule(name, pattern, reply, rule_type)
        self.rules.append(rule)
        logger.info(f"添加回复规则: {name} ({rule_type})")
    
    def register_function_rule(self, name: str, handler: Callable):
        """
        注册函数规则
        :param name: 规则名称
        :param handler: 处理函数
        """
        self.function_rules[name] = handler
        logger.info(f"注册函数规则: {name}")
    
    def find_reply(self, user_content: str) -> Optional[str]:
        """
        根据用户输入查找匹配的回复
        :param user_content: 用户输入内容
        :return: 回复内容或None
        """
        if not user_content:
            return None
        
        user_content = user_content.strip()
        logger.info(f"查找回复规则，用户输入: {user_content}")
        
        # 按优先级顺序检查规则
        for rule in self.rules:
            reply = self._check_rule(rule, user_content)
            if reply:
                logger.info(f"匹配到规则: {rule.name}")
                return reply
        
        # 检查函数规则
        for name, handler in self.function_rules.items():
            try:
                reply = handler(user_content)
                if reply:
                    logger.info(f"匹配到函数规则: {name}")
                    return reply
            except Exception as e:
                logger.error(f"函数规则 {name} 执行失败: {str(e)}")
        
        logger.info("未找到匹配的回复规则")
        return None
    
    def _check_rule(self, rule: ReplyRule, user_content: str) -> Optional[str]:
        """
        检查单个规则是否匹配
        :param rule: 回复规则
        :param user_content: 用户输入
        :return: 回复内容或None
        """
        try:
            if rule.rule_type == 'exact':
                # 精确匹配
                if user_content == rule.pattern:
                    return rule.reply
            
            elif rule.rule_type == 'contains':
                # 包含匹配
                if rule.pattern.lower() in user_content.lower():
                    return rule.reply
            
            elif rule.rule_type == 'regex':
                # 正则表达式匹配
                if rule.compiled_pattern and rule.compiled_pattern.search(user_content):
                    return rule.reply
            
            return None
            
        except Exception as e:
            logger.error(f"规则检查失败 {rule.name}: {str(e)}")
            return None
    
    def _smart_qa_handler(self, user_content: str) -> Optional[str]:
        """
        智能问答处理函数
        :param user_content: 用户输入
        :return: 回复内容或None
        """
        # 简单的智能问答逻辑
        content_lower = user_content.lower()
        
        # 问候相关
        greetings = ['hi', 'hello', '您好', '你好啊', '早上好', '下午好', '晚上好']
        if any(greeting in content_lower for greeting in greetings):
            return "您好！很高兴为您服务，有什么可以帮助您的吗？"
        
        # 感谢相关
        thanks = ['谢谢', '感谢', 'thank', '多谢']
        if any(thank in content_lower for thank in thanks):
            return "不客气！很高兴能帮助到您。"
        
        # 询问功能
        functions = ['功能', '能做什么', '怎么用', '使用方法']
        if any(func in content_lower for func in functions):
            return "我是智能客服机器人，可以：\n1. 回答常见问题\n2. 提供帮助信息\n3. 进行简单对话\n发送'帮助'了解更多功能。"
        
        return None
    
    def get_rules_info(self) -> Dict:
        """
        获取规则信息
        :return: 规则信息字典
        """
        return {
            'total_rules': len(self.rules),
            'function_rules': len(self.function_rules),
            'rules': [
                {
                    'name': rule.name,
                    'pattern': rule.pattern,
                    'type': rule.rule_type,
                    'reply_preview': rule.reply[:50] + '...' if len(rule.reply) > 50 else rule.reply
                }
                for rule in self.rules
            ]
        }
    
    def remove_rule(self, name: str) -> bool:
        """
        删除规则
        :param name: 规则名称
        :return: 是否删除成功
        """
        for i, rule in enumerate(self.rules):
            if rule.name == name:
                del self.rules[i]
                logger.info(f"删除规则: {name}")
                return True
        
        if name in self.function_rules:
            del self.function_rules[name]
            logger.info(f"删除函数规则: {name}")
            return True
        
        return False
    
    def clear_rules(self):
        """清空所有规则"""
        self.rules.clear()
        self.function_rules.clear()
        logger.info("已清空所有回复规则")
    
    def reload_default_rules(self):
        """重新加载默认规则"""
        self.clear_rules()
        self._load_default_rules()
        logger.info("已重新加载默认回复规则")

# 全局规则管理器实例
reply_manager = ReplyRuleManager()