// 工单管理模块
const Tickets = {
    // 当前数据
    data: {
        tickets: [],
        filteredTickets: [],
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
        filters: {
            search: '',
            status: '',
            priority: '',
            category: '',
            sortBy: 'created_desc'
        }
    },

    // 初始化
    init() {
        this.loadTickets();
        this.setupEventListeners();
        this.renderTickets();
    },

    // 设置事件监听器
    setupEventListeners() {
        // 搜索框
        const searchInput = Utils.dom.$('#searchInput');
        if (searchInput) {
            const debouncedSearch = Utils.debounce(() => {
                this.handleSearch();
            }, 300);
            Utils.events.on(searchInput, 'input', debouncedSearch);
        }

        // 筛选器
        const filters = ['statusFilter', 'priorityFilter', 'categoryFilter', 'sortBy'];
        filters.forEach(filterId => {
            const filterElement = Utils.dom.$(`#${filterId}`);
            if (filterElement) {
                Utils.events.on(filterElement, 'change', () => {
                    this.handleFilter();
                });
            }
        });

        // 创建工单按钮
        const createBtn = Utils.dom.$('#createTicketBtn');
        if (createBtn) {
            Utils.events.on(createBtn, 'click', () => {
                this.showCreateForm();
            });
        }

        // 模态框关闭
        const modalClose = Utils.dom.$('#modalClose');
        if (modalClose) {
            Utils.events.on(modalClose, 'click', () => {
                Utils.modal.hide('#ticketModal');
            });
        }

        // 点击模态框背景关闭
        const modal = Utils.dom.$('#ticketModal');
        if (modal) {
            Utils.events.on(modal, 'click', (e) => {
                if (e.target === modal) {
                    Utils.modal.hide('#ticketModal');
                }
            });
        }
    },

    // 加载工单数据
    loadTickets() {
        this.data.tickets = Utils.storage.get('tickets', []);
        this.applyFilters();
    },

    // 处理搜索
    handleSearch() {
        const searchInput = Utils.dom.$('#searchInput');
        this.data.filters.search = searchInput ? searchInput.value.trim() : '';
        this.data.currentPage = 1;
        this.applyFilters();
        this.renderTickets();
    },

    // 处理筛选
    handleFilter() {
        this.data.filters.status = Utils.dom.$('#statusFilter')?.value || '';
        this.data.filters.priority = Utils.dom.$('#priorityFilter')?.value || '';
        this.data.filters.category = Utils.dom.$('#categoryFilter')?.value || '';
        this.data.filters.sortBy = Utils.dom.$('#sortBy')?.value || 'created_desc';
        
        this.data.currentPage = 1;
        this.applyFilters();
        this.renderTickets();
    },

    // 应用筛选条件
    applyFilters() {
        let filtered = [...this.data.tickets];

        // 搜索筛选
        if (this.data.filters.search) {
            filtered = AIFeatures.smartSearch(this.data.filters.search, filtered);
        }

        // 状态筛选
        if (this.data.filters.status) {
            filtered = filtered.filter(ticket => ticket.status === this.data.filters.status);
        }

        // 优先级筛选
        if (this.data.filters.priority) {
            filtered = filtered.filter(ticket => ticket.priority === this.data.filters.priority);
        }

        // 分类筛选
        if (this.data.filters.category) {
            filtered = filtered.filter(ticket => ticket.category === this.data.filters.category);
        }

        // 排序
        filtered = AIFeatures.smartSort(filtered, this.data.filters.sortBy);

        this.data.filteredTickets = filtered;
        this.data.totalPages = Math.ceil(filtered.length / this.data.pageSize);
    },

    // 渲染工单列表
    renderTickets() {
        const container = Utils.dom.$('#ticketsContainer');
        if (!container) return;

        const startIndex = (this.data.currentPage - 1) * this.data.pageSize;
        const endIndex = startIndex + this.data.pageSize;
        const pageTickets = this.data.filteredTickets.slice(startIndex, endIndex);

        if (pageTickets.length === 0) {
            this.renderEmptyState(container);
            this.renderPagination();
            return;
        }

        container.innerHTML = pageTickets.map(ticket => this.renderTicketCard(ticket)).join('');
        this.renderPagination();

        // 添加事件监听器
        this.attachTicketEventListeners();
    },

    // 渲染工单卡片
    renderTicketCard(ticket) {
        const statusClass = ticket.status;
        const priorityClass = ticket.priority;
        const categoryName = this.getCategoryDisplayName(ticket.category);
        const priorityName = this.getPriorityDisplayName(ticket.priority);
        const statusName = this.getStatusDisplayName(ticket.status);

        return `
            <div class="ticket-card" data-ticket-id="${ticket.id}">
                <div class="ticket-header">
                    <div>
                        <h3 class="ticket-title">${Utils.string.highlight(ticket.title, this.data.filters.search)}</h3>
                        <p class="ticket-id">#${ticket.id}</p>
                    </div>
                    <div class="ticket-actions">
                        <button class="ticket-action-btn" data-action="view" title="查看详情">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <button class="ticket-action-btn" data-action="edit" title="编辑">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="ticket-action-btn" data-action="delete" title="删除">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="ticket-meta">
                    <span class="ticket-status ${statusClass}">${statusName}</span>
                    <span class="ticket-priority ${priorityClass}">
                        <span class="priority-indicator"></span>
                        ${priorityName}
                    </span>
                    <span class="ticket-category">${categoryName}</span>
                </div>
                
                <div class="ticket-description">
                    ${Utils.string.highlight(Utils.string.truncate(ticket.description, 120), this.data.filters.search)}
                </div>
                
                <div class="ticket-footer">
                    <div class="ticket-author">
                        <div class="author-avatar">${ticket.author?.name?.charAt(0) || 'U'}</div>
                        <span>${ticket.author?.name || '未知用户'}</span>
                    </div>
                    <div class="ticket-date" title="${Utils.formatDate(ticket.createdAt)}">
                        ${Utils.formatRelativeTime(ticket.createdAt)}
                    </div>
                </div>
            </div>
        `;
    },

    // 渲染空状态
    renderEmptyState(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                    </svg>
                </div>
                <h3 class="empty-title">暂无工单</h3>
                <p class="empty-description">
                    ${this.data.filters.search || this.data.filters.status || this.data.filters.priority || this.data.filters.category 
                        ? '没有找到符合条件的工单，请尝试调整筛选条件' 
                        : '还没有创建任何工单，点击上方按钮创建第一个工单'}
                </p>
                ${!this.data.filters.search && !this.data.filters.status && !this.data.filters.priority && !this.data.filters.category 
                    ? '<button class="btn btn-primary" onclick="Tickets.showCreateForm()">创建工单</button>' 
                    : ''}
            </div>
        `;
    },

    // 渲染分页
    renderPagination() {
        const container = Utils.dom.$('#pagination');
        if (!container) return;

        if (this.data.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const currentPage = this.data.currentPage;
        const totalPages = this.data.totalPages;
        const startItem = (currentPage - 1) * this.data.pageSize + 1;
        const endItem = Math.min(currentPage * this.data.pageSize, this.data.filteredTickets.length);

        let paginationHTML = `
            <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                    onclick="Tickets.goToPage(${currentPage - 1})" 
                    ${currentPage === 1 ? 'disabled' : ''}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15,18 9,12 15,6"/>
                </svg>
            </button>
        `;

        // 页码按钮
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="Tickets.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="Tickets.goToPage(${i})">${i}</button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="pagination-btn" onclick="Tickets.goToPage(${totalPages})">${totalPages}</button>`;
        }

        paginationHTML += `
            <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="Tickets.goToPage(${currentPage + 1})" 
                    ${currentPage === totalPages ? 'disabled' : ''}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"/>
                </svg>
            </button>
            <div class="pagination-info">
                显示 ${startItem}-${endItem} 条，共 ${this.data.filteredTickets.length} 条
            </div>
        `;

        container.innerHTML = paginationHTML;
    },

    // 跳转到指定页面
    goToPage(page) {
        if (page < 1 || page > this.data.totalPages) return;
        this.data.currentPage = page;
        this.renderTickets();
    },

    // 附加工单事件监听器
    attachTicketEventListeners() {
        const ticketCards = Utils.dom.$$('.ticket-card');
        
        ticketCards.forEach(card => {
            const ticketId = card.dataset.ticketId;
            
            // 点击卡片查看详情
            Utils.events.on(card, 'click', (e) => {
                if (!e.target.closest('.ticket-action-btn')) {
                    this.viewTicket(ticketId);
                }
            });

            // 操作按钮
            const actionBtns = card.querySelectorAll('.ticket-action-btn');
            actionBtns.forEach(btn => {
                Utils.events.on(btn, 'click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    this.handleTicketAction(action, ticketId);
                });
            });
        });
    },

    // 处理工单操作
    handleTicketAction(action, ticketId) {
        switch (action) {
            case 'view':
                this.viewTicket(ticketId);
                break;
            case 'edit':
                this.editTicket(ticketId);
                break;
            case 'delete':
                this.deleteTicket(ticketId);
                break;
        }
    },

    // 查看工单详情
    viewTicket(ticketId) {
        const ticket = this.data.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const modalTitle = Utils.dom.$('#modalTitle');
        const modalBody = Utils.dom.$('#modalBody');

        if (modalTitle) modalTitle.textContent = '工单详情';
        if (modalBody) modalBody.innerHTML = this.renderTicketDetail(ticket);

        Utils.modal.show('#ticketModal');
        this.attachDetailEventListeners(ticket);
    },

    // 渲染工单详情
    renderTicketDetail(ticket) {
        const categoryName = this.getCategoryDisplayName(ticket.category);
        const priorityName = this.getPriorityDisplayName(ticket.priority);
        const statusName = this.getStatusDisplayName(ticket.status);

        return `
            <div class="ticket-detail">
                <div class="ticket-detail-header">
                    <div>
                        <h2 class="ticket-detail-title">${ticket.title}</h2>
                        <div class="ticket-detail-meta">
                            <span class="ticket-status ${ticket.status}">${statusName}</span>
                            <span class="ticket-priority ${ticket.priority}">
                                <span class="priority-indicator"></span>
                                ${priorityName}
                            </span>
                            <span class="ticket-category">${categoryName}</span>
                        </div>
                    </div>
                    <div class="ticket-detail-actions">
                        <button class="btn btn-secondary btn-sm" onclick="Tickets.editTicket('${ticket.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            编辑
                        </button>
                        <button class="btn btn-error btn-sm" onclick="Tickets.deleteTicket('${ticket.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            删除
                        </button>
                    </div>
                </div>
                
                <div class="ticket-detail-content">
                    <h4>详细描述</h4>
                    <div class="ticket-detail-description">${ticket.description}</div>
                </div>
                
                <div class="ticket-info-grid">
                    <div class="info-item">
                        <label>创建者</label>
                        <div class="info-value">
                            <div class="author-avatar">${ticket.author?.name?.charAt(0) || 'U'}</div>
                            <span>${ticket.author?.name || '未知用户'}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <label>创建时间</label>
                        <div class="info-value">${Utils.formatDate(ticket.createdAt)}</div>
                    </div>
                    <div class="info-item">
                        <label>最后更新</label>
                        <div class="info-value">${Utils.formatDate(ticket.updatedAt || ticket.createdAt)}</div>
                    </div>
                    <div class="info-item">
                        <label>工单ID</label>
                        <div class="info-value">#${ticket.id}</div>
                    </div>
                </div>
                
                ${this.renderStatusHistory(ticket)}
                ${this.renderComments(ticket)}
            </div>
        `;
    },

    // 渲染状态历史
    renderStatusHistory(ticket) {
        const history = ticket.statusHistory || [
            {
                status: ticket.status,
                timestamp: ticket.createdAt,
                user: ticket.author?.name || '系统',
                action: '创建工单'
            }
        ];

        return `
            <div class="status-history">
                <h4 class="status-history-title">状态历史</h4>
                <div class="status-timeline">
                    ${history.map(item => `
                        <div class="timeline-item">
                            <div class="timeline-content">
                                <div class="timeline-header">
                                    <span class="timeline-action">${item.action}</span>
                                    <span class="timeline-date">${Utils.formatRelativeTime(item.timestamp)}</span>
                                </div>
                                <div class="timeline-description">
                                    ${item.user} ${item.action}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // 渲染评论区域
    renderComments(ticket) {
        const comments = ticket.comments || [];
        
        return `
            <div class="comments-section">
                <div class="comments-header">
                    <h4 class="comments-title">评论</h4>
                    <span class="comments-count">${comments.length}</span>
                </div>
                
                <div class="comment-form">
                    <textarea placeholder="添加评论..." rows="3" id="newComment"></textarea>
                    <div class="comment-form-actions">
                        <button class="btn btn-secondary btn-sm" onclick="Utils.dom.$('#newComment').value = ''">取消</button>
                        <button class="btn btn-primary btn-sm" onclick="Tickets.addComment('${ticket.id}')">发表评论</button>
                    </div>
                </div>
                
                <div class="comments-list">
                    ${comments.map(comment => `
                        <div class="comment-item">
                            <div class="comment-avatar">${comment.author?.charAt(0) || 'U'}</div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <span class="comment-author">${comment.author || '匿名用户'}</span>
                                    <span class="comment-date">${Utils.formatRelativeTime(comment.createdAt)}</span>
                                </div>
                                <div class="comment-text">${comment.content}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // 附加详情页事件监听器
    attachDetailEventListeners(ticket) {
        // 状态变更按钮等可以在这里添加
    },

    // 添加评论
    addComment(ticketId) {
        const commentInput = Utils.dom.$('#newComment');
        if (!commentInput) return;

        const content = commentInput.value.trim();
        if (!content) {
            Utils.toast.show('请输入评论内容', 'warning');
            return;
        }

        const ticket = this.data.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const comment = {
            id: Utils.generateId(),
            content: content,
            author: Auth.currentUser?.name || '匿名用户',
            createdAt: new Date().toISOString()
        };

        if (!ticket.comments) ticket.comments = [];
        ticket.comments.push(comment);

        // 更新工单
        this.updateTicket(ticket);
        
        // 清空输入框
        commentInput.value = '';
        
        // 重新渲染详情页
        this.viewTicket(ticketId);
        
        Utils.toast.show('评论添加成功', 'success');
    },

    // 编辑工单
    editTicket(ticketId) {
        const ticket = this.data.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        // 切换到创建页面并填充数据
        App.showPage('create');
        
        // 填充表单数据
        setTimeout(() => {
            const titleInput = Utils.dom.$('#ticketTitle');
            const descriptionInput = Utils.dom.$('#ticketDescription');
            const prioritySelect = Utils.dom.$('#ticketPriority');
            const categorySelect = Utils.dom.$('#ticketCategory');

            if (titleInput) titleInput.value = ticket.title;
            if (descriptionInput) descriptionInput.value = ticket.description;
            if (prioritySelect) prioritySelect.value = ticket.priority;
            if (categorySelect) categorySelect.value = ticket.category;

            // 设置编辑模式
            const form = Utils.dom.$('#createTicketForm');
            if (form) {
                form.dataset.editId = ticketId;
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = '更新工单';
            }

            // 更新页面标题
            const pageTitle = Utils.dom.$('#pageTitle');
            if (pageTitle) pageTitle.textContent = '编辑工单';
        }, 100);

        // 关闭模态框
        Utils.modal.hide('#ticketModal');
    },

    // 删除工单
    deleteTicket(ticketId) {
        if (!confirm('确定要删除这个工单吗？此操作不可撤销。')) return;

        const index = this.data.tickets.findIndex(t => t.id === ticketId);
        if (index === -1) return;

        // 删除工单
        this.data.tickets.splice(index, 1);
        
        // 保存到本地存储
        Utils.storage.set('tickets', this.data.tickets);
        
        // 重新加载和渲染
        this.loadTickets();
        this.renderTickets();
        
        // 关闭模态框
        Utils.modal.hide('#ticketModal');
        
        // 更新仪表盘数据
        if (window.Dashboard) {
            Dashboard.refreshData();
        }
        
        Utils.toast.show('工单删除成功', 'success');
    },

    // 显示创建表单
    showCreateForm() {
        App.showPage('create');
        
        // 重置表单
        setTimeout(() => {
            const form = Utils.dom.$('#createTicketForm');
            if (form) {
                form.reset();
                delete form.dataset.editId;
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = '创建工单';
            }

            // 更新页面标题
            const pageTitle = Utils.dom.$('#pageTitle');
            if (pageTitle) pageTitle.textContent = '创建工单';

            // 隐藏AI建议
            AIFeatures.hideSuggestions();
        }, 100);
    },

    // 创建或更新工单
    saveTicket(formData) {
        const form = Utils.dom.$('#createTicketForm');
        const isEdit = form && form.dataset.editId;
        
        const ticketData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            category: formData.get('category'),
            author: Auth.currentUser || { name: '匿名用户', email: '' }
        };

        if (isEdit) {
            // 更新现有工单
            const ticketId = form.dataset.editId;
            const ticket = this.data.tickets.find(t => t.id === ticketId);
            
            if (ticket) {
                Object.assign(ticket, ticketData);
                ticket.updatedAt = new Date().toISOString();
                
                // 添加状态历史
                if (!ticket.statusHistory) ticket.statusHistory = [];
                ticket.statusHistory.push({
                    action: '更新工单',
                    timestamp: new Date().toISOString(),
                    user: Auth.currentUser?.name || '系统'
                });
                
                this.updateTicket(ticket);
                Utils.toast.show('工单更新成功', 'success');
            }
        } else {
            // 创建新工单
            const newTicket = {
                id: Utils.generateId(),
                ...ticketData,
                status: 'open',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                comments: [],
                statusHistory: [{
                    action: '创建工单',
                    timestamp: new Date().toISOString(),
                    user: Auth.currentUser?.name || '系统'
                }]
            };

            this.data.tickets.unshift(newTicket);
            Utils.storage.set('tickets', this.data.tickets);
            
            // 添加实时通知
            if (window.Dashboard) {
                Dashboard.addRealTimeNotification(newTicket);
                Dashboard.refreshData();
            }
            
            Utils.toast.show('工单创建成功', 'success');
        }

        // 重新加载数据
        this.loadTickets();
        
        // 跳转到工单列表
        setTimeout(() => {
            App.showPage('tickets');
        }, 1000);
    },

    // 更新工单
    updateTicket(ticket) {
        const index = this.data.tickets.findIndex(t => t.id === ticket.id);
        if (index !== -1) {
            this.data.tickets[index] = ticket;
            Utils.storage.set('tickets', this.data.tickets);
        }
    },

    // 获取分类显示名称
    getCategoryDisplayName(category) {
        const displayNames = {
            'bug': '故障报告',
            'feature': '功能请求',
            'support': '技术支持',
            'other': '其他'
        };
        return displayNames[category] || '其他';
    },

    // 获取优先级显示名称
    getPriorityDisplayName(priority) {
        const displayNames = {
            'urgent': '紧急',
            'high': '高',
            'medium': '中',
            'low': '低'
        };
        return displayNames[priority] || '中';
    },

    // 获取状态显示名称
    getStatusDisplayName(status) {
        const displayNames = {
            'open': '待处理',
            'in-progress': '进行中',
            'closed': '已完成'
        };
        return displayNames[status] || '待处理';
    },

    // 变更工单状态
    changeTicketStatus(ticketId, newStatus) {
        const ticket = this.data.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const oldStatus = ticket.status;
        ticket.status = newStatus;
        ticket.updatedAt = new Date().toISOString();

        // 添加状态历史
        if (!ticket.statusHistory) ticket.statusHistory = [];
        ticket.statusHistory.push({
            action: `状态从"${this.getStatusDisplayName(oldStatus)}"变更为"${this.getStatusDisplayName(newStatus)}"`,
            timestamp: new Date().toISOString(),
            user: Auth.currentUser?.name || '系统'
        });

        this.updateTicket(ticket);
        
        // 刷新显示
        this.loadTickets();
        this.renderTickets();
        
        // 更新仪表盘
        if (window.Dashboard) {
            Dashboard.refreshData();
        }
        
        Utils.toast.show(`工单状态已更新为"${this.getStatusDisplayName(newStatus)}"`, 'success');
    },

    // 批量操作
    batchOperation(operation, ticketIds) {
        if (!ticketIds || ticketIds.length === 0) return;

        switch (operation) {
            case 'delete':
                if (confirm(`确定要删除选中的 ${ticketIds.length} 个工单吗？`)) {
                    ticketIds.forEach(id => {
                        const index = this.data.tickets.findIndex(t => t.id === id);
                        if (index !== -1) {
                            this.data.tickets.splice(index, 1);
                        }
                    });
                    Utils.storage.set('tickets', this.data.tickets);
                    this.loadTickets();
                    this.renderTickets();
                    Utils.toast.show(`成功删除 ${ticketIds.length} 个工单`, 'success');
                }
                break;
            case 'close':
                ticketIds.forEach(id => {
                    this.changeTicketStatus(id, 'closed');
                });
                Utils.toast.show(`成功关闭 ${ticketIds.length} 个工单`, 'success');
                break;
        }
    },

    // 导出工单数据
    exportTickets(format = 'csv') {
        const tickets = this.data.filteredTickets.length > 0 ? this.data.filteredTickets : this.data.tickets;
        
        if (format === 'csv') {
            const csv = this.convertToCSV(tickets);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            this.downloadFile(blob, `工单列表_${Utils.formatDate(new Date(), 'YYYY-MM-DD')}.csv`);
        } else if (format === 'json') {
            const json = JSON.stringify(tickets, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            this.downloadFile(blob, `工单列表_${Utils.formatDate(new Date(), 'YYYY-MM-DD')}.json`);
        }
    },

    // 转换为CSV
    convertToCSV(tickets) {
        const headers = ['工单ID', '标题', '描述', '状态', '优先级', '分类', '创建者', '创建时间', '更新时间'];
        const rows = tickets.map(ticket => [
            ticket.id,
            ticket.title,
            ticket.description.replace(/"/g, '""'),
            this.getStatusDisplayName(ticket.status),
            this.getPriorityDisplayName(ticket.priority),
            this.getCategoryDisplayName(ticket.category),
            ticket.author?.name || '',
            Utils.formatDate(ticket.createdAt),
            Utils.formatDate(ticket.updatedAt || ticket.createdAt)
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return '\ufeff' + csvContent;
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

    // 获取工单统计
    getTicketStats() {
        return {
            total: this.data.tickets.length,
            filtered: this.data.filteredTickets.length,
            byStatus: this.data.tickets.reduce((acc, ticket) => {
                acc[ticket.status] = (acc[ticket.status] || 0) + 1;
                return acc;
            }, {}),
            byPriority: this.data.tickets.reduce((acc, ticket) => {
                acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
                return acc;
            }, {}),
            byCategory: this.data.tickets.reduce((acc, ticket) => {
                acc[ticket.category] = (acc[ticket.category] || 0) + 1;
                return acc;
            }, {})
        };
    }
};

// 导出到全局
window.Tickets = Tickets;
