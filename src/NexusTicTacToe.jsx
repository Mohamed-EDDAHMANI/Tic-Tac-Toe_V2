import React, { useState, useEffect } from 'react';
import { Zap, Users, Bot, RotateCw, Settings, Trophy, Sun, Moon } from 'lucide-react';

// AI Engine Class
class AIEngine {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
  }

  makeMove(board, symbol, opponentSymbol, gridSize, winCondition) {
    switch (this.difficulty) {
      case 'easy':
        return this.makeRandomMove(board, gridSize);
      case 'medium':
        return this.makeMediumMove(board, symbol, opponentSymbol, gridSize, winCondition);
      case 'hard':
        return this.makeHardMove(board, symbol, opponentSymbol, gridSize, winCondition);
      default:
        return this.makeMediumMove(board, symbol, opponentSymbol, gridSize, winCondition);
    }
  }

  makeRandomMove(board, gridSize) {
    const availableMoves = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (board[row][col] === '') {
          availableMoves.push([row, col]);
        }
      }
    }
    if (availableMoves.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  makeMediumMove(board, symbol, opponentSymbol, gridSize, winCondition) {
    const winMove = this.findWinningMove(board, symbol, gridSize, winCondition);
    if (winMove) return winMove;

    const blockMove = this.findWinningMove(board, opponentSymbol, gridSize, winCondition);
    if (blockMove) return blockMove;

    if (gridSize === 3 && board[1][1] === '') {
      return [1, 1];
    }

    const corners = [[0, 0], [0, gridSize - 1], [gridSize - 1, 0], [gridSize - 1, gridSize - 1]];
    const availableCorners = corners.filter(([row, col]) => board[row][col] === '');
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    return this.makeRandomMove(board, gridSize);
  }

  makeHardMove(board, symbol, opponentSymbol, gridSize, winCondition) {
    const bestMove = this.minimax(board, symbol, opponentSymbol, gridSize, winCondition, 0, true, -Infinity, Infinity);
    return bestMove.move;
  }

  findWinningMove(board, symbol, gridSize, winCondition) {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (board[row][col] === '') {
          board[row][col] = symbol;
          if (this.checkWinFromPosition(board, row, col, symbol, gridSize, winCondition)) {
            board[row][col] = '';
            return [row, col];
          }
          board[row][col] = '';
        }
      }
    }
    return null;
  }

  checkWinFromPosition(board, row, col, symbol, gridSize, winCondition) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let [dx, dy] of directions) {
      let count = 1;
      let r = row + dx;
      let c = col + dy;
      while (r >= 0 && r < gridSize && c >= 0 && c < gridSize && board[r][c] === symbol) {
        count++;
        r += dx;
        c += dy;
      }
      r = row - dx;
      c = col - dy;
      while (r >= 0 && r < gridSize && c >= 0 && c < gridSize && board[r][c] === symbol) {
        count++;
        r -= dx;
        c -= dy;
      }
      if (count >= winCondition) return true;
    }
    return false;
  }

  minimax(board, aiSymbol, humanSymbol, gridSize, winCondition, depth, isMaximizing, alpha, beta) {
    const winner = this.evaluateBoard(board, aiSymbol, humanSymbol, gridSize, winCondition);
    if (winner === aiSymbol) return { score: 10 - depth, move: null };
    if (winner === humanSymbol) return { score: depth - 10, move: null };
    if (this.isBoardFull(board, gridSize)) return { score: 0, move: null };
    if (depth >= 6) return { score: 0, move: null };

    let bestMove = null;
    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (board[row][col] === '') {
          board[row][col] = isMaximizing ? aiSymbol : humanSymbol;
          const result = this.minimax(board, aiSymbol, humanSymbol, gridSize, winCondition, depth + 1, !isMaximizing, alpha, beta);
          board[row][col] = '';

          if (isMaximizing) {
            if (result.score > bestScore) {
              bestScore = result.score;
              bestMove = [row, col];
            }
            alpha = Math.max(alpha, result.score);
          } else {
            if (result.score < bestScore) {
              bestScore = result.score;
              bestMove = [row, col];
            }
            beta = Math.min(beta, result.score);
          }
          if (beta <= alpha) break;
        }
      }
      if (beta <= alpha) break;
    }
    return { score: bestScore, move: bestMove };
  }

  evaluateBoard(board, aiSymbol, humanSymbol, gridSize, winCondition) {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (board[row][col] !== '') {
          if (this.checkWinFromPosition(board, row, col, board[row][col], gridSize, winCondition)) {
            return board[row][col];
          }
        }
      }
    }
    return null;
  }

  isBoardFull(board, gridSize) {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (board[row][col] === '') return false;
      }
    }
    return true;
  }
}

export default function NexusTicTacToe() {
  // Load data from localStorage or use defaults
  const loadFromLocalStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  };

  const [gameMode, setGameMode] = useState('pvp');
  const [gridSize, setGridSize] = useState(3);
  const [winCondition, setWinCondition] = useState(3);
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [player1, setPlayer1] = useState(() => loadFromLocalStorage('player1', { symbol: 'X', name: 'Player 1', score: 0, games: 0 }));
  const [player2, setPlayer2] = useState(() => loadFromLocalStorage('player2', { symbol: 'O', name: 'Player 2', score: 0, games: 0 }));
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState(() => loadFromLocalStorage('aiDifficulty', 'medium'));
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiEngine] = useState(() => new AIEngine(loadFromLocalStorage('aiDifficulty', 'medium')));
  // Starting player option: 'p1' | 'p2' | 'alternate' | 'random'
  const [startOption, setStartOption] = useState(() => loadFromLocalStorage('startOption', 'alternate'));
  // Track who started last to support alternate mode: 'p1' | 'p2'
  const [lastStarter, setLastStarter] = useState('p2');
  // In AI mode, choose which side the human plays: 'player1' | 'player2'
  const [aiHumanSide, setAiHumanSide] = useState('player1');
  // Theme mode: 'dark' | 'light'
  const [theme, setTheme] = useState(() => loadFromLocalStorage('theme', 'dark'));

  useEffect(() => {
    const newBoard = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    setBoard(newBoard);
    let starter = startOption;
    if (startOption === 'alternate') {
      starter = lastStarter === 'p1' ? 'p2' : 'p1';
    } else if (startOption === 'random') {
      starter = Math.random() < 0.5 ? 'p1' : 'p2';
    }
    const startingSymbol = starter === 'p1' ? player1.symbol : player2.symbol;
    setCurrentPlayer(startingSymbol);
    const aiSymbol = aiHumanSide === 'player1' ? player2.symbol : player1.symbol;
    if (gameMode === 'pvc' && startingSymbol === aiSymbol) {
      setTimeout(() => makeAiMove(), 100);
    }
  }, [gridSize, gameMode, startOption, lastStarter, aiHumanSide, player1.symbol, player2.symbol]);

  // Save player1 to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('player1', JSON.stringify(player1));
    } catch (error) {
      console.error('Error saving player1 to localStorage:', error);
    }
  }, [player1]);

  // Save player2 to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('player2', JSON.stringify(player2));
    } catch (error) {
      console.error('Error saving player2 to localStorage:', error);
    }
  }, [player2]);

  // Save AI difficulty to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('aiDifficulty', JSON.stringify(aiDifficulty));
    } catch (error) {
      console.error('Error saving aiDifficulty to localStorage:', error);
    }
  }, [aiDifficulty]);

  // Save starting option to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('startOption', JSON.stringify(startOption));
    } catch (error) {
      console.error('Error saving startOption to localStorage:', error);
    }
  }, [startOption]);

  // Save theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('theme', JSON.stringify(theme));
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [theme]);

  useEffect(() => {
    aiEngine.difficulty = aiDifficulty;
  }, [aiDifficulty, aiEngine]);

  // Removed AI turn effect; AI is scheduled after moves and at new game when needed.

  // board is reinitialized when gridSize changes via useEffect above

  const makeAiMove = () => {
    // Guard clauses - don't check currentPlayer here since state might not have settled
    if (gameMode !== 'pvc' || gameOver || isAiThinking) return;
    
    // Determine AI symbol based on which side the human chose
    const aiSymbol = aiHumanSide === 'player1' ? player2.symbol : player1.symbol;
    const humanSymbol = aiHumanSide === 'player1' ? player1.symbol : player2.symbol;
    
    setIsAiThinking(true);
    const thinkingTime = aiDifficulty === 'hard' ? 1200 : aiDifficulty === 'medium' ? 800 : 400;
    
    setTimeout(() => {
      // Use CURRENT board state from the closure (React will have the latest)
      // Don't capture before setTimeout - we want the board AFTER human's move
      setBoard(currentBoard => {
        const aiMove = aiEngine.makeMove(currentBoard, aiSymbol, humanSymbol, gridSize, winCondition);
        if (aiMove) {
          const [row, col] = aiMove;
          
          // Make sure the cell is empty
          if (currentBoard[row][col]) {
            setIsAiThinking(false);
            return currentBoard; // Don't modify board
          }
          
          // Create new board with AI's move
          const newBoard = currentBoard.map(r => [...r]);
          newBoard[row][col] = aiSymbol;
          
          // Check for win
          const winResult = checkWin(newBoard, row, col);
          if (winResult.win) {
            handleWin(winResult.cells, aiSymbol);
            setIsAiThinking(false);
            setGameOver(true);
            return newBoard;
          }
          
          // Check for draw
          if (checkDraw(newBoard)) {
            handleDraw();
            setIsAiThinking(false);
            return newBoard;
          }
          
          // Switch turn to human
          const nextPlayerSymbol = aiSymbol === player1.symbol ? player2.symbol : player1.symbol;
          setCurrentPlayer(nextPlayerSymbol);
          setIsAiThinking(false);
          
          return newBoard;
        } else {
          setIsAiThinking(false);
          return currentBoard;
        }
      });
    }, thinkingTime);
  };

  const handleCellClick = (row, col) => {
    // Only handle human clicks now - AI handles itself in makeAiMove
    if (gameOver || board[row][col]) return;
    
    // Strict turn enforcement for human player
    if (gameMode === 'pvc') {
      if (isAiThinking) return; // Block human clicks while AI is thinking
      const aiSymbol = aiHumanSide === 'player1' ? player2.symbol : player1.symbol;
      if (currentPlayer === aiSymbol) return; // Human can't play on AI turn
    }
    
    // Update the board with human's move
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    // Check for win with the symbol that was just placed
    const winResult = checkWin(newBoard, row, col);
    if (winResult.win) {
      handleWin(winResult.cells, currentPlayer); // Pass the winning symbol
      return;
    }

    // Check for draw
    if (checkDraw(newBoard)) {
      handleDraw();
      return;
    }

    // Calculate next player's symbol
    const nextPlayerSymbol = currentPlayer === player1.symbol ? player2.symbol : player1.symbol;
    setCurrentPlayer(nextPlayerSymbol);
    
    // If next turn is AI, schedule AI move
    const aiSymbol = aiHumanSide === 'player1' ? player2.symbol : player1.symbol;
    if (gameMode === 'pvc' && nextPlayerSymbol === aiSymbol) {
      setTimeout(() => makeAiMove(), 100);
    }
  };

  const checkWin = (boardState, row, col) => {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let [dx, dy] of directions) {
      const cells = getCellsInDirection(boardState, row, col, dx, dy);
      if (cells.length >= winCondition) {
        return { win: true, cells };
      }
    }
    return { win: false, cells: [] };
  };

  const getCellsInDirection = (boardState, row, col, dx, dy) => {
    const symbol = boardState[row][col];
    const cells = [[row, col]];

    let r = row + dx, c = col + dy;
    while (r >= 0 && r < gridSize && c >= 0 && c < gridSize && boardState[r][c] === symbol) {
      cells.push([r, c]);
      r += dx;
      c += dy;
    }

    r = row - dx;
    c = col - dy;
    while (r >= 0 && r < gridSize && c >= 0 && c < gridSize && boardState[r][c] === symbol) {
      cells.push([r, c]);
      r -= dx;
      c -= dy;
    }

    return cells;
  };

  const checkDraw = (boardState) => {
    return boardState.every(row => row.every(cell => cell !== ''));
  };

  const handleWin = (cells, winningSymbol) => {
    setGameOver(true);
    setWinner(winningSymbol); // Use the explicit winning symbol
    setWinningCells(cells);

    if (winningSymbol === player1.symbol) {
      setPlayer1(prev => ({ ...prev, score: prev.score + 1, games: prev.games + 1 }));
      setPlayer2(prev => ({ ...prev, games: prev.games + 1 }));
    } else {
      setPlayer2(prev => ({ ...prev, score: prev.score + 1, games: prev.games + 1 }));
      setPlayer1(prev => ({ ...prev, games: prev.games + 1 }));
    }

    setTimeout(() => setShowEndModal(true), 1000);
  };

  const handleDraw = () => {
    setGameOver(true);
    setWinner(null);
    setPlayer1(prev => ({ ...prev, games: prev.games + 1 }));
    setPlayer2(prev => ({ ...prev, games: prev.games + 1 }));
    setTimeout(() => setShowEndModal(true), 800);
  };

  const newGame = () => {
    const newBoard = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    setBoard(newBoard);
    // Determine starting player based on selected option
    let starter = startOption;
    if (startOption === 'alternate') {
      starter = lastStarter === 'p1' ? 'p2' : 'p1';
      setLastStarter(starter);
    } else if (startOption === 'random') {
      starter = Math.random() < 0.5 ? 'p1' : 'p2';
      setLastStarter(starter);
    } else {
      setLastStarter(startOption);
    }
    const startingSymbol = starter === 'p1' ? player1.symbol : player2.symbol;
    setCurrentPlayer(startingSymbol);
    setGameOver(false);
    setWinner(null);
    setWinningCells([]);
    setShowEndModal(false);
    setIsAiThinking(false);
    // If AI should start, schedule its move
    const aiSymbol = aiHumanSide === 'player1' ? player2.symbol : player1.symbol;
    if (gameMode === 'pvc' && startingSymbol === aiSymbol) {
      setTimeout(() => makeAiMove(), 100);
    }
  };

  const resetScores = () => {
    const resetPlayer1 = { ...player1, score: 0, games: 0 };
    const resetPlayer2 = { ...player2, score: 0, games: 0 };
    setPlayer1(resetPlayer1);
    setPlayer2(resetPlayer2);
    // Data will be saved to localStorage automatically via useEffect
  };

  const switchMode = (mode) => {
    setGameMode(mode);
    if (mode === 'pvc') {
      // Assign AI name to the AI-controlled player based on human side
      if (aiHumanSide === 'player1') {
        setPlayer2(prev => ({ ...prev, name: `AI (${aiDifficulty})` }));
      } else {
        setPlayer1(prev => ({ ...prev, name: `AI (${aiDifficulty})` }));
      }
    } else {
      // Restore names from localStorage or defaults
      const savedPlayer1 = loadFromLocalStorage('player1', { symbol: 'X', name: 'Player 1', score: 0, games: 0 });
      const savedPlayer2 = loadFromLocalStorage('player2', { symbol: 'O', name: 'Player 2', score: 0, games: 0 });
      setPlayer1(prev => ({ ...prev, name: savedPlayer1.name }));
      setPlayer2(prev => ({ ...prev, name: savedPlayer2.name }));
    }
    newGame();
  };

  const isWinningCell = (row, col) => {
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className={`min-h-screen overflow-hidden relative transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white' 
        : 'bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 text-slate-900'
    }`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {theme === 'dark' ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-blob animation-delay-4000" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200/30 via-slate-50 to-blue-50" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-200/30 via-transparent to-transparent" />
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-300/40 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-300/40 rounded-full blur-3xl animate-blob animation-delay-4000" />
          </>
        )}
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col h-screen p-2 sm:p-3 lg:p-4 gap-2 sm:gap-2.5 lg:gap-3 max-w-[2000px] mx-auto">
        {/* Header - Compact on Mobile */}
        <header className={`backdrop-blur-xl border rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-2xl transition-all ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-purple-500/40 shadow-purple-500/30 hover:shadow-purple-500/40'
            : 'bg-white/90 border-purple-300/60 shadow-purple-300/40 hover:shadow-purple-400/50'
        }`}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl shadow-lg shadow-purple-500/50 animate-pulse">
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Nexus Tic-Tac-Toe
              </h1>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
              <div className={`flex rounded-lg sm:rounded-xl p-0.5 sm:p-1 gap-0.5 sm:gap-1 shadow-inner flex-1 sm:flex-initial min-w-0 ${
                theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-200/50'
              }`}>
                <button
                  onClick={() => switchMode('pvp')}
                  className={`px-3 sm:px-4 py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 sm:gap-1.5 flex-1 sm:flex-initial ${
                    gameMode === 'pvp'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50 scale-105'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>PvP</span>
                </button>
                <button
                  onClick={() => switchMode('pvc')}
                  className={`px-3 sm:px-4 py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 sm:gap-1.5 flex-1 sm:flex-initial ${
                    gameMode === 'pvc'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50 scale-105'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>AI</span>
                </button>
              </div>

              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={newGame}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all flex items-center gap-1 sm:gap-1.5 active:scale-95"
                >
                  <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>New</span>
                </button>

                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`px-3 sm:px-4 py-2 border rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:scale-105 transition-all active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-purple-500/50'
                      : 'bg-white/50 border-slate-300/50 hover:bg-slate-100/50 hover:border-purple-400/50'
                  }`}
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className={`px-3 sm:px-4 py-2 border rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:scale-105 transition-all active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-purple-500/50'
                      : 'bg-white/50 border-slate-300/50 hover:bg-slate-100/50 hover:border-purple-400/50'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Game Status - Enhanced Mobile */}
        <div className={`backdrop-blur-xl border rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-2xl transition-all ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-purple-500/40 shadow-purple-500/30'
            : 'bg-white/90 border-purple-300/60 shadow-purple-300/40'
        }`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                <div className="absolute inset-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-ping opacity-75" />
              </div>
              <span className={`text-sm sm:text-base font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                <span className="hidden sm:inline">Turn: </span>
                <strong className="font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {currentPlayer === player1.symbol ? player1.name : player2.name}
                </strong>
              </span>
            </div>
            <div className={`flex items-center gap-2 sm:gap-4 text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className={`px-2 py-1 rounded-lg font-medium ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-200/50'}`}>
                <strong className="text-purple-400">{gridSize}×{gridSize}</strong>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className={`px-2 py-1 rounded-lg font-medium ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-200/50'}`}>
                Win: <strong className="text-blue-400">{winCondition}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Game Area - Optimized Mobile UX */}
        <div className="flex-1 flex flex-col md:grid md:grid-cols-2 lg:grid-cols-[minmax(200px,1fr)_auto_minmax(200px,1fr)] gap-2.5 sm:gap-3 lg:gap-6 min-h-0 overflow-hidden">
          
          {/* Game Board - First on Mobile, Center on Desktop */}
          <div className="flex items-center justify-center order-1 md:order-2 md:col-span-2 lg:col-span-1 lg:order-2 flex-1 min-h-0 p-2 sm:p-3">
            <div
              className={`
                backdrop-blur-xl 
                border-2 rounded-2xl sm:rounded-3xl shadow-2xl
                w-full h-full 
                ${theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-slate-900/95 border-purple-500/40 shadow-purple-500/40'
                  : 'bg-gradient-to-br from-white/95 via-purple-100/30 to-white/95 border-purple-400/50 shadow-purple-400/50'
                }
                ${gridSize >= 8 
                  ? 'max-w-[min(95vw,420px)] max-h-[min(95vw,420px)] md:max-w-[min(85vw,600px)] md:max-h-[min(70vh,600px)] lg:max-w-[min(55vw,750px)] lg:max-h-[min(75vh,750px)]' 
                  : gridSize >= 7 
                  ? 'max-w-[min(95vw,450px)] max-h-[min(95vw,450px)] md:max-w-[min(85vw,620px)] md:max-h-[min(70vh,620px)] lg:max-w-[min(55vw,800px)] lg:max-h-[min(75vh,800px)]' 
                  : gridSize >= 6 
                  ? 'max-w-[min(95vw,470px)] max-h-[min(95vw,470px)] md:max-w-[min(85vw,640px)] md:max-h-[min(70vh,640px)] lg:max-w-[min(58vw,850px)] lg:max-h-[min(78vh,850px)]' 
                  : gridSize >= 5 
                  ? 'max-w-[min(95vw,480px)] max-h-[min(95vw,480px)] md:max-w-[min(90vw,650px)] md:max-h-[min(70vh,650px)] lg:max-w-[min(60vw,900px)] lg:max-h-[min(80vh,900px)]' 
                  : 'max-w-[min(95vw,500px)] max-h-[min(95vw,500px)] md:max-w-[min(90vw,680px)] md:max-h-[min(75vh,680px)] lg:max-w-[min(65vw,950px)] lg:max-h-[min(85vh,950px)]'
                }
                ${gridSize >= 7 ? 'p-1.5 sm:p-2 lg:p-2.5' : gridSize >= 5 ? 'p-2 sm:p-2.5 lg:p-3' : 'p-2.5 sm:p-3 lg:p-4'}
              `}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                gap: gridSize >= 8 ? '2px' : gridSize >= 7 ? '3px' : gridSize >= 6 ? '4px' : gridSize >= 5 ? '6px' : '8px',
                aspectRatio: '1',
                overflow: 'hidden'
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={gameOver || cell !== '' || isAiThinking}
                    className={`
                      backdrop-blur-sm border flex items-center justify-center font-bold transition-all duration-300
                      hover:scale-[1.03] active:scale-95 active:shadow-inner
                      ${theme === 'dark'
                        ? 'bg-slate-800/70 border-slate-700/50'
                        : 'bg-white/70 border-slate-300/50'
                      }
                      ${cell 
                        ? `cursor-default shadow-lg ${theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90'}` 
                        : `cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-700/70 active:bg-slate-600/70' : 'hover:bg-slate-100/70 active:bg-slate-200/70'}`
                      }
                      ${isWinningCell(rowIndex, colIndex) 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-green-400 animate-pulse shadow-2xl shadow-green-500/70 scale-[1.05] ring-2 ring-green-400/50' 
                        : theme === 'dark' ? 'hover:border-purple-500/70 hover:shadow-lg hover:shadow-purple-500/50' : 'hover:border-purple-400/70 hover:shadow-lg hover:shadow-purple-400/40'
                      }
                      ${
                        gridSize >= 8 
                          ? 'rounded-md text-sm sm:text-lg md:text-xl lg:text-2xl border-[1px]' 
                          : gridSize >= 7 
                          ? 'rounded-md sm:rounded-lg text-base sm:text-xl md:text-2xl lg:text-3xl border-[1.5px]' 
                          : gridSize >= 6 
                          ? 'rounded-lg sm:rounded-xl text-lg sm:text-2xl md:text-3xl lg:text-4xl border-[1.5px]' 
                          : gridSize >= 5 
                          ? 'rounded-lg sm:rounded-xl text-xl sm:text-3xl md:text-4xl lg:text-5xl border-2' 
                          : 'rounded-xl sm:rounded-2xl text-2xl sm:text-4xl md:text-5xl lg:text-6xl border-2'
                      }
                      ${cell === 'X' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : cell === 'O' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : ''}
                      ${!cell && !gameOver && !isAiThinking ? 'hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-blue-500/10' : ''}
                    `}
                    style={{
                      width: '100%',
                      height: '100%',
                      minWidth: '0',
                      minHeight: '0',
                      padding: gridSize >= 8 ? '2px' : gridSize >= 7 ? '3px' : gridSize >= 6 ? '4px' : '6px'
                    }}
                  >
                    <span className="truncate w-full h-full flex items-center justify-center">
                      {cell}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Player 1 Card - Enhanced Mobile UX */}
          <div className={`backdrop-blur-xl border-2 rounded-xl sm:rounded-2xl p-3 sm:p-3 md:p-4 lg:p-6 shadow-2xl transition-all order-2 md:order-1 lg:order-1 ${
            theme === 'dark' ? 'bg-slate-900/90' : 'bg-white/90'
          } ${
            currentPlayer === player1.symbol && !gameOver
              ? 'border-purple-500 shadow-purple-500/60 ring-2 ring-purple-500/50 bg-purple-500/5'
              : theme === 'dark' ? 'border-purple-500/40' : 'border-purple-400/50'
          } ${winner === player1.symbol ? 'border-green-500 shadow-green-500/60 ring-4 ring-green-500/50 animate-pulse bg-green-500/10' : ''}`}>
            <div className="flex md:flex-row lg:flex-col items-center gap-3 sm:gap-3 lg:gap-4">
              <div className="relative">
                <div className={`bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold shadow-xl flex-shrink-0 transition-all duration-300 ${
                  currentPlayer === player1.symbol && !gameOver ? 'shadow-purple-500/60 scale-110 ring-4 ring-purple-400/30' : ''
                }`}>
                  {player1.symbol}
                </div>
                {currentPlayer === player1.symbol && !gameOver && (
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-75 animate-pulse" />
                )}
              </div>
              <div className="flex-1 md:w-auto lg:w-full text-center">
                <input
                  type="text"
                  value={player1.name}
                  onChange={(e) => setPlayer1(prev => ({ ...prev, name: e.target.value }))}
                  disabled={gameMode === 'pvc' && aiHumanSide === 'player2'}
                  className={`border-2 rounded-lg px-3 py-1.5 sm:py-2 text-sm sm:text-base md:text-base text-center w-full font-semibold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 transition-all ${
                    theme === 'dark' 
                      ? 'bg-slate-800/50 border-slate-700 text-white' 
                      : 'bg-slate-100/50 border-slate-300 text-slate-900'
                  }`}
                  maxLength={20}
                />
                <div className="flex justify-around mt-2 sm:mt-3 gap-2">
                  <div className={`text-center flex-1 rounded-lg p-2 ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-200/30'}`}>
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {player1.score}
                    </div>
                    <div className={`text-[10px] sm:text-xs md:text-xs uppercase tracking-wider font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Score</div>
                  </div>
                  <div className={`text-center flex-1 rounded-lg p-2 ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-200/30'}`}>
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {player1.games}
                    </div>
                    <div className={`text-[10px] sm:text-xs md:text-xs uppercase tracking-wider font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Games</div>
                  </div>
                </div>
                <div className={`mt-2 sm:mt-3 py-2 sm:py-2 md:py-2 rounded-lg text-xs sm:text-sm md:text-sm font-bold uppercase tracking-wider transition-all shadow-lg ${
                  currentPlayer === player1.symbol && !gameOver
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse shadow-green-500/50'
                    : winner === player1.symbol
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/50'
                    : theme === 'dark' ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-200/50 text-slate-600'
                }`}>
                  {winner === player1.symbol ? '🏆 Winner!' : currentPlayer === player1.symbol && !gameOver ? '▶ Your Turn' : 'Waiting...'}
                </div>
              </div>
            </div>
          </div>

          {/* Player 2 Card - Enhanced Mobile UX */}
          <div className={`backdrop-blur-xl border-2 rounded-xl sm:rounded-2xl p-3 sm:p-3 md:p-4 lg:p-6 shadow-2xl transition-all order-3 md:order-3 lg:order-3 overflow-hidden ${
            theme === 'dark' ? 'bg-slate-900/90' : 'bg-white/90'
          } ${
            currentPlayer === player2.symbol && !gameOver
              ? 'border-pink-500 shadow-pink-500/60 ring-2 ring-pink-500/50 bg-pink-500/5'
              : theme === 'dark' ? 'border-pink-500/40' : 'border-pink-400/50'
          } ${winner === player2.symbol ? 'border-green-500 shadow-green-500/60 ring-4 ring-green-500/50 animate-pulse bg-green-500/10' : ''}`}>
            <div className="flex md:flex-row lg:flex-col items-center gap-3 sm:gap-3 lg:gap-4">
              <div className="relative">
                <div className={`bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold shadow-xl flex-shrink-0 transition-all duration-300 ${
                  currentPlayer === player2.symbol && !gameOver ? 'shadow-pink-500/60 scale-110 ring-4 ring-pink-400/30' : ''
                }`}>
                  {player2.symbol}
                </div>
                {currentPlayer === player2.symbol && !gameOver && (
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full blur-md opacity-75 animate-pulse" />
                )}
              </div>
              <div className="flex-1 md:w-auto lg:w-full text-center">
                <input
                  type="text"
                  value={player2.name}
                  onChange={(e) => setPlayer2(prev => ({ ...prev, name: e.target.value }))}
                  disabled={gameMode === 'pvc' && aiHumanSide === 'player1'}
                  className={`border-2 rounded-lg px-3 py-1.5 sm:py-2 text-sm sm:text-base md:text-base text-center w-full font-semibold focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 disabled:opacity-50 transition-all ${
                    theme === 'dark' 
                      ? 'bg-slate-800/50 border-slate-700 text-white' 
                      : 'bg-slate-100/50 border-slate-300 text-slate-900'
                  }`}
                  maxLength={20}
                />
                <div className="flex justify-around mt-2 sm:mt-3 gap-2">
                  <div className={`text-center flex-1 rounded-lg p-2 ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-200/30'}`}>
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                      {player2.score}
                    </div>
                    <div className={`text-[10px] sm:text-xs md:text-xs uppercase tracking-wider font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Score</div>
                  </div>
                  <div className={`text-center flex-1 rounded-lg p-2 ${theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-200/30'}`}>
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                      {player2.games}
                    </div>
                    <div className={`text-[10px] sm:text-xs md:text-xs uppercase tracking-wider font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Games</div>
                  </div>
                </div>
                <div className={`mt-2 sm:mt-3 py-2 sm:py-2 md:py-2 rounded-lg text-xs sm:text-sm md:text-sm font-bold uppercase tracking-wider transition-all shadow-lg ${
                  currentPlayer === player2.symbol && !gameOver
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse shadow-green-500/50'
                    : winner === player2.symbol
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/50'
                    : theme === 'dark' ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-200/50 text-slate-600'
                }`}>
                  {winner === player2.symbol ? '🏆 Winner!' : currentPlayer === player2.symbol && !gameOver ? (isAiThinking ? '🤔 Thinking...' : '▶ Your Turn') : 'Waiting...'}
                </div>
                {gameMode === 'pvc' && (
                  <div className={`mt-2 py-1.5 px-2 sm:px-3 border rounded-lg text-[10px] sm:text-xs font-medium text-center w-full overflow-hidden ${
                    theme === 'dark'
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                      : 'bg-blue-100/50 border-blue-400/30 text-blue-700'
                  }`}>
                    {/* Mobile: Compact version */}
                    <div className="md:hidden truncate">
                      🤖 {aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)} • P{aiHumanSide === 'player1' ? '1' : '2'}
                    </div>
                    {/* Desktop: Full version */}
                    <div className="hidden md:block truncate">
                      🤖 AI: {aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)} • You are {aiHumanSide === 'player1' ? 'Player 1' : 'Player 2'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`backdrop-blur-xl border rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl flex justify-center transition-all ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-purple-500/40 shadow-purple-500/30'
            : 'bg-white/90 border-purple-300/60 shadow-purple-300/40'
        }`}>
          <button
            onClick={resetScores}
            className="px-3 sm:px-6 py-1.5 sm:py-2.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold hover:shadow-lg hover:shadow-red-500/50 hover:scale-105 transition-all flex items-center gap-1.5 sm:gap-2 text-white"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            Reset Scores
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className={`border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl ${
            theme === 'dark'
              ? 'bg-slate-900 border-purple-500/50'
              : 'bg-white border-purple-400/50'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Game Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className={`text-2xl w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Grid Size
                </label>
                <select
                  value={gridSize}
                  onChange={(e) => {
                    const size = parseInt(e.target.value);
                    setGridSize(size);
                    if (winCondition > size) setWinCondition(size);
                  }}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                >
                  {[3, 4, 5, 6, 7, 8].map(size => (
                    <option key={size} value={size}>{size}×{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Win Condition
                </label>
                <select
                  value={winCondition}
                  onChange={(e) => setWinCondition(parseInt(e.target.value))}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                >
                  {Array.from({ length: gridSize - 2 }, (_, i) => i + 3).map(num => (
                    <option key={num} value={num}>{num} in a row</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Player 1 Symbol
                </label>
                <select
                  value={player1.symbol}
                  onChange={(e) => setPlayer1(prev => ({ ...prev, symbol: e.target.value }))}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                >
                  {['X', 'O', '★', '♦', '●', '■', '🔥', '⚡', '💎', '🚀'].map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Player 2 Symbol
                </label>
                <select
                  value={player2.symbol}
                  onChange={(e) => setPlayer2(prev => ({ ...prev, symbol: e.target.value }))}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                >
                  {['O', 'X', '★', '♦', '●', '■', '🌟', '💫', '🎯', '🔮'].map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  Starting Player
                </label>
                <select
                  value={startOption}
                  onChange={(e) => setStartOption(e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="p1">Player 1 starts</option>
                  <option value="p2">Player 2 starts</option>
                  <option value="alternate">Alternate each game (X then O)</option>
                  <option value="random">Random each game</option>
                </select>
              </div>

              {gameMode === 'pvc' && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    AI Difficulty
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => {
                      setAiDifficulty(e.target.value);
                      if (aiHumanSide === 'player1') {
                        setPlayer2(prev => ({ ...prev, name: `AI (${e.target.value})` }));
                      } else {
                        setPlayer1(prev => ({ ...prev, name: `AI (${e.target.value})` }));
                      }
                    }}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-100 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="easy">Easy - Random moves</option>
                    <option value="medium">Medium - Smart strategy</option>
                    <option value="hard">Hard - Minimax algorithm</option>
                  </select>
                </div>
              )}

              {gameMode === 'pvc' && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    You Play As
                  </label>
                  <select
                    value={aiHumanSide}
                    onChange={(e) => {
                      const newSide = e.target.value;
                      setAiHumanSide(newSide);
                      // Update which player shows AI name
                      if (newSide === 'player1') {
                        // AI becomes Player 2
                        setPlayer2(prev => ({ ...prev, name: `AI (${aiDifficulty})` }));
                        const savedP1 = loadFromLocalStorage('player1', { symbol: 'X', name: 'Player 1', score: 0, games: 0 });
                        setPlayer1(prev => ({ ...prev, name: savedP1.name }));
                      } else {
                        // AI becomes Player 1
                        setPlayer1(prev => ({ ...prev, name: `AI (${aiDifficulty})` }));
                        const savedP2 = loadFromLocalStorage('player2', { symbol: 'O', name: 'Player 2', score: 0, games: 0 });
                        setPlayer2(prev => ({ ...prev, name: savedP2.name }));
                      }
                    }}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-100 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="player1">Player 1</option>
                    <option value="player2">Player 2</option>
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  if (player1.symbol === player2.symbol) {
                    alert('Players must have different symbols!');
                    return;
                  }
                  setShowSettings(false);
                  newGame();
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all text-white"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game End Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEndModal(false)}>
          <div className={`border rounded-2xl p-8 max-w-md w-full text-center shadow-2xl ${
            theme === 'dark'
              ? 'bg-slate-900 border-purple-500/50'
              : 'bg-white border-purple-400/50'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl sm:text-7xl mb-4">
              {winner ? '🏆' : '🤝'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {winner 
                ? `${winner === player1.symbol ? player1.name : player2.name} Wins!`
                : "It's a Draw!"}
            </h2>
            <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {winner 
                ? 'Congratulations on your victory!'
                : 'Great game! Both players played well.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={newGame}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all text-white"
              >
                Play Again
              </button>
              <button
                onClick={() => setShowEndModal(false)}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}