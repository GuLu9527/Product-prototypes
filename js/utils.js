// 工具函数库
const Utils = {
    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 格式化日期
    formatDate(date, format = 'YYYY-MM-DD HH:mm') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    // 相对时间格式化
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}天前`;
        } else if (hours > 0) {
            return `${hours}小时前`;
        } else if (minutes > 0) {
            return `${minutes}分钟前`;
        } else {
            return '刚刚';
        }
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
    },

    // 本地存储操作
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('存储数据失败:', error);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('读取数据失败:', error);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('删除数据失败:', error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('清空存储失败:', error);
                return false;
            }
        }
    },

    // 表单验证
    validate: {
        email(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        password(password) {
            // 至少8位，包含字母和数字
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
            return passwordRegex.test(password);
        },

        required(value) {
            return value !== null && value !== undefined && value.toString().trim() !== '';
        },

        minLength(value, min) {
            return value && value.toString().length >= min;
        },

        maxLength(value, max) {
            return value && value.toString().length <= max;
        }
    },

    // DOM操作辅助函数
    dom: {
        $(selector) {
            return document.querySelector(selector);
        },

        $$(selector) {
            return document.querySelectorAll(selector);
        },

        createElement(tag, className, textContent) {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (textContent) element.textContent = textContent;
            return element;
        },

        show(element) {
            if (element) element.style.display = 'block';
        },

        hide(element) {
            if (element) element.style.display = 'none';
        },

        toggle(element) {
            if (element) {
                element.style.display = element.style.display === 'none' ? 'block' : 'none';
            }
        },

        addClass(element, className) {
            if (element) element.classList.add(className);
        },

        removeClass(element, className) {
            if (element) element.classList.remove(className);
        },

        toggleClass(element, className) {
            if (element) element.classList.toggle(className);
        },

        hasClass(element, className) {
            return element ? element.classList.contains(className) : false;
        }
    },

    // 事件处理
    events: {
        on(element, event, handler) {
            if (element) element.addEventListener(event, handler);
        },

        off(element, event, handler) {
            if (element) element.removeEventListener(event, handler);
        },

        once(element, event, handler) {
            if (element) {
                element.addEventListener(event, handler, { once: true });
            }
        },

        delegate(parent, selector, event, handler) {
            if (parent) {
                parent.addEventListener(event, function(e) {
                    if (e.target.matches(selector)) {
                        handler.call(e.target, e);
                    }
                });
            }
        }
    },

    // Toast消息提示
    toast: {
        show(message, type = 'info', duration = 3000) {
            const toast = Utils.dom.$('#toast');
            const toastIcon = Utils.dom.$('#toastIcon');
            const toastMessage = Utils.dom.$('#toastMessage');

            if (!toast || !toastIcon || !toastMessage) return;

            // 设置图标
            const icons = {
                success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>`,
                error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>`,
                warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>`,
                info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>`
            };

            toastIcon.innerHTML = icons[type] || icons.info;
            toastMessage.textContent = message;

            // 设置颜色
            const colors = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#06b6d4'
            };

            toastIcon.style.color = colors[type] || colors.info;

            // 显示toast
            Utils.dom.addClass(toast, 'show');

            // 自动隐藏
            setTimeout(() => {
                Utils.dom.removeClass(toast, 'show');
            }, duration);
        }
    },

    // 模态框操作
    modal: {
        show(modalId) {
            const modal = Utils.dom.$(modalId);
            if (modal) {
                Utils.dom.addClass(modal, 'show');
                document.body.style.overflow = 'hidden';
            }
        },

        hide(modalId) {
            const modal = Utils.dom.$(modalId);
            if (modal) {
                Utils.dom.removeClass(modal, 'show');
                document.body.style.overflow = '';
            }
        }
    },

    // 数据处理
    data: {
        // 深拷贝
        deepClone(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => Utils.data.deepClone(item));
            if (typeof obj === 'object') {
                const clonedObj = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        clonedObj[key] = Utils.data.deepClone(obj[key]);
                    }
                }
                return clonedObj;
            }
        },

        // 数组去重
        unique(arr, key) {
            if (!key) return [...new Set(arr)];
            const seen = new Set();
            return arr.filter(item => {
                const val = item[key];
                if (seen.has(val)) return false;
                seen.add(val);
                return true;
            });
        },

        // 数组排序
        sortBy(arr, key, order = 'asc') {
            return arr.sort((a, b) => {
                const aVal = key ? a[key] : a;
                const bVal = key ? b[key] : b;
                
                if (order === 'desc') {
                    return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
                } else {
                    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                }
            });
        },

        // 数组分页
        paginate(arr, page, pageSize) {
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            return {
                data: arr.slice(start, end),
                total: arr.length,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(arr.length / pageSize)
            };
        }
    },

    // 字符串处理
    string: {
        // 截断文本
        truncate(str, length, suffix = '...') {
            if (!str || str.length <= length) return str;
            return str.substring(0, length) + suffix;
        },

        // 首字母大写
        capitalize(str) {
            if (!str) return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        // 驼峰转换
        camelCase(str) {
            return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        },

        // 短横线转换
        kebabCase(str) {
            return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        },

        // 高亮搜索关键词
        highlight(text, keyword) {
            if (!keyword) return text;
            const regex = new RegExp(`(${keyword})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        }
    },

    // URL处理
    url: {
        // 获取URL参数
        getParams() {
            const params = {};
            const urlParams = new URLSearchParams(window.location.search);
            for (const [key, value] of urlParams) {
                params[key] = value;
            }
            return params;
        },

        // 设置URL参数
        setParam(key, value) {
            const url = new URL(window.location);
            url.searchParams.set(key, value);
            window.history.pushState({}, '', url);
        },

        // 删除URL参数
        removeParam(key) {
            const url = new URL(window.location);
            url.searchParams.delete(key);
            window.history.pushState({}, '', url);
        }
    },

    // 设备检测
    device: {
        isMobile() {
            return window.innerWidth <= 767;
        },

        isTablet() {
            return window.innerWidth > 767 && window.innerWidth <= 1023;
        },

        isDesktop() {
            return window.innerWidth > 1023;
        },

        isTouchDevice() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
    },

    // 性能监控
    performance: {
        // 测量函数执行时间
        measure(fn, name = 'Function') {
            const start = performance.now();
            const result = fn();
            const end = performance.now();
            console.log(`${name} 执行时间: ${(end - start).toFixed(2)}ms`);
            return result;
        },

        // 内存使用情况
        getMemoryUsage() {
            if (performance.memory) {
                return {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                };
            }
            return null;
        }
    },

    // 错误处理
    error: {
        // 全局错误处理
        handleGlobalError() {
            window.addEventListener('error', (event) => {
                console.error('全局错误:', event.error);
                Utils.toast.show('系统发生错误，请刷新页面重试', 'error');
            });

            window.addEventListener('unhandledrejection', (event) => {
                console.error('未处理的Promise错误:', event.reason);
                Utils.toast.show('操作失败，请重试', 'error');
            });
        },

        // 安全执行函数
        safeExecute(fn, fallback = null) {
            try {
                return fn();
            } catch (error) {
                console.error('函数执行错误:', error);
                return fallback;
            }
        }
    }
};

// 初始化全局错误处理
Utils.error.handleGlobalError();

// 导出到全局
window.Utils = Utils;
