// 全局变量
let particles = [];
let mouseX = 0;
let mouseY = 0;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initNavigation();
    initClock();
    initScrollEffects();
    initMessageForm();
    initGalleryEffects();
    
    // 启动动画循环
    animate();
});

// 粒子系统初始化
function initParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = window.innerWidth < 768 ? 50 : 100;
    
    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    
    // 鼠标移动事件
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
}

// 创建单个粒子
function createParticle() {
    const particle = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: getRandomNeonColor(),
        element: null
    };
    
    // 创建DOM元素
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.width = particle.size + 'px';
    element.style.height = particle.size + 'px';
    element.style.backgroundColor = particle.color;
    element.style.borderRadius = '50%';
    element.style.opacity = particle.opacity;
    element.style.boxShadow = `0 0 ${particle.size * 2}px ${particle.color}`;
    element.style.pointerEvents = 'none';
    
    particle.element = element;
    document.getElementById('particles-container').appendChild(element);
    particles.push(particle);
}

// 获取随机霓虹色
function getRandomNeonColor() {
    const colors = ['#00D4FF', '#8B5CF6', '#FF006E', '#39FF14', '#FFFF00'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 动画循环
function animate() {
    updateParticles();
    requestAnimationFrame(animate);
}

// 更新粒子位置
function updateParticles() {
    particles.forEach(particle => {
        // 基础移动
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // 鼠标吸引效果
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx += dx * force * 0.0001;
            particle.vy += dy * force * 0.0001;
        }
        
        // 边界检测
        if (particle.x < 0 || particle.x > window.innerWidth) {
            particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > window.innerHeight) {
            particle.vy *= -1;
        }
        
        // 限制速度
        particle.vx = Math.max(-2, Math.min(2, particle.vx));
        particle.vy = Math.max(-2, Math.min(2, particle.vy));
        
        // 更新DOM位置
        particle.element.style.left = particle.x + 'px';
        particle.element.style.top = particle.y + 'px';
    });
}

// 导航功能初始化
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // 平滑滚动
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // 更新活动状态
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // 汉堡菜单切换
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        this.classList.toggle('active');
    });
    
    // 滚动时更新导航状态
    window.addEventListener('scroll', updateActiveNavLink);
}

// 更新活动导航链接
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// 数字时钟初始化
function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

// 更新时钟显示
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${hours}:${minutes}:${seconds}`;
    const clockElement = document.getElementById('current-time');
    
    if (clockElement) {
        clockElement.textContent = timeString;
        
        // 添加闪烁效果
        clockElement.style.textShadow = `0 0 ${10 + Math.sin(Date.now() * 0.01) * 5}px #39FF14`;
    }
}

// 滚动效果初始化
function initScrollEffects() {
    const backToTopBtn = document.getElementById('backToTop');
    
    // 返回顶部按钮显示/隐藏
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
        
        // 视差效果
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-visual');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    
    // 返回顶部功能
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 滚动动画观察器
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 观察需要动画的元素
    const animateElements = document.querySelectorAll('.article-card, .gallery-item, .message-item');
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// 留言表单初始化
function initMessageForm() {
    const messageForm = document.getElementById('messageForm');
    const messagesList = document.querySelector('.messages-list');
    
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userName = document.getElementById('userName').value;
        const userEmail = document.getElementById('userEmail').value;
        const messageText = document.getElementById('messageText').value;
        
        if (userName && messageText) {
            addMessage(userName, messageText);
            messageForm.reset();
            
            // 成功提示动画
            showSubmitSuccess();
        }
    });
}

// 添加新留言
function addMessage(name, content) {
    const messagesList = document.querySelector('.messages-list');
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const messageHTML = `
        <div class="message-item new-message">
            <div class="message-header">
                <span class="message-author">${escapeHtml(name)}</span>
                <span class="message-time">${timeString}</span>
            </div>
            <div class="message-content">
                ${escapeHtml(content)}
            </div>
        </div>
    `;
    
    messagesList.insertAdjacentHTML('afterbegin', messageHTML);
    
    // 新留言动画
    const newMessage = messagesList.querySelector('.new-message');
    newMessage.style.opacity = '0';
    newMessage.style.transform = 'translateX(-100px)';
    
    setTimeout(() => {
        newMessage.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        newMessage.style.opacity = '1';
        newMessage.style.transform = 'translateX(0)';
        newMessage.classList.remove('new-message');
    }, 100);
    
    // 粒子爆炸效果
    createParticleExplosion(newMessage);
}

// HTML转义函数
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// 提交成功动画
function showSubmitSuccess() {
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span>发送成功!</span>';
    submitBtn.style.background = 'linear-gradient(45deg, #39FF14, #00D4FF)';
    
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = 'linear-gradient(45deg, var(--neon-blue), var(--neon-purple))';
    }, 2000);
}

// 粒子爆炸效果
function createParticleExplosion(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = getRandomNeonColor();
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.boxShadow = `0 0 10px ${getRandomNeonColor()}`;
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 10;
        const velocity = 100 + Math.random() * 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        animateExplosionParticle(particle, vx, vy);
    }
}

// 爆炸粒子动画
function animateExplosionParticle(particle, vx, vy) {
    let x = 0;
    let y = 0;
    let opacity = 1;
    
    function update() {
        x += vx * 0.02;
        y += vy * 0.02;
        vy += 2; // 重力
        opacity -= 0.02;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
        particle.style.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(update);
        } else {
            particle.remove();
        }
    }
    
    update();
}

// 画廊效果初始化
function initGalleryEffects() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        const card = item.querySelector('.gallery-card');
        
        // 鼠标进入时的3D效果
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        // 鼠标移动时的倾斜效果
        item.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        item.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });
}

// 平滑滚动到指定区域
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 窗口大小改变时重新初始化粒子
window.addEventListener('resize', function() {
    // 清除现有粒子
    particles.forEach(particle => {
        if (particle.element) {
            particle.element.remove();
        }
    });
    particles = [];
    
    // 重新初始化
    setTimeout(() => {
        initParticles();
    }, 100);
});

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // ESC键关闭移动端菜单
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
    
    // 空格键暂停/恢复粒子动画
    if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleParticleAnimation();
    }
});

// 切换粒子动画
let animationPaused = false;
function toggleParticleAnimation() {
    animationPaused = !animationPaused;
    
    if (animationPaused) {
        particles.forEach(particle => {
            particle.element.style.animationPlayState = 'paused';
        });
    } else {
        particles.forEach(particle => {
            particle.element.style.animationPlayState = 'running';
        });
    }
}

// 性能优化：减少不必要的重绘
let ticking = false;
function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateParticles);
        ticking = true;
    }
}

// 添加触摸设备支持
if ('ontouchstart' in window) {
    document.addEventListener('touchmove', function(e) {
        const touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;
    });
}

// 页面可见性API优化性能
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面不可见时暂停动画
        animationPaused = true;
    } else {
        // 页面可见时恢复动画
        animationPaused = false;
    }
});

// 控制台彩蛋
console.log('%c🚀 欢迎来到未来博客！', 'color: #00D4FF; font-size: 20px; font-weight: bold;');
console.log('%c这是一个充满科幻色彩的个人博客', 'color: #8B5CF6; font-size: 14px;');
console.log('%c按空格键可以暂停/恢复粒子动画', 'color: #39FF14; font-size: 12px;');
