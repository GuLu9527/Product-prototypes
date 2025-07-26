# 微信公众号自动回复系统 - 快速启动指南

## 🚀 快速开始

### 1. 环境准备

确保您的系统已安装：
- Python 3.7+
- pip包管理器

### 2. 安装依赖

```bash
# 进入项目目录
cd wechat_auto_reply

# 安装依赖包
pip install -r requirements.txt
```

### 3. 配置微信Token

```bash
# 设置环境变量（Linux/Mac）
export WECHAT_TOKEN=your_wechat_token_here

# 设置环境变量（Windows）
set WECHAT_TOKEN=your_wechat_token_here
```

### 4. 运行系统

```bash
# 方式1：直接运行
python app.py

# 方式2：使用启动脚本
python run.py

# 方式3：使用Flask命令
flask run --host=0.0.0.0 --port=5000
```

### 5. 验证运行

访问健康检查接口：
```bash
curl http://localhost:5000/health
```

应该返回：
```json
{"status": "ok", "message": "微信公众号自动回复系统运行正常"}
```

## 🧪 运行测试

### 运行所有测试
```bash
python test_all.py
```

### 运行单个测试模块
```bash
# 测试签名验证
python test_verification.py

# 测试XML解析
python test_xml_parser.py

# 测试回复规则
python test_reply_rules.py

# 测试异常处理
python test_exception_handling.py
```

## 🔧 微信公众号配置

### 1. 登录微信公众平台
访问：https://mp.weixin.qq.com/

### 2. 配置服务器
1. 进入"开发" -> "基本配置"
2. 设置服务器URL：`http://your-domain.com/wechat`
3. 设置Token：与环境变量中的WECHAT_TOKEN一致
4. 选择消息加解密方式：明文模式
5. 点击"提交"进行验证

### 3. 测试自动回复
向公众号发送"你好"，应该收到"你好+1"的回复。

## 📦 生产环境部署

### 使用部署脚本
```bash
# 生成部署配置
python deploy.py

# 执行系统部署（需要root权限）
sudo ./deploy.sh
```

### 手动部署步骤

1. **安装Gunicorn**
```bash
pip install gunicorn
```

2. **启动应用**
```bash
gunicorn -c gunicorn.conf.py app:app
```

3. **配置Nginx**
```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/wechat_auto_reply
sudo ln -s /etc/nginx/sites-available/wechat_auto_reply /etc/nginx/sites-enabled/

# 重启Nginx
sudo systemctl restart nginx
```

4. **配置进程管理**
```bash
# 使用Supervisor
sudo cp supervisor.conf /etc/supervisor/conf.d/
sudo supervisorctl reread
sudo supervisorctl update

# 或使用systemd
sudo cp wechat-auto-reply.service /etc/systemd/system/
sudo systemctl enable wechat-auto-reply
sudo systemctl start wechat-auto-reply
```

## 🔍 故障排除

### 常见问题

1. **签名验证失败**
   - 检查Token配置是否正确
   - 确认服务器时间同步

2. **无法接收消息**
   - 检查服务器URL是否可访问
   - 查看日志文件：`tail -f wechat_auto_reply.log`

3. **回复消息不显示**
   - 确认XML格式正确
   - 检查Content-Type设置

### 日志查看
```bash
# 查看应用日志
tail -f wechat_auto_reply.log

# 查看错误日志
tail -f error.log

# 查看Nginx日志
sudo tail -f /var/log/nginx/wechat_auto_reply_access.log
```

## 📝 自定义回复规则

编辑 `reply_rules.py` 文件，在 `_load_default_rules` 方法中添加新规则：

```python
# 精确匹配
self.add_rule("新规则", "关键词", "回复内容", "exact")

# 包含匹配
self.add_rule("包含规则", "关键词", "回复内容", "contains")

# 正则表达式
self.add_rule("正则规则", r"正则表达式", "回复内容", "regex")
```

## 🛡️ 安全建议

1. **使用HTTPS**：生产环境必须使用HTTPS
2. **设置防火墙**：只开放必要的端口
3. **定期更新**：保持系统和依赖包更新
4. **监控日志**：定期检查异常日志
5. **备份数据**：定期备份配置和日志

## 📞 技术支持

如遇到问题，请：
1. 查看日志文件获取详细错误信息
2. 运行测试脚本验证系统状态
3. 检查微信公众平台的配置

---

更多详细信息请参考 `README.md` 文件。