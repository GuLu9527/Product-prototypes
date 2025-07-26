# -*- coding: utf-8 -*-
"""
微信公众号自动回复系统部署脚本
用于生产环境部署配置
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

class DeploymentManager:
    """部署管理器"""
    
    def __init__(self):
        """初始化部署管理器"""
        self.project_root = Path.cwd()
        self.deploy_configs = {
            'gunicorn': {
                'workers': 4,
                'bind': '0.0.0.0:5000',
                'timeout': 30,
                'keepalive': 2,
                'max_requests': 1000,
                'max_requests_jitter': 100
            },
            'nginx': {
                'server_name': 'your-domain.com',
                'port': 80,
                'ssl_port': 443
            }
        }
    
    def check_environment(self):
        """检查部署环境"""
        print("=== 检查部署环境 ===")
        
        # 检查Python版本
        python_version = sys.version_info
        print(f"Python版本: {python_version.major}.{python_version.minor}.{python_version.micro}")
        
        if python_version < (3, 7):
            print("❌ Python版本过低，需要3.7+")
            return False
        
        # 检查必要的系统命令
        required_commands = ['pip', 'python']
        for cmd in required_commands:
            if not shutil.which(cmd):
                print(f"❌ 缺少命令: {cmd}")
                return False
            else:
                print(f"✅ 命令可用: {cmd}")
        
        return True
    
    def install_dependencies(self):
        """安装依赖包"""
        print("\n=== 安装依赖包 ===")
        
        try:
            # 升级pip
            subprocess.run([sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip'], 
                         check=True, capture_output=True, text=True)
            print("✅ pip已升级")
            
            # 安装项目依赖
            subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                         check=True, capture_output=True, text=True)
            print("✅ 项目依赖已安装")
            
            # 安装生产环境依赖
            production_packages = ['gunicorn', 'supervisor']
            for package in production_packages:
                try:
                    subprocess.run([sys.executable, '-m', 'pip', 'install', package], 
                                 check=True, capture_output=True, text=True)
                    print(f"✅ {package} 已安装")
                except subprocess.CalledProcessError:
                    print(f"⚠️  {package} 安装失败，可能需要手动安装")
            
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ 依赖安装失败: {e}")
            return False
    
    def generate_gunicorn_config(self):
        """生成Gunicorn配置文件"""
        print("\n=== 生成Gunicorn配置 ===")
        
        config_content = f"""# Gunicorn配置文件
import multiprocessing

# 服务器套接字
bind = "{self.deploy_configs['gunicorn']['bind']}"
backlog = 2048

# 工作进程
workers = {self.deploy_configs['gunicorn']['workers']}
worker_class = "sync"
worker_connections = 1000
timeout = {self.deploy_configs['gunicorn']['timeout']}
keepalive = {self.deploy_configs['gunicorn']['keepalive']}

# 重启
max_requests = {self.deploy_configs['gunicorn']['max_requests']}
max_requests_jitter = {self.deploy_configs['gunicorn']['max_requests_jitter']}
preload_app = True

# 日志
accesslog = "logs/gunicorn_access.log"
errorlog = "logs/gunicorn_error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# 进程命名
proc_name = "wechat_auto_reply"

# 用户和组
# user = "www-data"
# group = "www-data"

# 临时目录
tmp_upload_dir = None

# SSL (如果需要)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"
"""
        
        try:
            # 创建logs目录
            os.makedirs('logs', exist_ok=True)
            
            with open('gunicorn.conf.py', 'w', encoding='utf-8') as f:
                f.write(config_content)
            print("✅ Gunicorn配置文件已生成: gunicorn.conf.py")
            return True
        except Exception as e:
            print(f"❌ 生成Gunicorn配置失败: {e}")
            return False
    
    def generate_nginx_config(self):
        """生成Nginx配置文件"""
        print("\n=== 生成Nginx配置 ===")
        
        nginx_config = f"""# Nginx配置文件 - 微信公众号自动回复系统
server {{
    listen {self.deploy_configs['nginx']['port']};
    server_name {self.deploy_configs['nginx']['server_name']};
    
    # 日志文件
    access_log /var/log/nginx/wechat_auto_reply_access.log;
    error_log /var/log/nginx/wechat_auto_reply_error.log;
    
    # 微信接口代理
    location /wechat {{
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }}
    
    # 健康检查
    location /health {{
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}
    
    # 静态文件（如果有）
    location /static {{
        alias /path/to/your/static/files;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }}
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}}

# HTTPS配置（推荐用于生产环境）
# server {{
#     listen {self.deploy_configs['nginx']['ssl_port']} ssl http2;
#     server_name {self.deploy_configs['nginx']['server_name']};
#     
#     ssl_certificate /path/to/your/certificate.crt;
#     ssl_certificate_key /path/to/your/private.key;
#     
#     # SSL配置
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
#     ssl_prefer_server_ciphers off;
#     
#     # 其他配置同上...
# }}
"""
        
        try:
            with open('nginx.conf', 'w', encoding='utf-8') as f:
                f.write(nginx_config)
            print("✅ Nginx配置文件已生成: nginx.conf")
            print("   请将配置复制到 /etc/nginx/sites-available/ 并启用")
            return True
        except Exception as e:
            print(f"❌ 生成Nginx配置失败: {e}")
            return False
    
    def generate_supervisor_config(self):
        """生成Supervisor配置文件"""
        print("\n=== 生成Supervisor配置 ===")
        
        supervisor_config = f"""[program:wechat_auto_reply]
command={sys.executable} -m gunicorn -c gunicorn.conf.py app:app
directory={self.project_root}
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/supervisor/wechat_auto_reply.log
stdout_logfile_maxbytes=50MB
stdout_logfile_backups=10
environment=WECHAT_TOKEN="your_wechat_token_here",FLASK_ENV="production"
"""
        
        try:
            with open('supervisor.conf', 'w', encoding='utf-8') as f:
                f.write(supervisor_config)
            print("✅ Supervisor配置文件已生成: supervisor.conf")
            print("   请将配置复制到 /etc/supervisor/conf.d/")
            return True
        except Exception as e:
            print(f"❌ 生成Supervisor配置失败: {e}")
            return False
    
    def generate_systemd_service(self):
        """生成systemd服务文件"""
        print("\n=== 生成systemd服务配置 ===")
        
        service_config = f"""[Unit]
Description=WeChat Auto Reply Service
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory={self.project_root}
Environment=WECHAT_TOKEN=your_wechat_token_here
Environment=FLASK_ENV=production
ExecStart={sys.executable} -m gunicorn -c gunicorn.conf.py app:app
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
"""
        
        try:
            with open('wechat-auto-reply.service', 'w', encoding='utf-8') as f:
                f.write(service_config)
            print("✅ systemd服务文件已生成: wechat-auto-reply.service")
            print("   请将文件复制到 /etc/systemd/system/")
            return True
        except Exception as e:
            print(f"❌ 生成systemd服务配置失败: {e}")
            return False
    
    def create_deployment_script(self):
        """创建部署脚本"""
        print("\n=== 创建部署脚本 ===")
        
        deploy_script = """#!/bin/bash
# 微信公众号自动回复系统部署脚本

set -e

echo "开始部署微信公众号自动回复系统..."

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo "请使用root权限运行此脚本"
    exit 1
fi

# 更新系统包
echo "更新系统包..."
apt-get update

# 安装必要的系统包
echo "安装系统依赖..."
apt-get install -y python3 python3-pip python3-venv nginx supervisor

# 创建应用用户
if ! id "wechat" &>/dev/null; then
    echo "创建应用用户..."
    useradd -r -s /bin/false wechat
fi

# 创建应用目录
APP_DIR="/opt/wechat_auto_reply"
mkdir -p $APP_DIR
chown wechat:wechat $APP_DIR

# 复制应用文件
echo "复制应用文件..."
cp -r . $APP_DIR/
chown -R wechat:wechat $APP_DIR

# 安装Python依赖
echo "安装Python依赖..."
cd $APP_DIR
python3 -m pip install -r requirements.txt
python3 -m pip install gunicorn

# 配置Nginx
echo "配置Nginx..."
cp nginx.conf /etc/nginx/sites-available/wechat_auto_reply
ln -sf /etc/nginx/sites-available/wechat_auto_reply /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 配置Supervisor
echo "配置Supervisor..."
cp supervisor.conf /etc/supervisor/conf.d/wechat_auto_reply.conf
supervisorctl reread
supervisorctl update
supervisorctl start wechat_auto_reply

# 启用服务
systemctl enable nginx
systemctl enable supervisor

echo "部署完成！"
echo "请记得："
echo "1. 设置正确的微信Token环境变量"
echo "2. 配置域名和SSL证书"
echo "3. 在微信公众平台设置服务器URL"
"""
        
        try:
            with open('deploy.sh', 'w', encoding='utf-8') as f:
                f.write(deploy_script)
            
            # 设置执行权限
            os.chmod('deploy.sh', 0o755)
            
            print("✅ 部署脚本已生成: deploy.sh")
            return True
        except Exception as e:
            print(f"❌ 创建部署脚本失败: {e}")
            return False
    
    def deploy(self):
        """执行完整部署流程"""
        print("🚀 开始部署微信公众号自动回复系统")
        
        steps = [
            ("检查环境", self.check_environment),
            ("安装依赖", self.install_dependencies),
            ("生成Gunicorn配置", self.generate_gunicorn_config),
            ("生成Nginx配置", self.generate_nginx_config),
            ("生成Supervisor配置", self.generate_supervisor_config),
            ("生成systemd服务", self.generate_systemd_service),
            ("创建部署脚本", self.create_deployment_script)
        ]
        
        success_count = 0
        
        for step_name, step_func in steps:
            print(f"\n🔧 执行: {step_name}")
            try:
                if step_func():
                    success_count += 1
                else:
                    print(f"❌ {step_name} 失败")
            except Exception as e:
                print(f"❌ {step_name} 异常: {e}")
        
        print(f"\n{'='*50}")
        print(f"部署配置完成: {success_count}/{len(steps)} 步骤成功")
        
        if success_count == len(steps):
            print("🎉 所有部署配置已生成！")
            print("\n📋 后续步骤:")
            print("1. 设置环境变量 WECHAT_TOKEN")
            print("2. 配置域名和SSL证书")
            print("3. 运行 deploy.sh 脚本进行系统部署")
            print("4. 在微信公众平台配置服务器URL")
        else:
            print("⚠️  部分配置生成失败，请检查错误信息")

if __name__ == "__main__":
    manager = DeploymentManager()
    manager.deploy()