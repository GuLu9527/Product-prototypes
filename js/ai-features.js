// AI智能功能模块
const AIFeatures = {
    // 关键词分类映射
    categoryKeywords: {
        'bug': ['错误', '故障', '异常', '崩溃', '无法', '失败', '问题', 'bug', 'error', '不能', '不工作'],
        'feature': ['新增', '功能', '需求', '建议', '改进', '优化', '增加', 'feature', '希望', '想要'],
        'support': ['帮助', '支持', '咨询', '如何', '怎么', '教程', '指导', 'help', 'support', '求助'],
        'other': ['其他', '杂项', '一般', '普通', 'other', '不确定']
    },

    // 优先级关键词映射
    priorityKeywords: {
        'urgent': ['紧急', '立即', '马上', '急', '严重', '重要', 'urgent', 'critical', '关键', '阻塞'],
        'high': ['高', '重要', '尽快', '优先', 'high', 'important', '必须', '关键'],
        'medium': ['中等', '一般', '正常', 'medium', 'normal', '常规'],
        'low': ['低', '不急', '有空', 'low', '可选', '建议', '次要']
    },

    // 初始化
    init() {
        this.setupEventListeners();
    },

    // 设置事件监听器
    setupEventListeners() {
        const descriptionInput = Utils.dom.$('#ticketDescription');
        const titleInput = Utils.dom.$('#ticketTitle');

        if (descriptionInput) {
            // 使用防抖来避免频繁触发
            const debouncedAnalyze = Utils.debounce(() => {
                this.analyzeTicketContent();
            }, 500);

            Utils.events.on(descriptionInput, 'input', debouncedAnalyze);
        }

        if (titleInput) {
            const debouncedAnalyze = Utils.debounce(() => {
                this.analyzeTicketContent();
            }, 500);

            Utils.events.on(titleInput, 'input', debouncedAnalyze);
        }
    },

    // 分析工单内容
    analyzeTicketContent() {
        const title = Utils.dom.$('#ticketTitle')?.value || '';
        const description = Utils.dom.$('#ticketDescription')?.value || '';
        const content = (title + ' ' + description).toLowerCase();

        if (!content.trim()) {
            this.hideSuggestions();
            return;
        }

        // 分析分类
        const suggestedCategory = this.suggestCategory(content);
        
        // 分析优先级
        const suggestedPriority = this.suggestPriority(content);

        // 显示建议
        this.showSuggestions(suggestedCategory, suggestedPriority);
    },

    // 建议分类
    suggestCategory(content) {
        const scores = {};
        
        // 计算每个分类的匹配分数
        Object.keys(this.categoryKeywords).forEach(category => {
            scores[category] = 0;
            this.categoryKeywords[category].forEach(keyword => {
                const regex = new RegExp(keyword, 'gi');
                const matches = content.match(regex);
                if (matches) {
                    scores[category] += matches.length;
                }
            });
        });

        // 找到得分最高的分类
        let bestCategory = 'other';
        let maxScore = 0;
        
        Object.keys(scores).forEach(category => {
            if (scores[category] > maxScore) {
                maxScore = scores[category];
                bestCategory = category;
            }
        });

        return {
            category: bestCategory,
            confidence: maxScore > 0 ? Math.min(maxScore * 20, 100) : 0,
            keywords: this.categoryKeywords[bestCategory]
        };
    },

    // 建议优先级
    suggestPriority(content) {
        const scores = {};
        
        // 计算每个优先级的匹配分数
        Object.keys(this.priorityKeywords).forEach(priority => {
            scores[priority] = 0;
            this.priorityKeywords[priority].forEach(keyword => {
                const regex = new RegExp(keyword, 'gi');
                const matches = content.match(regex);
                if (matches) {
                    scores[priority] += matches.length;
                }
            });
        });

        // 找到得分最高的优先级
        let bestPriority = 'medium';
        let maxScore = 0;
        
        Object.keys(scores).forEach(priority => {
            if (scores[priority] > maxScore) {
                maxScore = scores[priority];
                bestPriority = priority;
            }
        });

        return {
            priority: bestPriority,
            confidence: maxScore > 0 ? Math.min(maxScore * 25, 100) : 0,
            keywords: this.priorityKeywords[bestPriority]
        };
    },

    // 显示建议
    showSuggestions(categoryResult, priorityResult) {
        const suggestionsContainer = Utils.dom.$('#aiSuggestions');
        const categorySuggestion = Utils.dom.$('#categorySuggestion');
        const prioritySuggestion = Utils.dom.$('#prioritySuggestion');

        if (!suggestionsContainer || !categorySuggestion || !prioritySuggestion) return;

        // 只有当置信度足够高时才显示建议
        const showCategory = categoryResult.confidence >= 20;
        const showPriority = priorityResult.confidence >= 25;

        if (!showCategory && !showPriority) {
            this.hideSuggestions();
            return;
        }

        // 显示分类建议
        if (showCategory) {
            const categoryName = this.getCategoryDisplayName(categoryResult.category);
            categorySuggestion.innerHTML = `
                <div class="suggestion-content">
                    <div class="suggestion-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M7 7h10v10H7z"/>
                            <path d="M3 3h18v18H3z"/>
                        </svg>
                        建议分类：<strong>${categoryName}</strong>
                    </div>
                    <div class="suggestion-confidence">置信度: ${categoryResult.confidence}%</div>
                    <button type="button" class="suggestion-apply-btn" onclick="AIFeatures.applyCategorySuggestion('${categoryResult.category}')">
                        应用建议
                    </button>
                </div>
            `;
            Utils.dom.show(categorySuggestion);
        } else {
            Utils.dom.hide(categorySuggestion);
        }

        // 显示优先级建议
        if (showPriority) {
            const priorityName = this.getPriorityDisplayName(priorityResult.priority);
            prioritySuggestion.innerHTML = `
                <div class="suggestion-content">
                    <div class="suggestion-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        建议优先级：<strong>${priorityName}</strong>
                    </div>
                    <div class="suggestion-confidence">置信度: ${priorityResult.confidence}%</div>
                    <button type="button" class="suggestion-apply-btn" onclick="AIFeatures.applyPrioritySuggestion('${priorityResult.priority}')">
                        应用建议
                    </button>
                </div>
            `;
            Utils.dom.show(prioritySuggestion);
        } else {
            Utils.dom.hide(prioritySuggestion);
        }

        // 显示建议容器
        Utils.dom.show(suggestionsContainer);
    },

    // 隐藏建议
    hideSuggestions() {
        const suggestionsContainer = Utils.dom.$('#aiSuggestions');
        if (suggestionsContainer) {
            Utils.dom.hide(suggestionsContainer);
        }
    },

    // 应用分类建议
    applyCategorySuggestion(category) {
        const categorySelect = Utils.dom.$('#ticketCategory');
        if (categorySelect) {
            categorySelect.value = category;
            
            // 添加视觉反馈
            Utils.dom.addClass(categorySelect, 'suggestion-applied');
            setTimeout(() => {
                Utils.dom.removeClass(categorySelect, 'suggestion-applied');
            }, 1000);

            Utils.toast.show('已应用分类建议', 'success', 2000);
        }
    },

    // 应用优先级建议
    applyPrioritySuggestion(priority) {
        const prioritySelect = Utils.dom.$('#ticketPriority');
        if (prioritySelect) {
            prioritySelect.value = priority;
            
            // 添加视觉反馈
            Utils.dom.addClass(prioritySelect, 'suggestion-applied');
            setTimeout(() => {
                Utils.dom.removeClass(prioritySelect, 'suggestion-applied');
            }, 1000);

            Utils.toast.show('已应用优先级建议', 'success', 2000);
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

    // 智能搜索功能
    smartSearch(query, tickets) {
        if (!query || !tickets) return tickets;

        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        return tickets.filter(ticket => {
            const searchableText = [
                ticket.title,
                ticket.description,
                ticket.category,
                ticket.priority,
                ticket.status,
                ticket.author?.name || ''
            ].join(' ').toLowerCase();

            // 检查是否包含所有搜索词
            return searchTerms.every(term => {
                // 支持模糊匹配
                return searchableText.includes(term) || 
                       this.fuzzyMatch(searchableText, term);
            });
        });
    },

    // 模糊匹配
    fuzzyMatch(text, term) {
        if (term.length < 2) return false;
        
        // 简单的模糊匹配算法
        const regex = new RegExp(term.split('').join('.*'), 'i');
        return regex.test(text);
    },

    // 智能排序
    smartSort(tickets, sortBy) {
        const sortFunctions = {
            'relevance': (a, b) => {
                // 根据状态和优先级排序
                const statusOrder = { 'open': 3, 'in-progress': 2, 'closed': 1 };
                const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                
                const aScore = (statusOrder[a.status] || 0) + (priorityOrder[a.priority] || 0);
                const bScore = (statusOrder[b.status] || 0) + (priorityOrder[b.priority] || 0);
                
                return bScore - aScore;
            },
            'created_desc': (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            'created_asc': (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            'updated_desc': (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt),
            'priority_desc': (a, b) => {
                const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            },
            'priority_asc': (a, b) => {
                const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
            }
        };

        const sortFunction = sortFunctions[sortBy] || sortFunctions['created_desc'];
        return [...tickets].sort(sortFunction);
    },

    // 自动标签提取
    extractTags(content) {
        const commonWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
        
        // 提取关键词
        const words = content.toLowerCase()
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length >= 2 && !commonWords.includes(word));

        // 统计词频
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });

        // 返回出现频率最高的词作为标签
        return Object.keys(wordCount)
            .sort((a, b) => wordCount[b] - wordCount[a])
            .slice(0, 5);
    },

    // 相似工单推荐
    findSimilarTickets(currentTicket, allTickets, limit = 5) {
        if (!currentTicket || !allTickets) return [];

        const currentTags = this.extractTags(currentTicket.title + ' ' + currentTicket.description);
        
        const similarities = allTickets
            .filter(ticket => ticket.id !== currentTicket.id)
            .map(ticket => {
                const ticketTags = this.extractTags(ticket.title + ' ' + ticket.description);
                const similarity = this.calculateSimilarity(currentTags, ticketTags);
                
                return {
                    ticket,
                    similarity,
                    commonTags: currentTags.filter(tag => ticketTags.includes(tag))
                };
            })
            .filter(item => item.similarity > 0.1)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);

        return similarities;
    },

    // 计算相似度
    calculateSimilarity(tags1, tags2) {
        if (!tags1.length || !tags2.length) return 0;
        
        const intersection = tags1.filter(tag => tags2.includes(tag));
        const union = [...new Set([...tags1, ...tags2])];
        
        return intersection.length / union.length;
    },

    // 工单统计分析
    analyzeTickets(tickets) {
        if (!tickets || !tickets.length) {
            return {
                total: 0,
                byStatus: {},
                byPriority: {},
                byCategory: {},
                trends: []
            };
        }

        const analysis = {
            total: tickets.length,
            byStatus: {},
            byPriority: {},
            byCategory: {},
            trends: []
        };

        // 按状态统计
        tickets.forEach(ticket => {
            analysis.byStatus[ticket.status] = (analysis.byStatus[ticket.status] || 0) + 1;
            analysis.byPriority[ticket.priority] = (analysis.byPriority[ticket.priority] || 0) + 1;
            analysis.byCategory[ticket.category] = (analysis.byCategory[ticket.category] || 0) + 1;
        });

        // 趋势分析（按日期分组）
        const dateGroups = {};
        tickets.forEach(ticket => {
            const date = Utils.formatDate(ticket.createdAt, 'YYYY-MM-DD');
            dateGroups[date] = (dateGroups[date] || 0) + 1;
        });

        analysis.trends = Object.keys(dateGroups)
            .sort()
            .slice(-30) // 最近30天
            .map(date => ({
                date,
                count: dateGroups[date]
            }));

        return analysis;
    }
};

// 导出到全局
window.AIFeatures = AIFeatures;