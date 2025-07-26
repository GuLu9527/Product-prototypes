// 用户认证模块
const Auth = {
    // 当前用户信息
    currentUser: null,

    // 初始化
    init() {
        this.loadCurrentUser();
        this.setupEventListeners();
    },

    // 加载当前用户信息
    loadCurrentUser() {
        const userData = Utils.storage.get('currentUser');
        if (userData) {
            this.currentUser = userData;
            this.updateUserDisplay();
        }
    },

    // 设置事件监听器
    setupEventListeners() {
        // 登录表单
        const loginForm = Utils.dom.$('#loginForm');
        if (loginForm) {
            Utils.events.on(loginForm, 'submit', this.handleLogin.bind(this));
        }

        // 注册表单
        const registerForm = Utils.dom.$('#registerForm');
        if (registerForm) {
            Utils.events.on(registerForm, 'submit', this.handleRegister.bind(this));
        }

        // 退出登录
        const logoutBtn = Utils.dom.$('#logoutBtn');
        if (logoutBtn) {
            Utils.events.on(logoutBtn, 'click', this.handleLogout.bind(this));
        }

        // 表单切换
        const showRegister = Utils.dom.$('#showRegister');
        const showLogin = Utils.dom.$('#showLogin');
        
        if (showRegister) {
            Utils.events.on(showRegister, 'click', (e) => {
                e.preventDefault();
                this.switchForm('register');
            });
        }

        if (showLogin) {
            Utils.events.on(showLogin, 'click', (e) => {
                e.preventDefault();
                this.switchForm('login');
            });
        }

        // 密码显示/隐藏
        this.setupPasswordToggle();

        // 密码强度检测
        this.setupPasswordStrength();
    },

    // 处理登录
    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe') === 'on';

        // 清除之前的错误信息
        this.clearErrors();

        // 验证表单
        const errors = this.validateLoginForm(email, password);
        if (Object.keys(errors).length > 0) {
            this.showErrors(errors);
            return;
        }

        try {
            // 模拟登录API调用
            const user = await this.authenticateUser(email, password);
            
            if (user) {
                // 登录成功
                this.currentUser = user;
                Utils.storage.set('currentUser', user);
                
                if (rememberMe) {
                    Utils.storage.set('rememberUser', { email });
                }

                Utils.toast.show('登录成功！', 'success');
                
                // 跳转到主页面
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                Utils.toast.show('邮箱或密码错误', 'error');
            }
        } catch (error) {
            console.error('登录错误:', error);
            Utils.toast.show('登录失败，请重试', 'error');
        }
    },

    // 处理注册
    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // 清除之前的错误信息
        this.clearErrors();

        // 验证表单
        const errors = this.validateRegisterForm(name, email, password, confirmPassword);
        if (Object.keys(errors).length > 0) {
            this.showErrors(errors);
            return;
        }

        try {
            // 检查邮箱是否已存在
            const existingUser = this.getUserByEmail(email);
            if (existingUser) {
                Utils.toast.show('该邮箱已被注册', 'error');
                return;
            }

            // 创建新用户
            const newUser = {
                id: Utils.generateId(),
                name: name,
                email: email,
                password: password, // 实际项目中应该加密
                avatar: name.charAt(0).toUpperCase(),
                createdAt: new Date().toISOString(),
                role: 'user'
            };

            // 保存用户信息
            this.saveUser(newUser);

            Utils.toast.show('注册成功！请登录', 'success');
            
            // 切换到登录表单
            setTimeout(() => {
                this.switchForm('login');
                // 预填邮箱
                const emailInput = Utils.dom.$('#loginEmail');
                if (emailInput) emailInput.value = email;
            }, 1000);

        } catch (error) {
            console.error('注册错误:', error);
            Utils.toast.show('注册失败，请重试', 'error');
        }
    },

    // 处理退出登录
    handleLogout(e) {
        e.preventDefault();
        
        this.currentUser = null;
        Utils.storage.remove('currentUser');
        Utils.toast.show('已退出登录', 'info');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    },

    // 验证登录表单
    validateLoginForm(email, password) {
        const errors = {};

        if (!Utils.validate.required(email)) {
            errors.email = '请输入邮箱地址';
        } else if (!Utils.validate.email(email)) {
            errors.email = '请输入有效的邮箱地址';
        }

        if (!Utils.validate.required(password)) {
            errors.password = '请输入密码';
        }

        return errors;
    },

    // 验证注册表单
    validateRegisterForm(name, email, password, confirmPassword) {
        const errors = {};

        if (!Utils.validate.required(name)) {
            errors.name = '请输入姓名';
        } else if (!Utils.validate.minLength(name, 2)) {
            errors.name = '姓名至少需要2个字符';
        }

        if (!Utils.validate.required(email)) {
            errors.email = '请输入邮箱地址';
        } else if (!Utils.validate.email(email)) {
            errors.email = '请输入有效的邮箱地址';
        }

        if (!Utils.validate.required(password)) {
            errors.password = '请输入密码';
        } else if (!Utils.validate.password(password)) {
            errors.password = '密码至少8位，包含字母和数字';
        }

        if (!Utils.validate.required(confirmPassword)) {
            errors.confirmPassword = '请确认密码';
        } else if (password !== confirmPassword) {
            errors.confirmPassword = '两次输入的密码不一致';
        }

        return errors;
    },

    // 显示错误信息
    showErrors(errors) {
        Object.keys(errors).forEach(field => {
            const errorElement = Utils.dom.$(`#${field}Error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
                Utils.dom.addClass(errorElement, 'show');
            }
        });
    },

    // 清除错误信息
    clearErrors() {
        const errorElements = Utils.dom.$$('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            Utils.dom.removeClass(element, 'show');
        });
    },

    // 模拟用户认证
    async authenticateUser(email, password) {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 从本地存储获取用户
        const users = Utils.storage.get('users', []);
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // 返回用户信息（不包含密码）
            const { password: _, ...userInfo } = user;
            return userInfo;
        }

        // 如果没有找到用户，创建默认管理员账户
        if (email === 'admin@example.com' && password === 'admin123') {
            const adminUser = {
                id: 'admin',
                name: '系统管理员',
                email: 'admin@example.com',
                avatar: 'A',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            return adminUser;
        }

        return null;
    },

    // 根据邮箱获取用户
    getUserByEmail(email) {
        const users = Utils.storage.get('users', []);
        return users.find(u => u.email === email);
    },

    // 保存用户信息
    saveUser(user) {
        const users = Utils.storage.get('users', []);
        users.push(user);
        Utils.storage.set('users', users);
    },

    // 切换表单
    switchForm(formType) {
        const loginForm = Utils.dom.$('#loginForm');
        const registerForm = Utils.dom.$('#registerForm');

        if (formType === 'register') {
            Utils.dom.removeClass(loginForm, 'active');
            Utils.dom.addClass(registerForm, 'active');
        } else {
            Utils.dom.removeClass(registerForm, 'active');
            Utils.dom.addClass(loginForm, 'active');
        }
    },

    // 设置密码显示/隐藏功能
    setupPasswordToggle() {
        const toggleButtons = Utils.dom.$$('.password-toggle');
        
        toggleButtons.forEach(button => {
            Utils.events.on(button, 'click', (e) => {
                e.preventDefault();
                const input = button.previousElementSibling;
                const isPassword = input.type === 'password';
                
                input.type = isPassword ? 'text' : 'password';
                
                // 更新图标
                const icon = button.querySelector('.eye-icon');
                if (icon) {
                    icon.innerHTML = isPassword ? 
                        `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>` :
                        `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>`;
                }
            });
        });
    },

    // 设置密码强度检测
    setupPasswordStrength() {
        const passwordInput = Utils.dom.$('#registerPassword');
        const strengthBar = Utils.dom.$('.strength-fill');
        const strengthText = Utils.dom.$('.strength-text');

        if (passwordInput && strengthBar && strengthText) {
            Utils.events.on(passwordInput, 'input', (e) => {
                const password = e.target.value;
                const strength = this.calculatePasswordStrength(password);
                
                strengthBar.style.width = `${strength.percentage}%`;
                strengthBar.style.backgroundColor = strength.color;
                strengthText.textContent = strength.text;
            });
        }
    },

    // 计算密码强度
    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length >= 8) score += 25;
        else feedback.push('至少8个字符');

        if (/[a-z]/.test(password)) score += 25;
        else feedback.push('包含小写字母');

        if (/[A-Z]/.test(password)) score += 25;
        else feedback.push('包含大写字母');

        if (/\d/.test(password)) score += 25;
        else feedback.push('包含数字');

        if (/[^A-Za-z0-9]/.test(password)) score += 10;

        let strength = {
            percentage: score,
            color: '#ef4444',
            text: '弱'
        };

        if (score >= 60) {
            strength.color = '#f59e0b';
            strength.text = '中等';
        }
        if (score >= 80) {
            strength.color = '#10b981';
            strength.text = '强';
        }
        if (score >= 90) {
            strength.color = '#059669';
            strength.text = '很强';
        }

        return strength;
    },

    // 更新用户显示
    updateUserDisplay() {
        if (this.currentUser) {
            const userNameElement = Utils.dom.$('#userName');
            const userAvatarElements = Utils.dom.$$('.user-avatar');

            if (userNameElement) {
                userNameElement.textContent = this.currentUser.name;
            }

            userAvatarElements.forEach(avatar => {
                avatar.textContent = this.currentUser.avatar || this.currentUser.name.charAt(0).toUpperCase();
            });
        }
    },

    // 检查登录状态
    isLoggedIn() {
        return this.currentUser !== null;
    },

    // 检查权限
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // 管理员拥有所有权限
        if (this.currentUser.role === 'admin') return true;
        
        // 根据用户角色检查权限
        const userPermissions = {
            user: ['read', 'create', 'update_own'],
            moderator: ['read', 'create', 'update', 'delete_own'],
            admin: ['read', 'create', 'update', 'delete', 'manage_users']
        };

        const rolePermissions = userPermissions[this.currentUser.role] || [];
        return rolePermissions.includes(permission);
    },

    // 初始化登录页面
    initLoginPage() {
        // 检查是否已登录
        if (this.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        // 检查记住的用户
        const rememberedUser = Utils.storage.get('rememberUser');
        if (rememberedUser) {
            const emailInput = Utils.dom.$('#loginEmail');
            const rememberCheckbox = Utils.dom.$('#rememberMe');
            
            if (emailInput) emailInput.value = rememberedUser.email;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }

        this.init();
    },

    // 初始化主应用
    initApp() {
        // 先加载用户数据
        this.loadCurrentUser();
        
        // 检查登录状态
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }

        this.init();
        return true;
    }
};

// 导出到全局
window.Auth = Auth;