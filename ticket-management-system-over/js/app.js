// 主应用程序
const App = {
    // 当前页面
    currentPage: 'dashboard',
    
    // 初始化应用
    init() {
        // 检查用户认证
        if (!Auth.initApp()) {
            return;
        }

        // 初始化各个模块
        this.initModules();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 显示默认页面
        this.showPage('dashboard');
        
        // 设置页面标题
        this.updatePageTitle();
        
        console.log('智能工单管理系统初始化完成');
    },

    // 初始化模块
    initModules() {
        // 初始化AI功能
        AIFeatures.init();
        
        // 初始化仪表盘
        Dashboard.init();
        
        // 初始化工单管理
        Tickets.init();
    },

    // 设置事件监听器
    setupEventListeners() {
        // 导航菜单点击
        const navLinks = Utils.dom.$$('.nav-link');
        navLinks.forEach(link => {
            Utils.events.on(link, 'click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) {
                    this.showPage(page);
                }
            });
        });

        // 移动端菜单切换
        const mobileMenuBtn = Utils.dom.$('#mobileMenuBtn');
        const sidebar = Utils.dom.$('#sidebar');
        
        if (mobileMenuBtn && sidebar) {
            Utils.events.on(mobileMenuBtn, 'click', () => {
                Utils.dom.toggleClass(sidebar, 'open');
            });
        }

        // 点击页面其他地方关闭移动端菜单
        Utils.events.on(document, 'click', (e) => {
            if (sidebar && Utils.device.isMobile()) {
                if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    Utils.dom.removeClass(sidebar, 'open');
                }
            }
        });

        // 窗口大小变化
        Utils.events.on(window, 'resize', Utils.throttle(() => {
            this.handleResize();
        }, 250));

        // 表单提交
        const createForm = Utils.dom.$('#createTicketForm');
        if (createForm) {
            Utils.events.on(createForm, 'submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(e);
            });
        }

        // 取消按钮
        const cancelBtn = Utils.dom.$('#cancelBtn');
        if (cancelBtn) {
            Utils.events.on(cancelBtn, 'click', () => {
                this.showPage('tickets');
            });
        }

        // 键盘快捷键
        Utils.events.on(document, 'keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 页面可见性变化
        Utils.events.on(document, 'visibilitychange', () => {
            if (!document.hidden) {
                this.refreshCurrentPage();
            }
        });
    },

    // 显示页面
    showPage(pageName) {
        // 隐藏所有页面
        const pages = Utils.dom.$$('.page-content');
        pages.forEach(page => {
            Utils.dom.removeClass(page, 'active');
        });

        // 显示目标页面
        const targetPage = Utils.dom.$(`#${pageName}Page`);
        if (targetPage) {
            Utils.dom.addClass(targetPage, 'active');
            this.currentPage = pageName;
        }

        // 更新导航状态
        this.updateNavigation(pageName);
        
        // 更新页面标题
        this.updatePageTitle(pageName);
        
        // 页面特定的初始化
        this.initPageSpecific(pageName);
        
        // 关闭移动端菜单
        if (Utils.device.isMobile()) {
            const sidebar = Utils.dom.$('#sidebar');
            if (sidebar) {
                Utils.dom.removeClass(sidebar, 'open');
            }
        }
    },

    // 更新导航状态
    updateNavigation(activePage) {
        const navItems = Utils.dom.$$('.nav-item');
        navItems.forEach(item => {
            Utils.dom.removeClass(item, 'active');
            const link = item.querySelector('.nav-link');
            if (link && link.dataset.page === activePage) {
                Utils.dom.addClass(item, 'active');
            }
        });
    },

    // 更新页面标题
    updatePageTitle(pageName) {
        const titles = {
            'dashboard': '仪表盘',
            'tickets': '工单管理',
            'create': '创建工单'
        };
        
        const pageTitle = Utils.dom.$('#pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[pageName] || titles['dashboard'];
        }
        
        // 更新浏览器标题
        document.title = `${titles[pageName] || '仪表盘'} - 智能工单管理系统`;
    },

    // 页面特定初始化
    initPageSpecific(pageName) {
        switch (pageName) {
            case 'dashboard':
                // 刷新仪表盘数据
                if (Dashboard.refreshData) {
                    Dashboard.refreshData();
                }
                break;
            case 'tickets':
                // 刷新工单列表
                if (Tickets.loadTickets) {
                    Tickets.loadTickets();
                    Tickets.renderTickets();
                }
                break;
            case 'create':
                // 重置表单和AI建议
                setTimeout(() => {
                    const form = Utils.dom.$('#createTicketForm');
                    if (form && !form.dataset.editId) {
                        form.reset();
                    }
                    AIFeatures.hideSuggestions();
                }, 100);
                break;
        }
    },

    // 处理表单提交
    handleFormSubmit(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        // 验证表单
        const errors = this.validateForm(formData);
        if (Object.keys(errors).length > 0) {
            this.showFormErrors(errors);
            return;
        }

        // 清除错误信息
        this.clearFormErrors();
        
        // 保存工单
        Tickets.saveTicket(formData);
    },

    // 验证表单
    validateForm(formData) {
        const errors = {};
        
        const title = formData.get('title');
        const description = formData.get('description');
        
        if (!Utils.validate.required(title)) {
            errors.title = '请输入工单标题';
        } else if (!Utils.validate.minLength(title, 5)) {
            errors.title = '标题至少需要5个字符';
        } else if (!Utils.validate.maxLength(title, 100)) {
            errors.title = '标题不能超过100个字符';
        }
        
        if (!Utils.validate.required(description)) {
            errors.description = '请输入详细描述';
        } else if (!Utils.validate.minLength(description, 10)) {
            errors.description = '描述至少需要10个字符';
        } else if (!Utils.validate.maxLength(description, 2000)) {
            errors.description = '描述不能超过2000个字符';
        }
        
        return errors;
    },

    // 显示表单错误
    showFormErrors(errors) {
        Object.keys(errors).forEach(field => {
            const errorElement = Utils.dom.$(`#${field}Error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
                Utils.dom.addClass(errorElement, 'show');
            }
        });
    },

    // 清除表单错误
    clearFormErrors() {
        const errorElements = Utils.dom.$$('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            Utils.dom.removeClass(element, 'show');
        });
    },

    // 处理窗口大小变化
    handleResize() {
        // 重新计算图表大小
        if (Dashboard.charts) {
            Object.values(Dashboard.charts).forEach(chart => {
                if (chart && chart.resize) {
                    chart.resize();
                }
            });
        }
        
        // 移动端菜单处理
        const sidebar = Utils.dom.$('#sidebar');
        if (sidebar && !Utils.device.isMobile()) {
            Utils.dom.removeClass(sidebar, 'open');
        }
    },

    // 键盘快捷键
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K: 聚焦搜索框
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = Utils.dom.$('#searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Ctrl/Cmd + N: 创建新工单
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.showPage('create');
        }
        
        // Escape: 关闭模态框
        if (e.key === 'Escape') {
            const modal = Utils.dom.$('#ticketModal');
            if (modal && Utils.dom.hasClass(modal, 'show')) {
                Utils.modal.hide('#ticketModal');
            }
        }
        
        // 数字键快速导航
        if (e.key >= '1' && e.key <= '3' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            const pages = ['dashboard', 'tickets', 'create'];
            const pageIndex = parseInt(e.key) - 1;
            if (pages[pageIndex]) {
                this.showPage(pages[pageIndex]);
            }
        }
    },

    // 刷新当前页面
    refreshCurrentPage() {
        this.initPageSpecific(this.currentPage);
    },

    // 显示加载状态
    showLoading(container) {
        if (container) {
            container.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <span>加载中...</span>
                </div>
            `;
        }
    },

    // 显示错误状态
    showError(container, message = '加载失败，请重试') {
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                    </div>
                    <h3>出错了</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">刷新页面</button>
                </div>
            `;
        }
    },

    // 应用主题
    applyTheme(theme = 'light') {
        document.documentElement.setAttribute('data-theme', theme);
        Utils.storage.set('theme', theme);
    },

    // 获取应用状态
    getAppState() {
        return {
            currentPage: this.currentPage,
            user: Auth.currentUser,
            theme: Utils.storage.get('theme', 'light'),
            tickets: Tickets.getTicketStats(),
            timestamp: new Date().toISOString()
        };
    },

    // 错误边界处理
    handleError(error, context = 'Unknown') {
        console.error(`应用错误 [${context}]:`, error);
        
        // 记录错误
        const errorLog = Utils.storage.get('errorLog', []);
        errorLog.push({
            error: error.message,
            stack: error.stack,
            context: context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
        
        // 只保留最近50条错误记录
        if (errorLog.length > 50) {
            errorLog.splice(0, errorLog.length - 50);
        }
        
        Utils.storage.set('errorLog', errorLog);
        
        // 显示用户友好的错误信息
        Utils.toast.show('系统出现错误，请刷新页面重试', 'error');
    },

    // 性能监控
    performanceMonitor: {
        marks: {},
        
        mark(name) {
            this.marks[name] = performance.now();
        },
        
        measure(name, startMark) {
            if (this.marks[startMark]) {
                const duration = performance.now() - this.marks[startMark];
                console.log(`性能测量 [${name}]: ${duration.toFixed(2)}ms`);
                return duration;
            }
        }
    }
};

// 全局错误处理
window.addEventListener('error', (event) => {
    App.handleError(event.error, 'Global Error');
});

window.addEventListener('unhandledrejection', (event) => {
    App.handleError(new Error(event.reason), 'Unhandled Promise Rejection');
});

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.performanceMonitor.mark('appInit');
    
    try {
        App.init();
        App.performanceMonitor.measure('应用初始化', 'appInit');
    } catch (error) {
        App.handleError(error, 'App Initialization');
    }
});

// 导出到全局
window.App = App;