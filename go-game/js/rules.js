// 围棋规则引擎
class GoRules {
    constructor() {
        this.BOARD_SIZE = 19;
        this.EMPTY = 0;
        this.BLACK = 1;
        this.WHITE = 2;
    }

    // 检查坐标是否在棋盘范围内
    isValidPosition(row, col) {
        return row >= 0 && row < this.BOARD_SIZE && col >= 0 && col < this.BOARD_SIZE;
    }

    // 获取相邻位置
    getNeighbors(row, col) {
        const neighbors = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isValidPosition(newRow, newCol)) {
                neighbors.push([newRow, newCol]);
            }
        }
        return neighbors;
    }

    // 获取连通的同色棋子群
    getGroup(board, row, col, visited = new Set()) {
        const key = `${row},${col}`;
        if (visited.has(key)) return [];
        
        const stone = board[row][col];
        if (stone === this.EMPTY) return [];
        
        visited.add(key);
        const group = [[row, col]];
        
        for (const [nr, nc] of this.getNeighbors(row, col)) {
            if (board[nr][nc] === stone) {
                group.push(...this.getGroup(board, nr, nc, visited));
            }
        }
        
        return group;
    }

    // 计算棋子群的气（自由度）
    getLiberties(board, group) {
        const liberties = new Set();
        
        for (const [row, col] of group) {
            for (const [nr, nc] of this.getNeighbors(row, col)) {
                if (board[nr][nc] === this.EMPTY) {
                    liberties.add(`${nr},${nc}`);
                }
            }
        }
        
        return Array.from(liberties).map(pos => {
            const [row, col] = pos.split(',').map(Number);
            return [row, col];
        });
    }

    // 检查棋子群是否被提取（没有气）
    isCaptured(board, group) {
        return this.getLiberties(board, group).length === 0;
    }

    // 获取被提取的敌方棋子
    getCapturedStones(board, row, col, player) {
        const opponent = player === this.BLACK ? this.WHITE : this.BLACK;
        const capturedStones = [];
        
        for (const [nr, nc] of this.getNeighbors(row, col)) {
            if (board[nr][nc] === opponent) {
                const group = this.getGroup(board, nr, nc);
                if (this.isCaptured(board, group)) {
                    capturedStones.push(...group);
                }
            }
        }
        
        return capturedStones;
    }

    // 检查是否为自杀手（自己的棋子群没有气且不能提取敌方棋子）
    isSuicideMove(board, row, col, player) {
        // 创建临时棋盘
        const tempBoard = board.map(row => [...row]);
        tempBoard[row][col] = player;
        
        // 检查是否能提取敌方棋子
        const capturedStones = this.getCapturedStones(tempBoard, row, col, player);
        if (capturedStones.length > 0) {
            return false; // 能提取敌方棋子，不是自杀手
        }
        
        // 检查自己的棋子群是否有气
        const myGroup = this.getGroup(tempBoard, row, col);
        return this.isCaptured(tempBoard, myGroup);
    }

    // 检查是否违反劫争规则
    isKoViolation(board, row, col, player, gameHistory) {
        if (gameHistory.length < 2) return false;
        
        // 创建落子后的棋盘状态
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = player;
        
        // 移除被提取的棋子
        const capturedStones = this.getCapturedStones(newBoard, row, col, player);
        for (const [cr, cc] of capturedStones) {
            newBoard[cr][cc] = this.EMPTY;
        }
        
        // 检查是否与两步前的棋盘状态相同
        const previousBoard = gameHistory[gameHistory.length - 2];
        return this.boardsEqual(newBoard, previousBoard);
    }

    // 比较两个棋盘是否相同
    boardsEqual(board1, board2) {
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                if (board1[i][j] !== board2[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    // 检查落子是否合法
    isValidMove(board, row, col, player, gameHistory = []) {
        // 检查位置是否为空
        if (board[row][col] !== this.EMPTY) {
            return { valid: false, reason: '此位置已有棋子' };
        }
        
        // 检查是否为自杀手
        if (this.isSuicideMove(board, row, col, player)) {
            return { valid: false, reason: '不能下自杀手' };
        }
        
        // 检查是否违反劫争规则
        if (this.isKoViolation(board, row, col, player, gameHistory)) {
            return { valid: false, reason: '违反劫争规则' };
        }
        
        return { valid: true };
    }

    // 执行落子并返回新的棋盘状态
    makeMove(board, row, col, player) {
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = player;
        
        // 移除被提取的敌方棋子
        const capturedStones = this.getCapturedStones(newBoard, row, col, player);
        for (const [cr, cc] of capturedStones) {
            newBoard[cr][cc] = this.EMPTY;
        }
        
        return {
            board: newBoard,
            capturedStones: capturedStones
        };
    }

    // 简单的胜负判定（基于提子数量，实际围棋还需要计算目数）
    checkGameEnd(blackCaptured, whiteCaptured) {
        // 简化的胜负判定：提子超过50个或双方都连续pass
        if (blackCaptured >= 50) {
            return { ended: true, winner: 'white', reason: '白方提子获胜' };
        }
        if (whiteCaptured >= 50) {
            return { ended: true, winner: 'black', reason: '黑方提子获胜' };
        }
        return { ended: false };
    }
}