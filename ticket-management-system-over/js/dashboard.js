// 仪表盘模块
const Dashboard = {
    // 图表实例
    charts: {},
    
    // 数据缓存
    data: {
        tickets: [],
        stats: {}
    },

    // 初始化
    init() {
        this.loadData();
        this.setupEventListeners();
        this.initCharts();
        this.updateStats();
        
        // 定时刷新数据
        setInterval(() => {
            this.refreshData();
        }, 30000); // 30秒刷新一次
    },

    // 设置事件监听器
    setupEventListeners() {
        // 页面可见性变化时刷新数据
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshData();
            }
        });
    },

    // 加载数据
    loadData() {
        // 从本地存储加载工单数据
        this.data.tickets = Utils.storage.get('tickets', this.generateSampleData());
        
        // 分析数据
        this.data.stats = AIFeatures.analyzeTickets(this.data.tickets);
    },

    // 生成示例数据
    generateSampleData() {
        const sampleTickets = [
            {
                id: 'ticket-1',
                title: '登录页面无法正常显示',
                description: '用户反馈登录页面加载时出现白屏，无法输入用户名和密码',
                status: 'open',
                priority: 'high',
                category: 'bug',
                author: { name: '张三', email: 'zhangsan@example.com' },
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'ticket-2',
                title: '新增数据导出功能',
                description: '希望能够将报表数据导出为Excel格式，方便离线分析',
                status: 'in-progress',
                priority: 'medium',
                category: 'feature',
                author: { name: '李四', email: 'lisi@example.com' },
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'ticket-3',
                title: '如何修改个人资料',
                description: '请问在哪里可以修改个人资料信息，包括头像和联系方式',
                status: 'closed',
                priority: 'low',
                category: 'support',
                author: { name: '王五', email: 'wangwu@example.com' },
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'ticket-4',
                title: '系统响应速度慢',
                description: '最近系统打开页面很慢，特别是报表页面，需要等待很长时间',
                status: 'open',
                priority: 'urgent',
                category: 'bug',
                author: { name: '赵六', email: 'zhaoliu@example.com' },
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'ticket-5',
                title: '移动端适配优化',
                description: '希望能够优化移动端的显示效果，提升用户体验',
                status: 'in-progress',
                priority: 'medium',
                category: 'feature',
                author: { name: '孙七', email: 'sunqi@example.com' },
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        // 保存示例数据
        Utils.storage.set('tickets', sampleTickets);
        return sampleTickets;
    },

    // 刷新数据
    refreshData() {
        this.loadData();
        this.updateStats();
        this.updateCharts();
    },

    // 更新统计数据
    updateStats() {
        const stats = this.data.stats;
        
        // 更新统计卡片
        this.updateStatCard('totalTickets', stats.total);
        this.updateStatCard('pendingTickets', stats.byStatus.open || 0);
        this.updateStatCard('progressTickets', stats.byStatus['in-progress'] || 0);
        this.updateStatCard('completedTickets', stats.byStatus.closed || 0);
    },

    // 更新统计卡片
    updateStatCard(elementId, value) {
        const element = Utils.dom.$(`#${elementId}`);
        if (element) {
            // 添加动画效果
            element.style.transform = 'scale(1.1)';
            element.textContent = value;
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    },

    // 初始化图表
    initCharts() {
        this.initStatusChart();
        this.initPriorityChart();
        this.initCategoryChart();
        this.initTrendChart();
    },

    // 初始化状态分布图表
    initStatusChart() {
        const ctx = Utils.dom.$('#statusChart');
        if (!ctx) return;

        const stats = this.data.stats;
        const statusData = {
            labels: ['待处理', '进行中', '已完成'],
            datasets: [{
                data: [
                    stats.byStatus.open || 0,
                    stats.byStatus['in-progress'] || 0,
                    stats.byStatus.closed || 0
                ],
                backgroundColor: [
                    '#f59e0b', // 待处理 - 橙色
                    '#06b6d4', // 进行中 - 青色
                    '#10b981'  // 已完成 - 绿色
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: statusData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    },

    // 初始化优先级统计图表
    initPriorityChart() {
        const ctx = Utils.dom.$('#priorityChart');
        if (!ctx) return;

        const stats = this.data.stats;
        const priorityData = {
            labels: ['紧急', '高', '中', '低'],
            datasets: [{
                label: '工单数量',
                data: [
                    stats.byPriority.urgent || 0,
                    stats.byPriority.high || 0,
                    stats.byPriority.medium || 0,
                    stats.byPriority.low || 0
                ],
                backgroundColor: [
                    '#ef4444', // 紧急 - 红色
                    '#f97316', // 高 - 橙红色
                    '#f59e0b', // 中 - 橙色
                    '#10b981'  // 低 - 绿色
                ],
                borderRadius: 4,
                borderSkipped: false
            }]
        };

        this.charts.priority = new Chart(ctx, {
            type: 'bar',
            data: priorityData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return `优先级: ${context[0].label}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // 初始化分类统计图表
    initCategoryChart() {
        const ctx = Utils.dom.$('#categoryChart');
        if (!ctx) return;

        const stats = this.data.stats;
        const categoryData = {
            labels: ['故障报告', '功能请求', '技术支持', '其他'],
            datasets: [{
                data: [
                    stats.byCategory.bug || 0,
                    stats.byCategory.feature || 0,
                    stats.byCategory.support || 0,
                    stats.byCategory.other || 0
                ],
                backgroundColor: [
                    '#ef4444', // 故障 - 红色
                    '#2563eb', // 功能 - 蓝色
                    '#10b981', // 支持 - 绿色
                    '#64748b'  // 其他 - 灰色
                ],
                borderWidth: 0
            }]
        };

        this.charts.category = new Chart(ctx, {
            type: 'polarArea',
            data: categoryData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },

    // 初始化趋势图表
    initTrendChart() {
        const ctx = Utils.dom.$('#trendChart');
        if (!ctx) return;

        const stats = this.data.stats;
        const trendData = {
            labels: stats.trends.map(item => {
                const date = new Date(item.date);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            }),
            datasets: [{
                label: '新建工单',
                data: stats.trends.map(item => item.count),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        };

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: trendData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function(context) {
                                const index = context[0].dataIndex;
                                const date = stats.trends[index]?.date;
                                return date ? Utils.formatDate(date, 'YYYY年MM月DD日') : '';
                            },
                            label: function(context) {
                                return `新建工单: ${context.raw}个`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    },

    // 更新图表
    updateCharts() {
        const stats = this.data.stats;

        // 更新状态图表
        if (this.charts.status) {
            this.charts.status.data.datasets[0].data = [
                stats.byStatus.open || 0,
                stats.byStatus['in-progress'] || 0,
                stats.byStatus.closed || 0
            ];
            this.charts.status.update('none');
        }

        // 更新优先级图表
        if (this.charts.priority) {
            this.charts.priority.data.datasets[0].data = [
                stats.byPriority.urgent || 0,
                stats.byPriority.high || 0,
                stats.byPriority.medium || 0,
                stats.byPriority.low || 0
            ];
            this.charts.priority.update('none');
        }

        // 更新分类图表
        if (this.charts.category) {
            this.charts.category.data.datasets[0].data = [
                stats.byCategory.bug || 0,
                stats.byCategory.feature || 0,
                stats.byCategory.support || 0,
                stats.byCategory.other || 0
            ];
            this.charts.category.update('none');
        }

        // 更新趋势图表
        if (this.charts.trend) {
            this.charts.trend.data.labels = stats.trends.map(item => {
                const date = new Date(item.date);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            });
            this.charts.trend.data.datasets[0].data = stats.trends.map(item => item.count);
            this.charts.trend.update('none');
        }
    },

    // 销毁图表
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    },

    // 导出数据
    exportData(format = 'json') {
        const data = {
            tickets: this.data.tickets,
            stats: this.data.stats,
            exportTime: new Date().toISOString()
        };

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            this.downloadFile(blob, `工单数据_${Utils.formatDate(new Date(), 'YYYY-MM-DD')}.json`);
        } else if (format === 'csv') {
            const csv = this.convertToCSV(this.data.tickets);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            this.downloadFile(blob, `工单数据_${Utils.formatDate(new Date(), 'YYYY-MM-DD')}.csv`);
        }
    },

    // 转换为CSV格式
    convertToCSV(tickets) {
        const headers = ['ID', '标题', '描述', '状态', '优先级', '分类', '创建者', '创建时间', '更新时间'];
        const rows = tickets.map(ticket => [
            ticket.id,
            ticket.title,
            ticket.description.replace(/"/g, '""'), // 转义双引号
            ticket.status,
            ticket.priority,
            ticket.category,
            ticket.author?.name || '',
            Utils.formatDate(ticket.createdAt),
            Utils.formatDate(ticket.updatedAt || ticket.createdAt)
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return '\ufeff' + csvContent; // 添加BOM以支持中文
    },

    // 下载文件
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // 获取仪表盘数据
    getDashboardData() {
        return {
            tickets: this.data.tickets,
            stats: this.data.stats,
            charts: Object.keys(this.charts)
        };
    },

    // 重置仪表盘
    reset() {
        this.destroyCharts();
        this.data = { tickets: [], stats: {} };
        this.loadData();
        this.initCharts();
        this.updateStats();
    },

    // 添加实时通知
    addRealTimeNotification(ticket) {
        // 创建通知元素
        const notification = Utils.dom.createElement('div', 'dashboard-notification');
        notification.innerHTML = `
            <div class="notification-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                </svg>
            </div>
            <div class="notification-content">
                <div class="notification-title">新工单创建</div>
                <div class="notification-message">${Utils.string.truncate(ticket.title, 30)}</div>
            </div>
            <button class="notification-close">×</button>
        `;

        // 添加到页面
        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            Utils.dom.addClass(notification, 'show');
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            Utils.dom.removeClass(notification, 'show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);

        // 点击关闭
        const closeBtn = notification.querySelector('.notification-close');
        Utils.events.on(closeBtn, 'click', () => {
            Utils.dom.removeClass(notification, 'show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    },

    // 性能监控
    performanceMonitor: {
        startTime: null,
        
        start() {
            this.startTime = performance.now();
        },
        
        end(operation) {
            if (this.startTime) {
                const duration = performance.now() - this.startTime;
                console.log(`仪表盘操作 "${operation}" 耗时: ${duration.toFixed(2)}ms`);
                this.startTime = null;
            }
        }
    }
};

// 导出到全局
window.Dashboard = Dashboard;
