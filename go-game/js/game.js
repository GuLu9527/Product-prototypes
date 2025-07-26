// 围棋游戏主控制器
class GoGame {
    constructor() {
        this.rules = new GoRules();
        this.board = null;
        this.gameBoard = this.initializeBoard();
        this.currentPlayer = this.rules.BLACK; // 黑子先行
        this.gameHistory = [];
        this.capturedStones = { black: 0, white: 0 };
        this.gameEnded = false;
        
        this.initializeGame();
    }

    // 初始化空棋盘
    initializeBoard() {
        const board = [];
        for (let i = 0; i < this.rules.BOARD_SIZE; i++) {
            board[i] = new Array(this.rules.BOARD_SIZE).fill(this.rules.EMPTY);
        }
        return board;
    }

    // 初始化游戏
    initializeGame() {
        // 创建棋盘UI
        this.board = new GoBoard('go-board');
        
        // 添加点击事件监听
        this.board.addClickListener((row, col) => {
            this.handleMove(row, col);
        });
        
        // 添加重新开始按钮事件
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 更新UI
        this.updateUI();
        
        // 添加窗口大小调整监听
        window.addEventListener('resize', () => {
            this.board.resize();
        });
        
        // 初始调整大小
        setTimeout(() => {
            this.board.resize();
        }, 100);
    }

    // 处理落子
    handleMove(row, col) {
        if (this.gameEnded) {
            alert('游戏已结束，请重新开始');
            return;
        }

        // 检查落子是否合法
        const validation = this.rules.isValidMove(
            this.gameBoard, 
            row, 
            col, 
            this.currentPlayer, 
            this.gameHistory
        );
        
        if (!validation.valid) {
            alert(validation.reason);
            return;
        }

        // 执行落子
        const moveResult = this.rules.makeMove(this.gameBoard, row, col, this.currentPlayer);
        
        // 保存当前棋盘状态到历史记录
        this.gameHistory.push(this.gameBoard.map(row => [...row]));
        
        // 更新棋盘状态
        this.gameBoard = moveResult.board;
        
        // 在UI上放置棋子
        const stoneColor = this.currentPlayer === this.rules.BLACK ? 'black' : 'white';
        this.board.placeStone(row, col, stoneColor);
        
        // 处理被提取的棋子
        if (moveResult.capturedStones.length > 0) {
            this.board.removeStones(moveResult.capturedStones);
            
            // 更新提子计数
            if (this.currentPlayer === this.rules.BLACK) {
                this.capturedStones.white += moveResult.capturedStones.length;
            } else {
                this.capturedStones.black += moveResult.capturedStones.length;
            }
        }
        
        // 标记最后一步棋
        this.board.markLastMove(row, col);
        
        // 检查游戏是否结束
        const gameResult = this.rules.checkGameEnd(
            this.capturedStones.black, 
            this.capturedStones.white
        );
        
        if (gameResult.ended) {
            this.endGame(gameResult.winner, gameResult.reason);
            return;
        }
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === this.rules.BLACK ? this.rules.WHITE : this.rules.BLACK;
        
        // 更新UI
        this.updateUI();
        
        // 更新禁着点标记（可选功能）
        this.updateForbiddenPoints();
    }

    // 更新禁着点标记
    updateForbiddenPoints() {
        const forbiddenPoints = [];
        
        for (let row = 0; row < this.rules.BOARD_SIZE; row++) {
            for (let col = 0; col < this.rules.BOARD_SIZE; col++) {
                if (this.gameBoard[row][col] === this.rules.EMPTY) {
                    const validation = this.rules.isValidMove(
                        this.gameBoard, 
                        row, 
                        col, 
                        this.currentPlayer, 
                        this.gameHistory
                    );
                    
                    if (!validation.valid) {
                        forbiddenPoints.push([row, col]);
                    }
                }
            }
        }
        
        this.board.markForbiddenPoints(forbiddenPoints);
    }

    // 更新UI显示
    updateUI() {
        // 更新当前回合显示
        const currentTurnElement = document.getElementById('current-turn');
        if (this.currentPlayer === this.rules.BLACK) {
            currentTurnElement.textContent = '黑子回合';
            currentTurnElement.style.color = '#333';
        } else {
            currentTurnElement.textContent = '白子回合';
            currentTurnElement.style.color = '#666';
        }
        
        // 更新提子计数
        document.getElementById('black-captured').textContent = this.capturedStones.black;
        document.getElementById('white-captured').textContent = this.capturedStones.white;
    }

    // 结束游戏
    endGame(winner, reason) {
        this.gameEnded = true;
        
        const winnerText = winner === 'black' ? '黑方' : '白方';
        const message = `游戏结束！${winnerText}获胜\n原因：${reason}`;
        
        setTimeout(() => {
            alert(message);
        }, 500);
        
        // 更新UI显示游戏结束状态
        const currentTurnElement = document.getElementById('current-turn');
        currentTurnElement.textContent = `游戏结束 - ${winnerText}获胜`;
        currentTurnElement.style.color = '#ff4444';
    }

    // 重新开始游戏
    restartGame() {
        // 确认重新开始
        if (this.gameHistory.length > 0) {
            if (!confirm('确定要重新开始游戏吗？')) {
                return;
            }
        }
        
        // 重置游戏状态
        this.gameBoard = this.initializeBoard();
        this.currentPlayer = this.rules.BLACK;
        this.gameHistory = [];
        this.capturedStones = { black: 0, white: 0 };
        this.gameEnded = false;
        
        // 清空棋盘UI
        this.board.clearBoard();
        
        // 更新UI
        this.updateUI();
        
        console.log('游戏已重新开始');
    }

    // 获取游戏状态（用于调试）
    getGameState() {
        return {
            board: this.gameBoard,
            currentPlayer: this.currentPlayer,
            capturedStones: this.capturedStones,
            gameEnded: this.gameEnded,
            moveCount: this.gameHistory.length
        };
    }

    // Pass功能（跳过回合）
    pass() {
        if (this.gameEnded) return;
        
        // 记录pass
        this.gameHistory.push(this.gameBoard.map(row => [...row]));
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === this.rules.BLACK ? this.rules.WHITE : this.rules.BLACK;
        
        // 更新UI
        this.updateUI();
        
        console.log('玩家选择跳过回合');
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.goGame = new GoGame();
    console.log('围棋游戏已初始化');
});

// 添加键盘快捷键支持
document.addEventListener('keydown', (event) => {
    if (window.goGame) {
        switch(event.key) {
            case 'r':
            case 'R':
                if (event.ctrlKey) {
                    event.preventDefault();
                    window.goGame.restartGame();
                }
                break;
            case 'p':
            case 'P':
                if (event.ctrlKey) {
                    event.preventDefault();
                    window.goGame.pass();
                }
                break;
        }
    }
});