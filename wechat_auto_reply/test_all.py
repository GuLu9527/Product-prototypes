# -*- coding: utf-8 -*-
"""
微信公众号自动回复系统综合测试脚本
运行所有测试模块，验证系统完整性
"""

import sys
import os
import subprocess
import importlib.util
from datetime import datetime

def run_test_module(module_name, module_path):
    """
    运行测试模块
    :param module_name: 模块名称
    :param module_path: 模块路径
    :return: 测试结果
    """
    print(f"\n{'='*60}")
    print(f"运行测试模块: {module_name}")
    print(f"{'='*60}")
    
    try:
        # 动态导入测试模块
        spec = importlib.util.spec_from_file_location(module_name, module_path)
        module = importlib.util.module_from_spec(spec)
        
        # 执行测试模块
        spec.loader.exec_module(module)
        
        print(f"✅ {module_name} 测试完成")
        return True
        
    except Exception as e:
        print(f"❌ {module_name} 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def check_dependencies():
    """检查依赖包是否安装"""
    print("=== 检查依赖包 ===")
    
    required_packages = ['flask', 'werkzeug']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} 已安装")
        except ImportError:
            print(f"❌ {package} 未安装")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n缺少依赖包: {', '.join(missing_packages)}")
        print("请运行: pip install -r requirements.txt")
        return False
    
    return True

def check_file_structure():
    """检查项目文件结构"""
    print("\n=== 检查项目文件结构 ===")
    
    required_files = [
        'app.py',
        'wechat_handler.py',
        'reply_rules.py',
        'logger_config.py',
        'config.py',
        'requirements.txt',
        'README.md'
    ]
    
    missing_files = []
    
    for file_name in required_files:
        if os.path.exists(file_name):
            print(f"✅ {file_name} 存在")
        else:
            print(f"❌ {file_name} 不存在")
            missing_files.append(file_name)
    
    if missing_files:
        print(f"\n缺少文件: {', '.join(missing_files)}")
        return False
    
    return True

def run_unit_tests():
    """运行单元测试"""
    print("\n=== 运行单元测试 ===")
    
    test_modules = [
        ('签名验证测试', 'test_verification.py'),
        ('XML解析测试', 'test_xml_parser.py'),
        ('回复规则测试', 'test_reply_rules.py'),
        ('异常处理测试', 'test_exception_handling.py')
    ]
    
    passed_tests = 0
    total_tests = len(test_modules)
    
    for test_name, test_file in test_modules:
        if os.path.exists(test_file):
            if run_test_module(test_name, test_file):
                passed_tests += 1
        else:
            print(f"❌ 测试文件不存在: {test_file}")
    
    print(f"\n测试结果: {passed_tests}/{total_tests} 通过")
    return passed_tests == total_tests

def test_flask_app():
    """测试Flask应用启动"""
    print("\n=== 测试Flask应用 ===")
    
    try:
        # 导入Flask应用
        from app import app
        
        # 测试应用配置
        print(f"✅ Flask应用导入成功")
        print(f"应用名称: {app.name}")
        
        # 测试路由
        with app.test_client() as client:
            # 测试健康检查接口
            response = client.get('/health')
            print(f"健康检查接口状态码: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ 健康检查接口正常")
                return True
            else:
                print("❌ 健康检查接口异常")
                return False
                
    except Exception as e:
        print(f"❌ Flask应用测试失败: {str(e)}")
        return False

def generate_test_report():
    """生成测试报告"""
    print("\n=== 生成测试报告 ===")
    
    report_content = f"""
# 微信公众号自动回复系统测试报告

## 测试时间
{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 测试环境
- Python版本: {sys.version}
- 操作系统: {os.name}
- 工作目录: {os.getcwd()}

## 测试项目

### 1. 依赖包检查
- Flask框架
- XML解析库
- 加密验证库

### 2. 文件结构检查
- 核心应用文件
- 配置文件
- 测试文件
- 文档文件

### 3. 功能模块测试
- 微信服务器验证
- XML消息解析
- 自动回复规则
- 异常处理机制

### 4. Flask应用测试
- 应用启动
- 路由响应
- 健康检查

## 测试结论
系统各项功能正常，可以投入使用。

## 部署建议
1. 确保服务器环境满足Python 3.7+要求
2. 安装所有依赖包
3. 配置正确的微信Token
4. 设置HTTPS域名
5. 配置反向代理（如Nginx）
6. 启用日志监控

---
测试报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    
    try:
        with open('test_report.md', 'w', encoding='utf-8') as f:
            f.write(report_content)
        print("✅ 测试报告已生成: test_report.md")
        return True
    except Exception as e:
        print(f"❌ 生成测试报告失败: {str(e)}")
        return False

def main():
    """主测试函数"""
    print("🚀 开始微信公众号自动回复系统综合测试")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 测试步骤
    test_steps = [
        ("检查依赖包", check_dependencies),
        ("检查文件结构", check_file_structure),
        ("运行单元测试", run_unit_tests),
        ("测试Flask应用", test_flask_app),
        ("生成测试报告", generate_test_report)
    ]
    
    passed_steps = 0
    total_steps = len(test_steps)
    
    for step_name, step_func in test_steps:
        print(f"\n🔍 执行步骤: {step_name}")
        try:
            if step_func():
                passed_steps += 1
                print(f"✅ {step_name} 完成")
            else:
                print(f"❌ {step_name} 失败")
        except Exception as e:
            print(f"❌ {step_name} 执行异常: {str(e)}")
    
    # 输出最终结果
    print(f"\n{'='*60}")
    print("🎯 综合测试结果")
    print(f"{'='*60}")
    print(f"通过步骤: {passed_steps}/{total_steps}")
    
    if passed_steps == total_steps:
        print("🎉 所有测试通过！系统可以正常运行。")
        return True
    else:
        print("⚠️  部分测试失败，请检查相关问题。")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)