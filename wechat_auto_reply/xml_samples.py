# -*- coding: utf-8 -*-
"""
微信XML消息样例
包含各种类型的微信消息XML格式示例
"""

# 文本消息样例
TEXT_MESSAGE_SAMPLE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[你好]]></Content>
<MsgId>1234567890123456</MsgId>
</xml>"""

# 图片消息样例
IMAGE_MESSAGE_SAMPLE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[image]]></MsgType>
<PicUrl><![CDATA[http://mmbiz.qpic.cn/example.jpg]]></PicUrl>
<MediaId><![CDATA[media_id_123]]></MediaId>
<MsgId>1234567890123456</MsgId>
</xml>"""

# 语音消息样例
VOICE_MESSAGE_SAMPLE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[voice]]></MsgType>
<MediaId><![CDATA[media_id_456]]></MediaId>
<Format><![CDATA[amr]]></Format>
<Recognition><![CDATA[语音识别结果]]></Recognition>
<MsgId>1234567890123456</MsgId>
</xml>"""

# 视频消息样例
VIDEO_MESSAGE_SAMPLE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[video]]></MsgType>
<MediaId><![CDATA[media_id_789]]></MediaId>
<ThumbMediaId><![CDATA[thumb_media_id]]></ThumbMediaId>
<MsgId>1234567890123456</MsgId>
</xml>"""

# 小视频消息样例
SHORT_VIDEO_MESSAGE_SAMPLE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[shortvideo]]></MsgType>
<MediaId><![CDATA[media_id_101]]></MediaId>
<ThumbMediaId><![CDATA[thumb_media_id_101]]></ThumbMediaId>
<MsgId>1234567890123456</MsgId>
</xml>"""

# 地理位置消息样例
LOCATION_MESSAGE_SAMPLE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[location]]></MsgType>
<Location_X>23.134521</Location_X>
<Location_Y>113.358803</Location_Y>
<Scale>20</Scale>
<Label><![CDATA[位置信息]]></Label>
<MsgId>1234567890123456</MsgId>
</xml>"""

# 链接消息样例
LINK_MESSAGE_SAMPLE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[link]]></MsgType>
<Title><![CDATA[链接标题]]></Title>
<Description><![CDATA[链接描述]]></Description>
<Url><![CDATA[http://example.com]]></Url>
<MsgId>1234567890123456</MsgId>
</xml>"""

# 事件消息样例 - 关注事件
SUBSCRIBE_EVENT_SAMPLE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[event]]></MsgType>
<Event><![CDATA[subscribe]]></Event>
</xml>"""

# 事件消息样例 - 取消关注事件
UNSUBSCRIBE_EVENT_SAMPLE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[event]]></MsgType>
<Event><![CDATA[unsubscribe]]></Event>
</xml>"""

# 事件消息样例 - 点击菜单事件
CLICK_EVENT_SAMPLE = """<xml>
<ToUserName><![CDATA[gh_123456789abc]]></ToUserName>
<FromUserName><![CDATA[oUser123456789]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[event]]></MsgType>
<Event><![CDATA[CLICK]]></Event>
<EventKey><![CDATA[MENU_KEY_1]]></EventKey>
</xml>"""

# 回复消息样例 - 文本回复
TEXT_REPLY_SAMPLE = """<xml>
<ToUserName><![CDATA[oUser123456789]]></ToUserName>
<FromUserName><![CDATA[gh_123456789abc]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[你好+1]]></Content>
</xml>"""

# 回复消息样例 - 图文回复
NEWS_REPLY_SAMPLE = """<xml>
<ToUserName><![CDATA[oUser123456789]]></ToUserName>
<FromUserName><![CDATA[gh_123456789abc]]></FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType><![CDATA[news]]></MsgType>
<ArticleCount>1</ArticleCount>
<Articles>
<item>
<Title><![CDATA[标题]]></Title>
<Description><![CDATA[描述]]></Description>
<PicUrl><![CDATA[http://example.com/pic.jpg]]></PicUrl>
<Url><![CDATA[http://example.com]]></Url>
</item>
</Articles>
</xml>"""

# 消息类型映射
MESSAGE_TYPES = {
    'text': '文本消息',
    'image': '图片消息',
    'voice': '语音消息',
    'video': '视频消息',
    'shortvideo': '小视频消息',
    'location': '地理位置消息',
    'link': '链接消息',
    'event': '事件消息'
}

# 事件类型映射
EVENT_TYPES = {
    'subscribe': '关注事件',
    'unsubscribe': '取消关注事件',
    'CLICK': '菜单点击事件',
    'VIEW': '菜单跳转事件'
}

def get_message_type_name(msg_type):
    """获取消息类型中文名称"""
    return MESSAGE_TYPES.get(msg_type, '未知消息类型')

def get_event_type_name(event_type):
    """获取事件类型中文名称"""
    return EVENT_TYPES.get(event_type, '未知事件类型')