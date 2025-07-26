// 模拟数据
const mockData = {
    // 用户数据
    users: [
        {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
            status: 'active',
            createTime: '2024-01-15 10:30:00',
            lastLogin: '2024-01-20 14:25:00'
        },
        {
            id: 2,
            username: 'zhangsan',
            email: 'zhangsan@example.com',
            role: 'user',
            status: 'active',
            createTime: '2024-01-16 09:15:00',
            lastLogin: '2024-01-20 11:45:00'
        },
        {
            id: 3,
            username: 'lisi',
            email: 'lisi@example.com',
            role: 'user',
            status: 'inactive',
            createTime: '2024-01-17 16:20:00',
            lastLogin: '2024-01-19 08:30:00'
        },
        {
            id: 4,
            username: 'wangwu',
            email: 'wangwu@example.com',
            role: 'user',
            status: 'active',
            createTime: '2024-01-18 11:45:00',
            lastLogin: '2024-01-20 13:15:00'
        },
        {
            id: 5,
            username: 'zhaoliu',
            email: 'zhaoliu@example.com',
            role: 'admin',
            status: 'active',
            createTime: '2024-01-19 14:30:00',
            lastLogin: '2024-01-20 15:20:00'
        }
    ],

    // 角色数据
    roles: [
        {
            id: 1,
            name: '超级管理员',
            description: '拥有系统所有权限，可以管理所有功能模块',
            permissions: ['dashboard', 'user_manage', 'role_manage', 'system_manage', 'log_manage'],
            userCount: 2,
            createTime: '2024-01-01 00:00:00'
        },
        {
            id: 2,
            name: '普通管理员',
            description: '拥有部分管理权限，可以管理用户和查看日志',
            permissions: ['dashboard', 'user_manage', 'log_manage'],
            userCount: 3,
            createTime: '2024-01-01 00:00:00'
        },
        {
            id: 3,
            name: '普通用户',
            description: '只能查看仪表板和个人信息',
            permissions: ['dashboard'],
            userCount: 15,
            createTime: '2024-01-01 00:00:00'
        },
        {
            id: 4,
            name: '审计员',
            description: '专门负责系统日志审计和监控',
            permissions: ['dashboard', 'log_manage'],
            userCount: 1,
            createTime: '2024-01-01 00:00:00'
        }
    ],

    // 权限数据
    permissions: [
        {
            id: 'dashboard',
            name: '仪表板',
            description: '查看系统概览和统计信息',
            category: 'basic'
        },
        {
            id: 'user_manage',
            name: '用户管理',
            description: '管理系统用户，包括添加、编辑、删除用户',
            category: 'manage'
        },
        {
            id: 'role_manage',
            name: '角色管理',
            description: '管理系统角色和权限配置',
            category: 'manage'
        },
        {
            id: 'system_manage',
            name: '系统管理',
            description: '系统配置和参数设置',
            category: 'system'
        },
        {
            id: 'log_manage',
            name: '日志管理',
            description: '查看和管理系统操作日志',
            category: 'system'
        }
    ],

    // 系统日志数据
    logs: [
        {
            id: 1,
            level: 'info',
            time: '2024-01-20 15:30:25',
            user: 'admin',
            action: '用户登录',
            content: '管理员 admin 成功登录系统',
            ip: '192.168.1.100'
        },
        {
            id: 2,
            level: 'info',
            time: '2024-01-20 15:25:18',
            user: 'admin',
            action: '添加用户',
            content: '管理员 admin 添加了新用户 zhangsan',
            ip: '192.168.1.100'
        },
        {
            id: 3,
            level: 'warning',
            time: '2024-01-20 15:20:45',
            user: 'lisi',
            action: '登录失败',
            content: '用户 lisi 登录失败，密码错误',
            ip: '192.168.1.105'
        },
        {
            id: 4,
            level: 'info',
            time: '2024-01-20 15:15:32',
            user: 'wangwu',
            action: '修改密码',
            content: '用户 wangwu 修改了登录密码',
            ip: '192.168.1.102'
        },
        {
            id: 5,
            level: 'error',
            time: '2024-01-20 15:10:15',
            user: 'system',
            action: '系统错误',
            content: '数据库连接超时，已自动重连',
            ip: 'localhost'
        },
        {
            id: 6,
            level: 'info',
            time: '2024-01-20 15:05:28',
            user: 'admin',
            action: '角色配置',
            content: '管理员 admin 修改了角色权限配置',
            ip: '192.168.1.100'
        },
        {
            id: 7,
            level: 'warning',
            time: '2024-01-20 15:00:12',
            user: 'system',
            action: '系统警告',
            content: '磁盘空间使用率超过80%',
            ip: 'localhost'
        },
        {
            id: 8,
            level: 'info',
            time: '2024-01-20 14:55:40',
            user: 'zhaoliu',
            action: '用户登录',
            content: '管理员 zhaoliu 成功登录系统',
            ip: '192.168.1.103'
        }
    ],

    // 统计数据
    stats: {
        totalUsers: 1234,
        activeUsers: 856,
        todayVisits: 2468,
        systemWarnings: 12
    },

    // 图表数据
    chartData: {
        visitTrend: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            data: [320, 450, 380, 520, 680, 420, 350]
        },
        userDistribution: {
            labels: ['管理员', '普通用户', '审计员', '访客'],
            data: [15, 65, 10, 10]
        }
    },

    // 最近活动
    recentActivities: [
        {
            id: 1,
            type: 'user_register',
            icon: 'fa-user-plus',
            content: '新用户 张三 注册成功',
            time: '2分钟前'
        },
        {
            id: 2,
            type: 'user_login',
            icon: 'fa-sign-in-alt',
            content: '用户 李四 登录系统',
            time: '5分钟前'
        },
        {
            id: 3,
            type: 'system_config',
            icon: 'fa-edit',
            content: '管理员修改了系统配置',
            time: '10分钟前'
        },
        {
            id: 4,
            type: 'data_export',
            icon: 'fa-download',
            content: '导出了用户数据报表',
            time: '15分钟前'
        },
        {
            id: 5,
            type: 'role_update',
            icon: 'fa-user-tag',
            content: '更新了角色权限配置',
            time: '20分钟前'
        }
    ],

    // 系统配置
    systemConfig: {
        basic: {
            systemName: '后台管理系统',
            systemDesc: '企业级后台管理系统',
            systemVersion: 'v1.0.0',
            companyName: '某某科技有限公司'
        },
        security: {
            minPasswordLength: 8,
            maxLoginAttempts: 5,
            sessionTimeout: 30,
            enableTwoFactor: false
        },
        email: {
            smtpHost: 'smtp.example.com',
            smtpPort: 587,
            smtpUser: 'noreply@example.com',
            enableSSL: true
        }
    }
};

// 工具函数
const utils = {
    // 格式化时间
    formatTime(timeStr) {
        const date = new Date(timeStr);
        return date.toLocaleString('zh-CN');
    },

    // 获取状态标签类名
    getStatusClass(status) {
        return status === 'active' ? 'status-badge active' : 'status-badge inactive';
    },

    // 获取状态文本
    getStatusText(status) {
        return status === 'active' ? '启用' : '禁用';
    },

    // 获取角色文本
    getRoleText(role) {
        const roleMap = {
            'admin': '管理员',
            'user': '普通用户',
            'auditor': '审计员'
        };
        return roleMap[role] || role;
    },

    // 获取日志级别类名
    getLogLevelClass(level) {
        return `log-level ${level}`;
    },

    // 获取日志级别文本
    getLogLevelText(level) {
        const levelMap = {
            'info': '信息',
            'warning': '警告',
            'error': '错误'
        };
        return levelMap[level] || level;
    },

    // 分页数据
    paginate(data, page, pageSize) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
            data: data.slice(start, end),
            total: data.length,
            page: page,
            pageSize: pageSize,
            totalPages: Math.ceil(data.length / pageSize)
        };
    },

    // 搜索过滤
    filterData(data, searchTerm, filterFields) {
        if (!searchTerm) return data;
        
        return data.filter(item => {
            return filterFields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    },

    // 生成随机ID
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    },

    // 深拷贝
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 导出数据和工具函数
window.mockData = mockData;
window.utils = utils;