class HangmanGame {
    constructor() {
        this.words = ['JAVASCRIPT', 'PYTHON', 'PROGRAMMING', 'COMPUTER', 'DEVELOPER', 
                      'CODING', 'WEB', 'APPLICATION', 'SOFTWARE', 'HANGMAN'];
        this.word = '';
        this.guessedLetters = new Set();
        this.remainingGuesses = 6;
        this.gameStatus = 'playing'; // 'playing', 'won', 'lost'
        
        // DOM elements
        this.wordDisplay = document.querySelector('.word-display');
        this.keyboard = document.querySelector('.keyboard');
        this.gameMessage = document.querySelector('.game-message');
        this.canvas = document.getElementById('hangmanCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.initializeGame();
    }

    initializeGame() {
        // Select random word
        this.word = this.words[Math.floor(Math.random() * this.words.length)];
        this.guessedLetters.clear();
        this.remainingGuesses = 6;
        this.gameStatus = 'playing';
        
        // Create keyboard
        this.createKeyboard();
        
        // Update display
        this.updateWordDisplay();
        this.updateGameMessage();
        
        // Clear and draw initial gallows
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGallows();
    }

    createKeyboard() {
        this.keyboard.innerHTML = '';
        for (let i = 65; i <= 90; i++) {
            const letter = String.fromCharCode(i);
            const button = document.createElement('button');
            button.textContent = letter;
            button.addEventListener('click', () => this.handleGuess(letter));
            this.keyboard.appendChild(button);
        }
    }

    updateWordDisplay() {
        this.wordDisplay.innerHTML = '';
        [...this.word].forEach(letter => {
            const span = document.createElement('span');
            span.textContent = this.guessedLetters.has(letter) ? letter : '';
            this.wordDisplay.appendChild(span);
        });
    }

    handleGuess(letter) {
        if (this.gameStatus !== 'playing') return;

        // Disable the clicked button
        const button = [...this.keyboard.children].find(btn => btn.textContent === letter);
        button.classList.add('disabled');

        if (!this.guessedLetters.has(letter)) {
            this.guessedLetters.add(letter);
            
            if (!this.word.includes(letter)) {
                this.remainingGuesses--;
                this.drawHangman(6 - this.remainingGuesses);
            }

            this.updateWordDisplay();
            this.checkGameStatus();
            this.updateGameMessage();
        }
    }

    checkGameStatus() {
        if (this.remainingGuesses === 0) {
            this.gameStatus = 'lost';
        } else if ([...this.word].every(letter => this.guessedLetters.has(letter))) {
            this.gameStatus = 'won';
        }
    }

    updateGameMessage() {
        switch (this.gameStatus) {
            case 'playing':
                this.gameMessage.textContent = `Remaining guesses: ${this.remainingGuesses}`;
                break;
            case 'won':
                this.gameMessage.textContent = 'Congratulations! You won!';
                break;
            case 'lost':
                this.gameMessage.textContent = `Game Over! The word was: ${this.word}`;
                break;
        }
    }

    drawGallows() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        
        // Base
        this.ctx.beginPath();
        this.ctx.moveTo(20, 230);
        this.ctx.lineTo(180, 230);
        this.ctx.stroke();
        
        // Vertical pole
        this.ctx.beginPath();
        this.ctx.moveTo(40, 230);
        this.ctx.lineTo(40, 20);
        this.ctx.stroke();
        
        // Horizontal beam
        this.ctx.beginPath();
        this.ctx.moveTo(40, 20);
        this.ctx.lineTo(120, 20);
        this.ctx.stroke();
        
        // Rope
        this.ctx.beginPath();
        this.ctx.moveTo(120, 20);
        this.ctx.lineTo(120, 40);
        this.ctx.stroke();
    }

    drawHangman(step) {
        switch(step) {
            case 1: // Head
                this.ctx.beginPath();
                this.ctx.arc(120, 60, 20, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
            case 2: // Body
                this.ctx.beginPath();
                this.ctx.moveTo(120, 80);
                this.ctx.lineTo(120, 150);
                this.ctx.stroke();
                break;
            case 3: // Left arm
                this.ctx.beginPath();
                this.ctx.moveTo(120, 100);
                this.ctx.lineTo(80, 120);
                this.ctx.stroke();
                break;
            case 4: // Right arm
                this.ctx.beginPath();
                this.ctx.moveTo(120, 100);
                this.ctx.lineTo(160, 120);
                this.ctx.stroke();
                break;
            case 5: // Left leg
                this.ctx.beginPath();
                this.ctx.moveTo(120, 150);
                this.ctx.lineTo(90, 190);
                this.ctx.stroke();
                break;
            case 6: // Right leg
                this.ctx.beginPath();
                this.ctx.moveTo(120, 150);
                this.ctx.lineTo(150, 190);
                this.ctx.stroke();
                break;
        }
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const game = new HangmanGame();
    document.getElementById('newGameButton').addEventListener('click', () => {
        game.initializeGame();
    });
}); 