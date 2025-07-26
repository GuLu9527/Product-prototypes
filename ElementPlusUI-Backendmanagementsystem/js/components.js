// 组件功能模块

// 消息提示组件
class Message {
    static show(text, type = 'info', duration = 3000) {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        // 显示动画
        setTimeout(() => {
            message.classList.add('show');
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, duration);
    }
    
    static success(text, duration) {
        this.show(text, 'success', duration);
    }
    
    static error(text, duration) {
        this.show(text, 'error', duration);
    }
    
    static warning(text, duration) {
        this.show(text, 'warning', duration);
    }
}

// 确认对话框组件
class ConfirmDialog {
    static show(title, message, onConfirm, onCancel) {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.innerHTML = `
            <div class="confirm-content">
                <div class="confirm-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="confirm-title">${title}</div>
                <div class="confirm-message">${message}</div>
                <div class="confirm-actions">
                    <button class="btn btn-default" id="confirmCancel">取消</button>
                    <button class="btn btn-danger" id="confirmOk">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.classList.add('show');
        
        // 绑定事件
        const cancelBtn = dialog.querySelector('#confirmCancel');
        const okBtn = dialog.querySelector('#confirmOk');
        
        const close = () => {
            dialog.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(dialog);
            }, 300);
        };
        
        cancelBtn.onclick = () => {
            close();
            if (onCancel) onCancel();
        };
        
        okBtn.onclick = () => {
            close();
            if (onConfirm) onConfirm();
        };
        
        // 点击背景关闭
        dialog.onclick = (e) => {
            if (e.target === dialog) {
                close();
                if (onCancel) onCancel();
            }
        };
    }
}

// 模态框组件
class Modal {
    constructor(selector) {
        this.modal = document.querySelector(selector);
        this.closeBtn = this.modal.querySelector('.modal-close');
        this.cancelBtn = this.modal.querySelector('#cancelBtn, #cancelRoleBtn');
        
        this.bindEvents();
    }
    
    bindEvents() {
        // 关闭按钮
        if (this.closeBtn) {
            this.closeBtn.onclick = () => this.hide();
        }
        
        // 取消按钮
        if (this.cancelBtn) {
            this.cancelBtn.onclick = () => this.hide();
        }
        
        // 点击背景关闭
        this.modal.onclick = (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        };
    }
    
    show() {
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    hide() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// 表格组件
class DataTable {
    constructor(selector, options = {}) {
        this.table = document.querySelector(selector);
        this.tbody = this.table.querySelector('tbody');
        this.options = {
            pageSize: 10,
            currentPage: 1,
            ...options
        };
        this.data = [];
        this.filteredData = [];
        
        this.bindEvents();
    }
    
    bindEvents() {
        // 全选功能
        const selectAll = this.table.querySelector('#selectAll');
        if (selectAll) {
            selectAll.onchange = (e) => {
                const checkboxes = this.tbody.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
            };
        }
    }
    
    setData(data) {
        this.data = data;
        this.filteredData = [...data];
        this.render();
    }
    
    filter(searchTerm, filters = {}) {
        this.filteredData = this.data.filter(item => {
            // 搜索过滤
            let matchSearch = true;
            if (searchTerm) {
                matchSearch = Object.values(item).some(value => 
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            // 其他过滤条件
            let matchFilters = true;
            for (const [key, value] of Object.entries(filters)) {
                if (value && item[key] !== value) {
                    matchFilters = false;
                    break;
                }
            }
            
            return matchSearch && matchFilters;
        });
        
        this.options.currentPage = 1;
        this.render();
    }
    
    render() {
        const paginatedData = utils.paginate(
            this.filteredData, 
            this.options.currentPage, 
            this.options.pageSize
        );
        
        this.renderTable(paginatedData.data);
        this.renderPagination(paginatedData);
    }
    
    renderTable(data) {
        // 子类实现具体的表格渲染逻辑
    }
    
    renderPagination(paginatedData) {
        const paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) return;
        
        // 更新信息
        const pageStart = (paginatedData.page - 1) * paginatedData.pageSize + 1;
        const pageEnd = Math.min(paginatedData.page * paginatedData.pageSize, paginatedData.total);
        
        document.querySelector('#pageStart').textContent = pageStart;
        document.querySelector('#pageEnd').textContent = pageEnd;
        document.querySelector('#totalCount').textContent = paginatedData.total;
        
        // 渲染分页按钮
        const pagination = document.querySelector('#pagination');
        if (!pagination) return;
        
        let paginationHTML = '';
        
        // 上一页
        paginationHTML += `
            <button ${paginatedData.page <= 1 ? 'disabled' : ''} onclick="changePage(${paginatedData.page - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // 页码
        for (let i = 1; i <= paginatedData.totalPages; i++) {
            if (i === paginatedData.page) {
                paginationHTML += `<button class="active">${i}</button>`;
            } else if (Math.abs(i - paginatedData.page) <= 2 || i === 1 || i === paginatedData.totalPages) {
                paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
            } else if (Math.abs(i - paginatedData.page) === 3) {
                paginationHTML += `<span>...</span>`;
            }
        }
        
        // 下一页
        paginationHTML += `
            <button ${paginatedData.page >= paginatedData.totalPages ? 'disabled' : ''} onclick="changePage(${paginatedData.page + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }
    
    changePage(page) {
        this.options.currentPage = page;
        this.render();
    }
}

// 用户表格组件
class UserTable extends DataTable {
    renderTable(data) {
        let html = '';
        
        data.forEach(user => {
            html += `
                <tr>
                    <td>
                        <input type="checkbox" value="${user.id}">
                    </td>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${utils.getRoleText(user.role)}</td>
                    <td>
                        <span class="${utils.getStatusClass(user.status)}">
                            ${utils.getStatusText(user.status)}
                        </span>
                    </td>
                    <td>${utils.formatTime(user.createTime)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                            编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                            删除
                        </button>
                    </td>
                </tr>
            `;
        });
        
        this.tbody.innerHTML = html;
    }
}

// 图表组件
class Chart {
    static renderVisitChart() {
        const canvas = document.getElementById('visitChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = mockData.chartData.visitTrend;
        
        // 简单的柱状图实现
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = canvas.width / data.labels.length;
        const maxValue = Math.max(...data.data);
        
        data.data.forEach((value, index) => {
            const barHeight = (value / maxValue) * (canvas.height - 40);
            const x = index * barWidth + 10;
            const y = canvas.height - barHeight - 20;
            
            // 绘制柱子
            ctx.fillStyle = '#409eff';
            ctx.fillRect(x, y, barWidth - 20, barHeight);
            
            // 绘制标签
            ctx.fillStyle = '#606266';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(data.labels[index], x + (barWidth - 20) / 2, canvas.height - 5);
            
            // 绘制数值
            ctx.fillText(value, x + (barWidth - 20) / 2, y - 5);
        });
    }
    
    static renderUserChart() {
        const canvas = document.getElementById('userChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = mockData.chartData.userDistribution;
        
        // 简单的饼图实现
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c'];
        const total = data.data.reduce((sum, value) => sum + value, 0);
        
        let currentAngle = 0;
        
        data.data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            // 绘制扇形
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            
            // 绘制标签
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 15);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 15);
            
            ctx.fillStyle = '#606266';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${data.labels[index]} ${value}%`, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
    }
}

// 权限树组件
class PermissionTree {
    constructor(selector, permissions) {
        this.container = document.querySelector(selector);
        this.permissions = permissions;
        this.selectedPermissions = new Set();
        
        this.render();
        this.bindEvents();
    }
    
    render() {
        const categories = {
            basic: '基础功能',
            manage: '管理功能',
            system: '系统功能'
        };
        
        let html = '';
        
        Object.entries(categories).forEach(([category, categoryName]) => {
            const categoryPermissions = this.permissions.filter(p => p.category === category);
            
            html += `
                <div class="tree-node parent">
                    <input type="checkbox" class="tree-checkbox category-checkbox" data-category="${category}">
                    <span>${categoryName}</span>
                </div>
            `;
            
            categoryPermissions.forEach(permission => {
                html += `
                    <div class="tree-node child">
                        <input type="checkbox" class="tree-checkbox permission-checkbox" 
                               data-permission="${permission.id}" data-category="${category}">
                        <span>${permission.name}</span>
                        <small style="color: #909399; margin-left: 8px;">${permission.description}</small>
                    </div>
                `;
            });
        });
        
        this.container.innerHTML = html;
    }
    
    bindEvents() {
        // 分类复选框事件
        this.container.querySelectorAll('.category-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const category = e.target.dataset.category;
                const checked = e.target.checked;
                
                // 更新该分类下的所有权限
                this.container.querySelectorAll(`[data-category="${category}"].permission-checkbox`).forEach(cb => {
                    cb.checked = checked;
                    if (checked) {
                        this.selectedPermissions.add(cb.dataset.permission);
                    } else {
                        this.selectedPermissions.delete(cb.dataset.permission);
                    }
                });
            });
        });
        
        // 权限复选框事件
        this.container.querySelectorAll('.permission-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const permission = e.target.dataset.permission;
                const category = e.target.dataset.category;
                const checked = e.target.checked;
                
                if (checked) {
                    this.selectedPermissions.add(permission);
                } else {
                    this.selectedPermissions.delete(permission);
                }
                
                // 更新分类复选框状态
                const categoryCheckbox = this.container.querySelector(`[data-category="${category}"].category-checkbox`);
                const categoryPermissions = this.container.querySelectorAll(`[data-category="${category}"].permission-checkbox`);
                const checkedCount = Array.from(categoryPermissions).filter(cb => cb.checked).length;
                
                if (checkedCount === 0) {
                    categoryCheckbox.checked = false;
                    categoryCheckbox.indeterminate = false;
                } else if (checkedCount === categoryPermissions.length) {
                    categoryCheckbox.checked = true;
                    categoryCheckbox.indeterminate = false;
                } else {
                    categoryCheckbox.checked = false;
                    categoryCheckbox.indeterminate = true;
                }
            });
        });
    }
    
    setSelectedPermissions(permissions) {
        this.selectedPermissions = new Set(permissions);
        
        // 更新复选框状态
        this.container.querySelectorAll('.permission-checkbox').forEach(checkbox => {
            checkbox.checked = this.selectedPermissions.has(checkbox.dataset.permission);
        });
        
        // 更新分类复选框状态
        this.container.querySelectorAll('.category-checkbox').forEach(categoryCheckbox => {
            const category = categoryCheckbox.dataset.category;
            const categoryPermissions = this.container.querySelectorAll(`[data-category="${category}"].permission-checkbox`);
            const checkedCount = Array.from(categoryPermissions).filter(cb => cb.checked).length;
            
            if (checkedCount === 0) {
                categoryCheckbox.checked = false;
                categoryCheckbox.indeterminate = false;
            } else if (checkedCount === categoryPermissions.length) {
                categoryCheckbox.checked = true;
                categoryCheckbox.indeterminate = false;
            } else {
                categoryCheckbox.checked = false;
                categoryCheckbox.indeterminate = true;
            }
        });
    }
    
    getSelectedPermissions() {
        return Array.from(this.selectedPermissions);
    }
}

// 表单验证组件
class FormValidator {
    constructor(form) {
        this.form = form;
        this.rules = {};
        this.errors = {};
    }
    
    addRule(field, rule) {
        if (!this.rules[field]) {
            this.rules[field] = [];
        }
        this.rules[field].push(rule);
    }
    
    validate() {
        this.errors = {};
        let isValid = true;
        
        Object.entries(this.rules).forEach(([field, rules]) => {
            const input = this.form.querySelector(`[name="${field}"]`);
            if (!input) return;
            
            const value = input.value.trim();
            
            rules.forEach(rule => {
                if (this.errors[field]) return; // 已有错误，跳过后续验证
                
                if (rule.required && !value) {
                    this.errors[field] = rule.message || `${field}不能为空`;
                    isValid = false;
                } else if (rule.pattern && value && !rule.pattern.test(value)) {
                    this.errors[field] = rule.message || `${field}格式不正确`;
                    isValid = false;
                } else if (rule.minLength && value.length < rule.minLength) {
                    this.errors[field] = rule.message || `${field}长度不能少于${rule.minLength}位`;
                    isValid = false;
                } else if (rule.maxLength && value.length > rule.maxLength) {
                    this.errors[field] = rule.message || `${field}长度不能超过${rule.maxLength}位`;
                    isValid = false;
                }
            });
        });
        
        this.showErrors();
        return isValid;
    }
    
    showErrors() {
        // 清除之前的错误提示
        this.form.querySelectorAll('.error-message').forEach(el => el.remove());
        this.form.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
        
        // 显示新的错误提示
        Object.entries(this.errors).forEach(([field, message]) => {
            const input = this.form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('error');
                
                const errorEl = document.createElement('div');
                errorEl.className = 'error-message';
                errorEl.textContent = message;
                errorEl.style.color = '#f56c6c';
                errorEl.style.fontSize = '12px';
                errorEl.style.marginTop = '4px';
                
                input.parentNode.appendChild(errorEl);
            }
        });
    }
    
    clearErrors() {
        this.errors = {};
        this.form.querySelectorAll('.error-message').forEach(el => el.remove());
        this.form.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
    }
}

// 加载状态管理
class LoadingManager {
    static show(target) {
        if (typeof target === 'string') {
            target = document.querySelector(target);
        }
        
        if (!target) return;
        
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner">
                <div class="loading"></div>
                <div style="margin-top: 12px; color: #909399; font-size: 14px;">加载中...</div>
            </div>
        `;
        loading.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        target.style.position = 'relative';
        target.appendChild(loading);
    }
    
    static hide(target) {
        if (typeof target === 'string') {
            target = document.querySelector(target);
        }
        
        if (!target) return;
        
        const loading = target.querySelector('.loading-overlay');
        if (loading) {
            target.removeChild(loading);
        }
    }
}

// 导出组件
window.Message = Message;
window.ConfirmDialog = ConfirmDialog;
window.Modal = Modal;
window.DataTable = DataTable;
window.UserTable = UserTable;
window.Chart = Chart;
window.PermissionTree = PermissionTree;
window.FormValidator = FormValidator;
window.LoadingManager = LoadingManager;
