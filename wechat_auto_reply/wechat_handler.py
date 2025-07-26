# -*- coding: utf-8 -*-
"""
微信消息处理器
负责处理微信服务器验证、消息解析和自动回复逻辑
"""

import hashlib
import xml.etree.ElementTree as ET
import time
from flask import make_response
from reply_rules import reply_manager
from logger_config import wechat_logger, exception_handler, log_function_call

logger = wechat_logger.get_logger('wechat_handler')

class WeChatHandler:
    """微信消息处理类"""
    
    def __init__(self, token):
        """
        初始化微信处理器
        :param token: 微信公众号Token
        """
        self.token = token
        
    @exception_handler(logger)
    @log_function_call(logger)
    def verify_signature(self, request):
        """
        验证微信服务器签名
        :param request: Flask请求对象
        :return: 验证结果
        """
        try:
            # 获取微信服务器发送的参数
            signature = request.args.get('signature', '')
            timestamp = request.args.get('timestamp', '')
            nonce = request.args.get('nonce', '')
            echostr = request.args.get('echostr', '')
            
            logger.info(f"收到微信验证请求: signature={signature[:10]}..., timestamp={timestamp}, nonce={nonce}")
            
            # 验证签名
            if self._check_signature(signature, timestamp, nonce):
                logger.info("微信签名验证成功")
                return make_response(echostr)
            else:
                logger.warning("微信签名验证失败")
                return make_response("签名验证失败", 403)
                
        except Exception as e:
            logger.error(f"验证微信签名时发生错误: {str(e)}", exc_info=True)
            return make_response("验证失败", 500)
    
    def _check_signature(self, signature, timestamp, nonce):
        """
        检查微信签名
        :param signature: 微信签名
        :param timestamp: 时间戳
        :param nonce: 随机数
        :return: 验证结果
        """
        try:
            # 将token、timestamp、nonce三个参数进行字典序排序
            tmp_list = [self.token, timestamp, nonce]
            tmp_list.sort()
            
            # 将三个参数字符串拼接成一个字符串进行sha1加密
            tmp_str = ''.join(tmp_list)
            hash_obj = hashlib.sha1(tmp_str.encode('utf-8'))
            hash_code = hash_obj.hexdigest()
            
            # 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
            return hash_code == signature
            
        except Exception as e:
            logger.error(f"检查签名时发生错误: {str(e)}")
            return False
    
    @exception_handler(logger)
    @log_function_call(logger)
    def handle_message(self, request):
        """
        处理用户消息
        :param request: Flask请求对象
        :return: 回复消息
        """
        try:
            # 获取POST数据
            xml_data = request.get_data(as_text=True)
            logger.info(f"收到用户消息，长度: {len(xml_data)} 字符")
            logger.debug(f"消息内容: {xml_data}")
            
            # 解析XML消息
            msg_dict = self._parse_xml_message(xml_data)
            if not msg_dict:
                logger.error("消息解析失败")
                return make_response("success")
            
            # 处理消息并生成回复
            reply_msg = self._process_message(msg_dict)
            
            if reply_msg:
                logger.info("成功生成回复消息")
                logger.debug(f"回复内容: {reply_msg}")
                return make_response(reply_msg, 200, {'Content-Type': 'application/xml'})
            else:
                logger.info("未生成回复消息")
                return make_response("success")
                
        except Exception as e:
            logger.error(f"处理用户消息时发生错误: {str(e)}", exc_info=True)
            return make_response("success")
    
    def _parse_xml_message(self, xml_data):
        """
        解析XML消息
        :param xml_data: XML数据
        :return: 消息字典
        """
        try:
            if not xml_data:
                return None
                
            # 解析XML
            root = ET.fromstring(xml_data)
            
            # 提取消息信息
            msg_dict = {
                'ToUserName': root.find('ToUserName').text if root.find('ToUserName') is not None else '',
                'FromUserName': root.find('FromUserName').text if root.find('FromUserName') is not None else '',
                'CreateTime': root.find('CreateTime').text if root.find('CreateTime') is not None else '',
                'MsgType': root.find('MsgType').text if root.find('MsgType') is not None else '',
                'Content': root.find('Content').text if root.find('Content') is not None else '',
                'MsgId': root.find('MsgId').text if root.find('MsgId') is not None else ''
            }
            
            logger.info(f"解析消息成功: {msg_dict}")
            return msg_dict
            
        except ET.ParseError as e:
            logger.error(f"XML解析错误: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"解析消息时发生错误: {str(e)}")
            return None
    
    def _process_message(self, msg_dict):
        """
        处理消息并生成回复
        :param msg_dict: 消息字典
        :return: 回复消息XML
        """
        try:
            # 只处理文本消息
            if msg_dict.get('MsgType') != 'text':
                logger.info(f"忽略非文本消息，消息类型: {msg_dict.get('MsgType')}")
                return None
            
            # 获取用户发送的内容
            user_content = msg_dict.get('Content', '').strip()
            logger.info(f"用户发送内容: {user_content}")
            
            # 内容匹配和回复逻辑
            reply_content = self._generate_reply(user_content)
            
            if reply_content:
                # 生成回复消息XML
                reply_xml = self._create_reply_xml(
                    to_user=msg_dict.get('FromUserName'),
                    from_user=msg_dict.get('ToUserName'),
                    content=reply_content
                )
                return reply_xml
            
            return None
            
        except Exception as e:
            logger.error(f"处理消息时发生错误: {str(e)}")
            return None
    
    def _generate_reply(self, user_content):
        """
        根据用户内容生成回复
        :param user_content: 用户发送的内容
        :return: 回复内容
        """
        try:
            # 使用回复规则管理器查找匹配的回复
            reply = reply_manager.find_reply(user_content)
            
            if reply:
                logger.info(f"生成回复: {reply}")
                return reply
            
            # 默认不回复
            logger.info(f"未匹配到关键词: {user_content}")
            return None
            
        except Exception as e:
            logger.error(f"生成回复时发生错误: {str(e)}")
            return None
    
    def _create_reply_xml(self, to_user, from_user, content):
        """
        创建回复消息XML
        :param to_user: 接收用户
        :param from_user: 发送用户（公众号）
        :param content: 回复内容
        :return: XML字符串
        """
        try:
            reply_xml = f"""<xml>
<ToUserName><![CDATA[{to_user}]]></ToUserName>
<FromUserName><![CDATA[{from_user}]]></FromUserName>
<CreateTime>{int(time.time())}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[{content}]]></Content>
</xml>"""
            return reply_xml
            
        except Exception as e:
            logger.error(f"创建回复XML时发生错误: {str(e)}")
            return None