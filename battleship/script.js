class Battleship {
    constructor() {
        this.boardSize = 10;
        this.ships = {
            carrier: 5,
            battleship: 4,
            cruiser: 3,
            submarine: 3,
            destroyer: 2
        };
        this.playerBoard = this.createBoard();
        this.computerBoard = this.createBoard();
        this.playerShips = new Set();
        this.computerShips = new Set();
        this.currentShip = null;
        this.isHorizontal = true;
        this.gameStarted = false;
        
        // Add new properties to track ship positions
        this.playerShipPositions = new Map();
        this.computerShipPositions = new Map();
        
        this.initializeGame();
    }

    createBoard() {
        return Array(this.boardSize).fill(null)
            .map(() => Array(this.boardSize).fill(null));
    }

    initializeGame() {
        this.createGrids();
        this.setupEventListeners();
        this.displayMessage("Place your ships!");
    }

    createGrids() {
        const playerGrid = document.querySelector('.player-grid');
        const computerGrid = document.querySelector('.computer-grid');
        
        this.createGrid(playerGrid, 'player');
        this.createGrid(computerGrid, 'computer');
    }

    createGrid(gridElement, gridType) {
        gridElement.innerHTML = '';
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.dataset.grid = gridType;
                gridElement.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.ship-button').forEach(button => {
            button.addEventListener('click', () => this.selectShip(button));
        });

        document.querySelector('#rotateShip').addEventListener('click', () => {
            this.isHorizontal = !this.isHorizontal;
        });

        document.querySelector('.player-grid').addEventListener('mouseover', (e) => {
            if (this.currentShip && !this.gameStarted) {
                this.showShipPreview(e);
            }
        });

        document.querySelector('.player-grid').addEventListener('mouseout', () => {
            if (this.currentShip && !this.gameStarted) {
                this.clearShipPreview();
            }
        });

        document.querySelector('.player-grid').addEventListener('click', (e) => {
            if (this.currentShip && !this.gameStarted) {
                this.placePlayerShip(e);
            }
        });

        document.querySelector('.computer-grid').addEventListener('click', (e) => {
            if (this.gameStarted) {
                this.playerMove(e);
            }
        });

        document.querySelector('#startGame').addEventListener('click', () => {
            if (this.playerShips.size === 5) {
                this.startGame();
            } else {
                this.displayMessage("Place all your ships first!");
            }
        });
    }

    selectShip(button) {
        if (button.classList.contains('placed')) return;
        
        document.querySelectorAll('.ship-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        button.classList.add('selected');
        this.currentShip = {
            type: button.dataset.ship,
            length: parseInt(button.dataset.length)
        };
    }

    showShipPreview(event) {
        if (!event.target.classList.contains('cell')) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        this.clearShipPreview();
        
        if (this.canPlaceShip(row, col, this.currentShip.length, this.isHorizontal, this.playerBoard)) {
            this.getShipCells(row, col, this.currentShip.length, this.isHorizontal, 'player')
                .forEach(cell => cell.style.backgroundColor = '#2980b9');
        }
    }

    clearShipPreview() {
        document.querySelectorAll('.player-grid .cell').forEach(cell => {
            if (!cell.classList.contains('ship')) {
                cell.style.backgroundColor = '';
            }
        });
    }

    canPlaceShip(row, col, length, horizontal, board) {
        if (horizontal) {
            if (col + length > this.boardSize) return false;
            for (let i = 0; i < length; i++) {
                if (board[row][col + i]) return false;
            }
        } else {
            if (row + length > this.boardSize) return false;
            for (let i = 0; i < length; i++) {
                if (board[row + i][col]) return false;
            }
        }
        return true;
    }

    getShipCells(row, col, length, horizontal, gridType) {
        const cells = [];
        for (let i = 0; i < length; i++) {
            const cellRow = horizontal ? row : row + i;
            const cellCol = horizontal ? col + i : col;
            const cell = document.querySelector(
                `.${gridType}-grid [data-row="${cellRow}"][data-col="${cellCol}"]`
            );
            if (cell) cells.push(cell);
        }
        return cells;
    }

    placeShip(row, col, length, horizontal, board, isPlayer = false) {
        const positions = [];
        for (let i = 0; i < length; i++) {
            if (horizontal) {
                board[row][col + i] = 'ship';
                positions.push({row: row, col: col + i});
            } else {
                board[row + i][col] = 'ship';
                positions.push({row: row + i, col: col});
            }
        }

        // Store ship positions
        if (isPlayer) {
            this.playerShipPositions.set(this.currentShip.type, positions);
        } else {
            this.computerShipPositions.set(Object.keys(this.ships)[this.computerShips.size], positions);
        }
    }

    placePlayerShip(event) {
        if (!event.target.classList.contains('cell')) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        if (this.canPlaceShip(row, col, this.currentShip.length, this.isHorizontal, this.playerBoard)) {
            this.placeShip(row, col, this.currentShip.length, this.isHorizontal, this.playerBoard, true);
            this.getShipCells(row, col, this.currentShip.length, this.isHorizontal, 'player')
                .forEach(cell => cell.classList.add('ship'));
            
            const shipButton = document.querySelector(`[data-ship="${this.currentShip.type}"]`);
            shipButton.classList.remove('selected');
            shipButton.classList.add('placed');
            
            this.playerShips.add(this.currentShip.type);
            this.currentShip = null;
            
            if (this.playerShips.size === 5) {
                this.displayMessage("All ships placed! Click 'Start New Game' to begin!");
            }
        }
    }

    startGame() {
        this.gameStarted = true;
        this.placeComputerShips();
        this.displayMessage("Game started! Click on the computer's board to attack!");
        document.querySelector('.ships-container').style.display = 'none';
        document.querySelector('#startGame').style.display = 'none';
    }

    placeComputerShips() {
        const shipTypes = Object.entries(this.ships);
        
        for (const [shipType, length] of shipTypes) {
            let placed = false;
            while (!placed) {
                const row = Math.floor(Math.random() * this.boardSize);
                const col = Math.floor(Math.random() * this.boardSize);
                const horizontal = Math.random() < 0.5;
                
                if (this.canPlaceShip(row, col, length, horizontal, this.computerBoard)) {
                    this.placeShip(row, col, length, horizontal, this.computerBoard, false);
                    this.computerShips.add(shipType);
                    placed = true;
                }
            }
        }
    }

    checkShipSunk(row, col, board, isPlayer) {
        const positions = isPlayer ? this.playerShipPositions : this.computerShipPositions;
        
        for (const [shipType, shipPositions] of positions) {
            const hitPosition = shipPositions.find(pos => pos.row === row && pos.col === col);
            if (hitPosition) {
                // Check if all positions of this ship are hit
                const allPositionsHit = shipPositions.every(pos => {
                    const cell = document.querySelector(
                        `.${isPlayer ? 'player' : 'computer'}-grid [data-row="${pos.row}"][data-col="${pos.col}"]`
                    );
                    return cell.classList.contains('hit');
                });

                if (allPositionsHit) {
                    // Reveal the entire ship
                    shipPositions.forEach(pos => {
                        const cell = document.querySelector(
                            `.${isPlayer ? 'player' : 'computer'}-grid [data-row="${pos.row}"][data-col="${pos.col}"]`
                        );
                        cell.classList.add('sunk');
                    });
                    return true;
                }
            }
        }
        return false;
    }

    playerMove(event) {
        if (!event.target.classList.contains('cell')) return;
        if (event.target.classList.contains('hit') || event.target.classList.contains('miss')) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        const isHit = this.computerBoard[row][col] === 'ship';
        event.target.classList.add(isHit ? 'hit' : 'miss');
        
        if (isHit) {
            const isSunk = this.checkShipSunk(row, col, this.computerBoard, false);
            this.displayMessage(isSunk ? "Ship sunk!" : "Hit!");
            if (this.checkWin(this.computerBoard)) {
                this.endGame('player');
                return;
            }
        } else {
            this.displayMessage("Miss!");
        }
        
        setTimeout(() => this.computerMove(), 500);
    }

    computerMove() {
        let row, col;
        do {
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * this.boardSize);
        } while (
            document.querySelector(`.player-grid [data-row="${row}"][data-col="${col}"]`)
                .classList.contains('hit') ||
            document.querySelector(`.player-grid [data-row="${row}"][data-col="${col}"]`)
                .classList.contains('miss')
        );
        
        const cell = document.querySelector(`.player-grid [data-row="${row}"][data-col="${col}"]`);
        const isHit = this.playerBoard[row][col] === 'ship';
        
        cell.classList.add(isHit ? 'hit' : 'miss');
        
        if (isHit) {
            const isSunk = this.checkShipSunk(row, col, this.playerBoard, true);
            this.displayMessage(isSunk ? "Computer sunk your ship!" : "Computer hit your ship!");
            if (this.checkWin(this.playerBoard)) {
                this.endGame('computer');
                return;
            }
        } else {
            this.displayMessage("Computer missed!");
        }
    }

    checkWin(board) {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (board[row][col] === 'ship') {
                    const cell = document.querySelector(
                        `[data-row="${row}"][data-col="${col}"]`
                    );
                    if (!cell.classList.contains('hit')) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    endGame(winner) {
        this.gameStarted = false;
        const message = winner === 'player' ? 'Congratulations! You won!' : 'Game Over! Computer won!';
        this.displayMessage(message);
        
        document.querySelector('#startGame').style.display = 'block';
        document.querySelector('#startGame').textContent = 'Play Again';
        document.querySelector('#startGame').addEventListener('click', () => {
            location.reload();
        });
    }

    displayMessage(message) {
        document.querySelector('.message').textContent = message;
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Battleship();
}); 