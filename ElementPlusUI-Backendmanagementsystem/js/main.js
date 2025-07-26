// 主要功能模块

// 全局变量
let currentPage = 'dashboard';
let userTable = null;
let userModal = null;
let roleModal = null;
let permissionTree = null;
let currentEditingUser = null;
let currentEditingRole = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 应用初始化
function initializeApp() {
    initializeLayout();
    initializeModals();
    initializeEventListeners();
    initializeTables();
    initializeCharts();
    loadDashboardData();
    
    // 显示首页
    showPage('dashboard');
}

// 布局初始化
function initializeLayout() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    // 侧边栏切换
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
    });
    
    // 导航菜单点击
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活跃状态
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 添加当前活跃状态
            this.classList.add('active');
            
            // 显示对应页面
            const page = this.dataset.page;
            showPage(page);
        });
    });
}

// 模态框初始化
function initializeModals() {
    userModal = new Modal('#userModal');
    roleModal = new Modal('#roleModal');
    
    // 权限树初始化
    permissionTree = new PermissionTree('#permissionTree', mockData.permissions);
}

// 事件监听器初始化
function initializeEventListeners() {
    // 添加用户按钮
    document.getElementById('addUserBtn').addEventListener('click', function() {
        openUserModal();
    });
    
    // 保存用户按钮
    document.getElementById('saveUserBtn').addEventListener('click', function() {
        saveUser();
    });
    
    // 添加角色按钮
    document.getElementById('addRoleBtn').addEventListener('click', function() {
        openRoleModal();
    });
    
    // 保存角色按钮
    document.getElementById('saveRoleBtn').addEventListener('click', function() {
        saveRole();
    });
    
    // 搜索功能
    document.getElementById('searchBtn').addEventListener('click', function() {
        searchUsers();
    });
    
    // 重置搜索
    document.getElementById('resetBtn').addEventListener('click', function() {
        resetUserSearch();
    });
    
    // 导出日志
    document.getElementById('exportLogsBtn').addEventListener('click', function() {
        exportLogs();
    });
    
    // 日志筛选
    document.getElementById('filterLogsBtn').addEventListener('click', function() {
        filterLogs();
    });
    
    // 重置日志筛选
    document.getElementById('resetLogsBtn').addEventListener('click', function() {
        resetLogFilter();
    });
    
    // 实时搜索
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', utils.debounce(function() {
            searchUsers();
        }, 300));
    }
}

// 表格初始化
function initializeTables() {
    userTable = new UserTable('#userTable', {
        pageSize: 10,
        currentPage: 1
    });
    
    // 设置用户数据
    userTable.setData(mockData.users);
}

// 图表初始化
function initializeCharts() {
    Chart.renderVisitChart();
    Chart.renderUserChart();
}

// 页面切换
function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageId;
        
        // 更新面包屑
        updateBreadcrumb(pageId);
        
        // 加载页面数据
        loadPageData(pageId);
    }
}

// 更新面包屑导航
function updateBreadcrumb(pageId) {
    const breadcrumb = document.getElementById('breadcrumb');
    const pageNames = {
        'dashboard': '首页仪表板',
        'users': '用户管理',
        'roles': '角色管理',
        'system': '系统管理',
        'logs': '系统日志'
    };
    
    breadcrumb.innerHTML = `<span>首页</span> / <span>${pageNames[pageId] || pageId}</span>`;
}

// 加载页面数据
function loadPageData(pageId) {
    switch (pageId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'roles':
            loadRolesData();
            break;
        case 'system':
            loadSystemData();
            break;
        case 'logs':
            loadLogsData();
            break;
    }
}

// 加载仪表板数据
function loadDashboardData() {
    // 更新统计数据
    const stats = mockData.stats;
    document.querySelector('.stat-card:nth-child(1) h3').textContent = stats.totalUsers.toLocaleString();
    document.querySelector('.stat-card:nth-child(2) h3').textContent = stats.activeUsers.toLocaleString();
    document.querySelector('.stat-card:nth-child(3) h3').textContent = stats.todayVisits.toLocaleString();
    document.querySelector('.stat-card:nth-child(4) h3').textContent = stats.systemWarnings.toLocaleString();
    
    // 更新最近活动
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        let html = '';
        mockData.recentActivities.forEach(activity => {
            html += `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas ${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <p>${activity.content}</p>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `;
        });
        activityList.innerHTML = html;
    }
    
    // 重新渲染图表
    setTimeout(() => {
        Chart.renderVisitChart();
        Chart.renderUserChart();
    }, 100);
}

// 加载用户数据
function loadUsersData() {
    if (userTable) {
        userTable.setData(mockData.users);
    }
}

// 加载角色数据
function loadRolesData() {
    const rolesGrid = document.getElementById('rolesGrid');
    if (!rolesGrid) return;
    
    let html = '';
    mockData.roles.forEach(role => {
        const permissionNames = role.permissions.map(p => {
            const permission = mockData.permissions.find(perm => perm.id === p);
            return permission ? permission.name : p;
        });
        
        html += `
            <div class="role-card">
                <div class="role-header">
                    <div class="role-title">${role.name}</div>
                    <div class="role-actions">
                        <button class="btn btn-sm btn-primary" onclick="editRole(${role.id})">
                            <i class="fas fa-edit"></i>
                            编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteRole(${role.id})">
                            <i class="fas fa-trash"></i>
                            删除
                        </button>
                    </div>
                </div>
                <div class="role-desc">${role.description}</div>
                <div class="role-permissions">
                    <div class="permission-tags">
                        ${permissionNames.map(name => `<span class="permission-tag">${name}</span>`).join('')}
                    </div>
                </div>
                <div style="margin-top: 16px; color: #909399; font-size: 14px;">
                    <i class="fas fa-users"></i>
                    ${role.userCount} 个用户
                </div>
            </div>
        `;
    });
    
    rolesGrid.innerHTML = html;
}

// 加载系统数据
function loadSystemData() {
    const config = mockData.systemConfig;
    
    // 基本设置
    const basicForm = document.querySelector('.config-section:first-child .config-form');
    if (basicForm) {
        basicForm.querySelector('input[type="text"]').value = config.basic.systemName;
        basicForm.querySelector('textarea').value = config.basic.systemDesc;
        basicForm.querySelectorAll('input[type="text"]')[1].value = config.basic.systemVersion;
    }
    
    // 安全设置
    const securityForm = document.querySelector('.config-section:last-child .config-form');
    if (securityForm) {
        const inputs = securityForm.querySelectorAll('input[type="number"]');
        inputs[0].value = config.security.minPasswordLength;
        inputs[1].value = config.security.maxLoginAttempts;
        inputs[2].value = config.security.sessionTimeout;
    }
}

// 加载日志数据
function loadLogsData() {
    const logList = document.getElementById('logList');
    if (!logList) return;
    
    let html = '';
    mockData.logs.forEach(log => {
        html += `
            <div class="log-item">
                <div class="${utils.getLogLevelClass(log.level)}">
                    ${utils.getLogLevelText(log.level)}
                </div>
                <div class="log-time">${log.time}</div>
                <div class="log-content">
                    <strong>${log.action}</strong> - ${log.content}
                    <br>
                    <small style="color: #909399;">用户: ${log.user} | IP: ${log.ip}</small>
                </div>
            </div>
        `;
    });
    
    logList.innerHTML = html;
}

// 用户管理功能
function openUserModal(userId = null) {
    currentEditingUser = userId;
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const title = document.getElementById('modalTitle');
    
    if (userId) {
        // 编辑模式
        const user = mockData.users.find(u => u.id === userId);
        if (user) {
            title.textContent = '编辑用户';
            form.username.value = user.username;
            form.email.value = user.email;
            form.password.value = '';
            form.password.placeholder = '留空则不修改密码';
            form.role.value = user.role;
            form.status.value = user.status;
        }
    } else {
        // 添加模式
        title.textContent = '添加用户';
        form.reset();
        form.password.placeholder = '请输入密码';
    }
    
    userModal.show();
}

function saveUser() {
    const form = document.getElementById('userForm');
    const validator = new FormValidator(form);
    
    // 添加验证规则
    validator.addRule('username', { required: true, message: '用户名不能为空' });
    validator.addRule('username', { minLength: 3, message: '用户名长度不能少于3位' });
    validator.addRule('email', { required: true, message: '邮箱不能为空' });
    validator.addRule('email', { 
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
        message: '邮箱格式不正确' 
    });
    
    if (!currentEditingUser) {
        validator.addRule('password', { required: true, message: '密码不能为空' });
        validator.addRule('password', { minLength: 6, message: '密码长度不能少于6位' });
    }
    
    if (!validator.validate()) {
        return;
    }
    
    // 模拟保存
    LoadingManager.show('#userModal .modal-content');
    
    setTimeout(() => {
        LoadingManager.hide('#userModal .modal-content');
        
        if (currentEditingUser) {
            // 更新用户
            const userIndex = mockData.users.findIndex(u => u.id === currentEditingUser);
            if (userIndex !== -1) {
                mockData.users[userIndex] = {
                    ...mockData.users[userIndex],
                    username: form.username.value,
                    email: form.email.value,
                    role: form.role.value,
                    status: form.status.value
                };
            }
            Message.success('用户更新成功');
        } else {
            // 添加用户
            const newUser = {
                id: utils.generateId(),
                username: form.username.value,
                email: form.email.value,
                role: form.role.value,
                status: form.status.value,
                createTime: new Date().toLocaleString('zh-CN'),
                lastLogin: '-'
            };
            mockData.users.unshift(newUser);
            Message.success('用户添加成功');
        }
        
        userModal.hide();
        userTable.setData(mockData.users);
    }, 1000);
}

function editUser(userId) {
    openUserModal(userId);
}

function deleteUser(userId) {
    const user = mockData.users.find(u => u.id === userId);
    if (!user) return;
    
    ConfirmDialog.show(
        '确认删除',
        `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
        () => {
            // 删除用户
            const index = mockData.users.findIndex(u => u.id === userId);
            if (index !== -1) {
                mockData.users.splice(index, 1);
                userTable.setData(mockData.users);
                Message.success('用户删除成功');
            }
        }
    );
}

function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const roleFilter = document.getElementById('roleFilter').value;
    
    const filters = {};
    if (statusFilter) filters.status = statusFilter;
    if (roleFilter) filters.role = roleFilter;
    
    userTable.filter(searchTerm, filters);
}

function resetUserSearch() {
    document.getElementById('userSearch').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('roleFilter').value = '';
    
    userTable.filter('', {});
}

// 分页功能
function changePage(page) {
    if (userTable) {
        userTable.changePage(page);
    }
}

// 角色管理功能
function openRoleModal(roleId = null) {
    currentEditingRole = roleId;
    const modal = document.getElementById('roleModal');
    const form = document.getElementById('roleForm');
    const title = document.getElementById('roleModalTitle');
    
    if (roleId) {
        // 编辑模式
        const role = mockData.roles.find(r => r.id === roleId);
        if (role) {
            title.textContent = '编辑角色';
            form.roleName.value = role.name;
            form.roleDesc.value = role.description;
            permissionTree.setSelectedPermissions(role.permissions);
        }
    } else {
        // 添加模式
        title.textContent = '添加角色';
        form.reset();
        permissionTree.setSelectedPermissions([]);
    }
    
    roleModal.show();
}

function saveRole() {
    const form = document.getElementById('roleForm');
    const validator = new FormValidator(form);
    
    // 添加验证规则
    validator.addRule('roleName', { required: true, message: '角色名称不能为空' });
    
    if (!validator.validate()) {
        return;
    }
    
    const selectedPermissions = permissionTree.getSelectedPermissions();
    if (selectedPermissions.length === 0) {
        Message.error('请至少选择一个权限');
        return;
    }
    
    // 模拟保存
    LoadingManager.show('#roleModal .modal-content');
    
    setTimeout(() => {
        LoadingManager.hide('#roleModal .modal-content');
        
        if (currentEditingRole) {
            // 更新角色
            const roleIndex = mockData.roles.findIndex(r => r.id === currentEditingRole);
            if (roleIndex !== -1) {
                mockData.roles[roleIndex] = {
                    ...mockData.roles[roleIndex],
                    name: form.roleName.value,
                    description: form.roleDesc.value,
                    permissions: selectedPermissions
                };
            }
            Message.success('角色更新成功');
        } else {
            // 添加角色
            const newRole = {
                id: utils.generateId(),
                name: form.roleName.value,
                description: form.roleDesc.value,
                permissions: selectedPermissions,
                userCount: 0,
                createTime: new Date().toLocaleString('zh-CN')
            };
            mockData.roles.push(newRole);
            Message.success('角色添加成功');
        }
        
        roleModal.hide();
        loadRolesData();
    }, 1000);
}

function editRole(roleId) {
    openRoleModal(roleId);
}

function deleteRole(roleId) {
    const role = mockData.roles.find(r => r.id === roleId);
    if (!role) return;
    
    if (role.userCount > 0) {
        Message.warning('该角色下还有用户，无法删除');
        return;
    }
    
    ConfirmDialog.show(
        '确认删除',
        `确定要删除角色 "${role.name}" 吗？此操作不可恢复。`,
        () => {
            // 删除角色
            const index = mockData.roles.findIndex(r => r.id === roleId);
            if (index !== -1) {
                mockData.roles.splice(index, 1);
                loadRolesData();
                Message.success('角色删除成功');
            }
        }
    );
}

// 日志管理功能
function filterLogs() {
    const level = document.getElementById('logLevelFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const searchTerm = document.getElementById('logSearch').value;
    
    let filteredLogs = [...mockData.logs];
    
    // 按级别筛选
    if (level) {
        filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    // 按日期筛选
    if (startDate) {
        filteredLogs = filteredLogs.filter(log => log.time >= startDate);
    }
    if (endDate) {
        filteredLogs = filteredLogs.filter(log => log.time <= endDate + ' 23:59:59');
    }
    
    // 按内容搜索
    if (searchTerm) {
        filteredLogs = filteredLogs.filter(log => 
            log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // 渲染筛选后的日志
    renderFilteredLogs(filteredLogs);
}

function renderFilteredLogs(logs) {
    const logList = document.getElementById('logList');
    if (!logList) return;
    
    if (logs.length === 0) {
        logList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>没有找到符合条件的日志</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    logs.forEach(log => {
        html += `
            <div class="log-item">
                <div class="${utils.getLogLevelClass(log.level)}">
                    ${utils.getLogLevelText(log.level)}
                </div>
                <div class="log-time">${log.time}</div>
                <div class="log-content">
                    <strong>${log.action}</strong> - ${log.content}
                    <br>
                    <small style="color: #909399;">用户: ${log.user} | IP: ${log.ip}</small>
                </div>
            </div>
        `;
    });
    
    logList.innerHTML = html;
}

function resetLogFilter() {
    document.getElementById('logLevelFilter').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('logSearch').value = '';
    
    loadLogsData();
}

function exportLogs() {
    // 模拟导出功能
    LoadingManager.show('#logs');
    
    setTimeout(() => {
        LoadingManager.hide('#logs');
        
        // 创建CSV内容
        const headers = ['时间', '级别', '用户', '操作', '内容', 'IP地址'];
        const csvContent = [
            headers.join(','),
            ...mockData.logs.map(log => [
                log.time,
                utils.getLogLevelText(log.level),
                log.user,
                log.action,
                `"${log.content}"`,
                log.ip
            ].join(','))
        ].join('\n');
        
        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `系统日志_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Message.success('日志导出成功');
    }, 1500);
}

// 系统管理功能
function saveSystemConfig() {
    const basicForm = document.querySelector('.config-section:first-child .config-form');
    const securityForm = document.querySelector('.config-section:last-child .config-form');
    
    // 模拟保存配置
    LoadingManager.show('.system-config');
    
    setTimeout(() => {
        LoadingManager.hide('.system-config');
        
        // 更新配置数据
        if (basicForm) {
            mockData.systemConfig.basic.systemName = basicForm.querySelector('input[type="text"]').value;
            mockData.systemConfig.basic.systemDesc = basicForm.querySelector('textarea').value;
            mockData.systemConfig.basic.systemVersion = basicForm.querySelectorAll('input[type="text"]')[1].value;
        }
        
        if (securityForm) {
            const inputs = securityForm.querySelectorAll('input[type="number"]');
            mockData.systemConfig.security.minPasswordLength = parseInt(inputs[0].value);
            mockData.systemConfig.security.maxLoginAttempts = parseInt(inputs[1].value);
            mockData.systemConfig.security.sessionTimeout = parseInt(inputs[2].value);
        }
        
        Message.success('系统配置保存成功');
    }, 1000);
}

// 绑定系统配置保存事件
document.addEventListener('DOMContentLoaded', function() {
    const saveConfigBtn = document.querySelector('.config-actions .btn-primary');
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', saveSystemConfig);
    }
    
    const resetConfigBtn = document.querySelector('.config-actions .btn-default');
    if (resetConfigBtn) {
        resetConfigBtn.addEventListener('click', function() {
            loadSystemData();
            Message.success('配置已重置');
        });
    }
});

// 响应式处理
function handleResize() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (window.innerWidth <= 768) {
        // 移动端
        sidebar.classList.add('collapsed');
        if (sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
        }
    } else {
        // 桌面端
        sidebar.classList.remove('show');
    }
    
    // 重新渲染图表
    if (currentPage === 'dashboard') {
        setTimeout(() => {
            Chart.renderVisitChart();
            Chart.renderUserChart();
        }, 100);
    }
}

// 监听窗口大小变化
window.addEventListener('resize', utils.throttle(handleResize, 250));

// 移动端侧边栏显示/隐藏
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('show');
    }
}

// 点击遮罩关闭移动端侧边栏
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (window.innerWidth <= 768 && 
        sidebar.classList.contains('show') && 
        !sidebar.contains(e.target) && 
        !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('show');
    }
});

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K 打开搜索
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('userSearch');
        if (searchInput && currentPage === 'users') {
            searchInput.focus();
        }
    }
    
    // ESC 关闭模态框
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && currentPage === 'dashboard') {
        // 页面重新可见时刷新仪表板数据
        loadDashboardData();
    }
});

// 错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
    Message.error('页面发生错误，请刷新重试');
});

// 未处理的Promise错误
window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise错误:', e.reason);
    Message.error('操作失败，请重试');
});

// 导出全局函数供HTML调用
window.editUser = editUser;
window.deleteUser = deleteUser;
window.editRole = editRole;
window.deleteRole = deleteRole;
window.changePage = changePage;
window.toggleMobileSidebar = toggleMobileSidebar;