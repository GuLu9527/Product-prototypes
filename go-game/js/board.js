// 围棋棋盘渲染和交互管理
class GoBoard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.BOARD_SIZE = 19;
        this.CELL_SIZE = 30; // 每个格子的大小
        this.intersections = [];
        this.stones = new Map(); // 存储棋子位置
        this.lastMove = null; // 最后一步棋的位置
        
        this.initBoard();
        this.drawGrid();
        this.addStarPoints();
    }

    // 初始化棋盘
    initBoard() {
        this.container.innerHTML = '';
        this.intersections = [];
        
        // 创建交叉点
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            this.intersections[row] = [];
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const intersection = document.createElement('div');
                intersection.className = 'board-intersection';
                intersection.dataset.row = row;
                intersection.dataset.col = col;
                
                // 计算位置
                const x = 15 + col * this.CELL_SIZE - 15;
                const y = 15 + row * this.CELL_SIZE - 15;
                intersection.style.left = x + 'px';
                intersection.style.top = y + 'px';
                
                this.container.appendChild(intersection);
                this.intersections[row][col] = intersection;
            }
        }
    }

    // 绘制棋盘网格线
    drawGrid() {
        // 绘制水平线
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            const line = document.createElement('div');
            line.className = 'board-line horizontal';
            line.style.top = (15 + i * this.CELL_SIZE) + 'px';
            this.container.appendChild(line);
        }
        
        // 绘制垂直线
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            const line = document.createElement('div');
            line.className = 'board-line vertical';
            line.style.left = (15 + i * this.CELL_SIZE) + 'px';
            this.container.appendChild(line);
        }
    }

    // 添加星位标记
    addStarPoints() {
        const starPoints = [
            [3, 3], [3, 9], [3, 15],
            [9, 3], [9, 9], [9, 15],
            [15, 3], [15, 9], [15, 15]
        ];
        
        starPoints.forEach(([row, col]) => {
            const starPoint = document.createElement('div');
            starPoint.className = 'star-point';
            const x = 15 + col * this.CELL_SIZE;
            const y = 15 + row * this.CELL_SIZE;
            starPoint.style.left = x + 'px';
            starPoint.style.top = y + 'px';
            this.container.appendChild(starPoint);
        });
    }

    // 在指定位置放置棋子
    placeStone(row, col, color) {
        const key = `${row},${col}`;
        
        // 如果已有棋子，先移除
        if (this.stones.has(key)) {
            this.removeStone(row, col);
        }
        
        const stone = document.createElement('div');
        stone.className = `stone ${color}`;
        
        // 计算棋子位置
        const x = 15 + col * this.CELL_SIZE - 13;
        const y = 15 + row * this.CELL_SIZE - 13;
        stone.style.left = x + 'px';
        stone.style.top = y + 'px';
        
        this.container.appendChild(stone);
        this.stones.set(key, { element: stone, color: color });
        
        // 添加落子动画
        stone.style.transform = 'scale(0)';
        setTimeout(() => {
            stone.style.transform = 'scale(1)';
        }, 10);
    }

    // 移除指定位置的棋子
    removeStone(row, col) {
        const key = `${row},${col}`;
        if (this.stones.has(key)) {
            const stone = this.stones.get(key);
            stone.element.remove();
            this.stones.delete(key);
        }
    }

    // 批量移除棋子（用于提子）
    removeStones(positions) {
        positions.forEach(([row, col]) => {
            const stone = this.stones.get(`${row},${col}`);
            if (stone) {
                // 添加消失动画
                stone.element.style.transition = 'all 0.3s ease';
                stone.element.style.transform = 'scale(0)';
                stone.element.style.opacity = '0';
                
                setTimeout(() => {
                    this.removeStone(row, col);
                }, 300);
            }
        });
    }

    // 标记最后一步棋
    markLastMove(row, col) {
        // 移除之前的标记
        const oldMarker = this.container.querySelector('.last-move');
        if (oldMarker) {
            oldMarker.remove();
        }
        
        if (row !== null && col !== null) {
            const marker = document.createElement('div');
            marker.className = 'last-move';
            const x = 15 + col * this.CELL_SIZE;
            const y = 15 + row * this.CELL_SIZE;
            marker.style.left = x + 'px';
            marker.style.top = y + 'px';
            this.container.appendChild(marker);
            
            this.lastMove = { row, col };
        }
    }

    // 标记禁着点
    markForbiddenPoints(points) {
        // 清除之前的禁着点标记
        this.intersections.forEach(row => {
            row.forEach(intersection => {
                intersection.classList.remove('forbidden');
            });
        });
        
        // 添加新的禁着点标记
        points.forEach(([row, col]) => {
            if (this.intersections[row] && this.intersections[row][col]) {
                this.intersections[row][col].classList.add('forbidden');
            }
        });
    }

    // 清空棋盘
    clearBoard() {
        // 移除所有棋子
        this.stones.forEach((stone, key) => {
            stone.element.remove();
        });
        this.stones.clear();
        
        // 移除最后一步标记
        this.markLastMove(null, null);
        
        // 清除禁着点标记
        this.markForbiddenPoints([]);
    }

    // 获取交叉点元素
    getIntersection(row, col) {
        return this.intersections[row] && this.intersections[row][col];
    }

    // 添加点击事件监听器
    addClickListener(callback) {
        this.container.addEventListener('click', (event) => {
            const intersection = event.target.closest('.board-intersection');
            if (intersection && !intersection.classList.contains('forbidden')) {
                const row = parseInt(intersection.dataset.row);
                const col = parseInt(intersection.dataset.col);
                callback(row, col);
            }
        });
    }

    // 响应式调整棋盘大小
    resize() {
        const containerWidth = this.container.parentElement.clientWidth;
        const maxSize = Math.min(containerWidth - 40, 570);
        
        if (maxSize < 570) {
            const scale = maxSize / 570;
            this.container.style.transform = `scale(${scale})`;
            this.container.style.transformOrigin = 'center center';
        } else {
            this.container.style.transform = 'none';
        }
    }
}