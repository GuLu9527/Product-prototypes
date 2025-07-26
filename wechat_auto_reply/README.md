# 微信公众号自动回复系统

一个基于Python Flask框架开发的微信公众号自动回复系统，实现智能消息处理功能。

## 功能特性

- ✅ 微信服务器URL验证和签名校验
- ✅ 接收并解析XML格式的用户消息
- ✅ 智能内容匹配和关键词识别
- ✅ 自动生成个性化回复内容
- ✅ 完善的异常处理和日志记录
- ✅ 支持扩展更多自动回复规则

## 技术架构

- **后端框架**: Python 3.7+ + Flask
- **XML处理**: xml.etree.ElementTree
- **加密验证**: hashlib (微信签名校验)
- **日志系统**: Python logging模块
- **部署方案**: 支持本地开发和云服务器部署

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 设置微信公众号Token
export WECHAT_TOKEN=your_wechat_token_here

# 可选：设置Flask运行参数
export FLASK_HOST=0.0.0.0
export FLASK_PORT=5000
export FLASK_DEBUG=True
```

### 3. 运行应用

```bash
python app.py
```

应用将在 `http://localhost:5000` 启动。

### 4. 微信公众号配置

1. 登录微信公众平台
2. 进入"开发" -> "基本配置"
3. 设置服务器URL为: `http://your-domain.com/wechat`
4. 设置Token为环境变量中配置的值
5. 选择消息加解密方式（建议选择明文模式）
6. 提交配置并启用

## 接口说明

### 微信接口 `/wechat`

- **GET请求**: 用于微信服务器验证
- **POST请求**: 用于接收和处理用户消息

### 健康检查 `/health`

- **GET请求**: 返回系统运行状态

## 自动回复规则

当前支持的自动回复规则：

| 用户输入 | 系统回复 |
|---------|---------|
| 你好    | 你好+1  |

## 扩展开发

### 添加新的回复规则

在 `wechat_handler.py` 的 `_generate_reply` 方法中添加新的匹配规则：

```python
def _generate_reply(self, user_content):
    if user_content == '你好':
        return '你好+1'
    elif user_content == '帮助':
        return '这是帮助信息'
    # 添加更多规则...
    
    return None  # 不匹配时不回复
```

### 支持更复杂的消息类型

系统当前只处理文本消息，可以扩展支持图片、语音等其他消息类型。

## 部署说明

### 本地开发

直接运行 `python app.py` 即可启动开发服务器。

### 生产环境部署

推荐使用 Gunicorn + Nginx 的方式部署：

```bash
# 安装Gunicorn
pip install gunicorn

# 启动应用
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 日志说明

系统会自动记录运行日志到 `wechat_auto_reply.log` 文件中，包括：

- 微信服务器验证记录
- 用户消息接收和处理记录
- 系统错误和异常信息
- 回复消息生成记录

## 注意事项

1. 确保服务器能够接收微信服务器的POST请求
2. 微信公众号的Token必须与代码中配置的一致
3. 服务器URL必须支持HTTPS（生产环境）
4. 响应时间不能超过5秒，否则微信服务器会重试

## 故障排除

### 常见问题

1. **签名验证失败**
   - 检查Token配置是否正确
   - 确认服务器时间与标准时间同步

2. **消息接收不到**
   - 检查服务器URL是否可访问
   - 查看日志文件确认错误信息

3. **回复消息格式错误**
   - 确认XML格式正确
   - 检查Content-Type设置

## 许可证

MIT License