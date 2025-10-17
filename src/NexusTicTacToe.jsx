import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Users, Bot, RotateCw, Settings, Trophy } from 'lucide-react';

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

  useEffect(() => {
    initializeBoard();
  }, [gridSize]);

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

  useEffect(() => {
    aiEngine.difficulty = aiDifficulty;
  }, [aiDifficulty, aiEngine]);

  useEffect(() => {
    if (gameMode === 'pvc' && currentPlayer === player2.symbol && !gameOver && !isAiThinking) {
      makeAiMove();
    }
  }, [currentPlayer, gameMode, gameOver]);

  const initializeBoard = () => {
    const newBoard = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    setBoard(newBoard);
  };

  const makeAiMove = useCallback(() => {
    setIsAiThinking(true);
    const thinkingTime = aiDifficulty === 'hard' ? 1200 : aiDifficulty === 'medium' ? 800 : 400;

    setTimeout(() => {
      const aiMove = aiEngine.makeMove(board, player2.symbol, player1.symbol, gridSize, winCondition);
      if (aiMove) {
        const [row, col] = aiMove;
        handleCellClick(row, col);
      }
      setIsAiThinking(false);
    }, thinkingTime);
  }, [board, player1.symbol, player2.symbol, gridSize, winCondition, aiDifficulty, aiEngine]);

  const handleCellClick = (row, col) => {
    if (gameOver || board[row][col] || isAiThinking) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    const winResult = checkWin(newBoard, row, col);
    if (winResult.win) {
      handleWin(winResult.cells);
      return;
    }

    if (checkDraw(newBoard)) {
      handleDraw();
      return;
    }

    setCurrentPlayer(currentPlayer === player1.symbol ? player2.symbol : player1.symbol);
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

  const handleWin = (cells) => {
    setGameOver(true);
    setWinner(currentPlayer);
    setWinningCells(cells);

    if (currentPlayer === player1.symbol) {
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
    initializeBoard();
    setCurrentPlayer(player1.symbol);
    setGameOver(false);
    setWinner(null);
    setWinningCells([]);
    setShowEndModal(false);
    setIsAiThinking(false);
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
      setPlayer2(prev => ({ ...prev, name: `AI (${aiDifficulty})` }));
    } else {
      // Restore Player 2 name from localStorage or use default
      const savedPlayer2 = loadFromLocalStorage('player2', { symbol: 'O', name: 'Player 2', score: 0, games: 0 });
      setPlayer2(prev => ({ ...prev, name: savedPlayer2.name }));
    }
    newGame();
  };

  const isWinningCell = (row, col) => {
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col h-screen p-2 sm:p-3 lg:p-4 gap-2 sm:gap-2.5 lg:gap-3 max-w-[2000px] mx-auto">
        {/* Header - Compact on Mobile */}
        <header className="bg-slate-900/90 backdrop-blur-xl border border-purple-500/40 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40 transition-all">
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
              <div className="flex bg-slate-800/50 rounded-lg sm:rounded-xl p-0.5 sm:p-1 gap-0.5 sm:gap-1 shadow-inner flex-1 sm:flex-initial min-w-0">
                <button
                  onClick={() => switchMode('pvp')}
                  className={`px-3 sm:px-4 py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1 sm:gap-1.5 flex-1 sm:flex-initial ${
                    gameMode === 'pvp'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
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
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
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
                  onClick={() => setShowSettings(true)}
                  className="px-3 sm:px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-700/50 hover:border-purple-500/50 hover:scale-105 transition-all active:scale-95"
                >
                  <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Game Status - Enhanced Mobile */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-purple-500/40 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-2xl shadow-purple-500/30">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                <div className="absolute inset-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-slate-300 text-sm sm:text-base font-medium">
                <span className="hidden sm:inline">Turn: </span>
                <strong className="font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {currentPlayer === player1.symbol ? player1.name : player2.name}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">
              <span className="bg-slate-800/50 px-2 py-1 rounded-lg font-medium">
                <strong className="text-purple-400">{gridSize}×{gridSize}</strong>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="bg-slate-800/50 px-2 py-1 rounded-lg font-medium">
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
                bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-slate-900/95 backdrop-blur-xl 
                border-2 border-purple-500/40 rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-500/40 
                w-full h-full 
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
                      bg-slate-800/70 backdrop-blur-sm border flex items-center justify-center font-bold transition-all duration-300
                      hover:scale-[1.03] hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 active:shadow-inner
                      ${cell ? 'cursor-default bg-slate-800/90 shadow-lg' : 'cursor-pointer hover:bg-slate-700/70 active:bg-slate-600/70'}
                      ${isWinningCell(rowIndex, colIndex) 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-green-400 animate-pulse shadow-2xl shadow-green-500/70 scale-[1.05] ring-2 ring-green-400/50' 
                        : 'border-slate-700/50 hover:border-purple-500/70'}
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
          <div className={`bg-slate-900/90 backdrop-blur-xl border-2 rounded-xl sm:rounded-2xl p-3 sm:p-3 md:p-4 lg:p-6 shadow-2xl transition-all order-2 md:order-1 lg:order-1 ${
            currentPlayer === player1.symbol && !gameOver
              ? 'border-purple-500 shadow-purple-500/60 ring-2 ring-purple-500/50 bg-purple-500/5'
              : 'border-purple-500/40'
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
                  className="bg-slate-800/50 border-2 border-slate-700 rounded-lg px-3 py-1.5 sm:py-2 text-sm sm:text-base md:text-base text-center w-full font-semibold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                  maxLength={20}
                />
                <div className="flex justify-around mt-2 sm:mt-3 gap-2">
                  <div className="text-center flex-1 bg-slate-800/30 rounded-lg p-2">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {player1.score}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-xs text-slate-400 uppercase tracking-wider font-medium">Score</div>
                  </div>
                  <div className="text-center flex-1 bg-slate-800/30 rounded-lg p-2">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {player1.games}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-xs text-slate-400 uppercase tracking-wider font-medium">Games</div>
                  </div>
                </div>
                <div className={`mt-2 sm:mt-3 py-2 sm:py-2 md:py-2 rounded-lg text-xs sm:text-sm md:text-sm font-bold uppercase tracking-wider transition-all shadow-lg ${
                  currentPlayer === player1.symbol && !gameOver
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse shadow-green-500/50'
                    : winner === player1.symbol
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/50'
                    : 'bg-slate-800/50 text-slate-400'
                }`}>
                  {winner === player1.symbol ? '🏆 Winner!' : currentPlayer === player1.symbol && !gameOver ? '▶ Your Turn' : 'Waiting...'}
                </div>
              </div>
            </div>
          </div>

          {/* Player 2 Card - Enhanced Mobile UX */}
          <div className={`bg-slate-900/90 backdrop-blur-xl border-2 rounded-xl sm:rounded-2xl p-3 sm:p-3 md:p-4 lg:p-6 shadow-2xl transition-all order-3 md:order-3 lg:order-3 ${
            currentPlayer === player2.symbol && !gameOver
              ? 'border-pink-500 shadow-pink-500/60 ring-2 ring-pink-500/50 bg-pink-500/5'
              : 'border-pink-500/40'
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
                  disabled={gameMode === 'pvc'}
                  className="bg-slate-800/50 border-2 border-slate-700 rounded-lg px-3 py-1.5 sm:py-2 text-sm sm:text-base md:text-base text-center w-full font-semibold focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 disabled:opacity-50 transition-all"
                  maxLength={20}
                />
                <div className="flex justify-around mt-2 sm:mt-3 gap-2">
                  <div className="text-center flex-1 bg-slate-800/30 rounded-lg p-2">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                      {player2.score}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-xs text-slate-400 uppercase tracking-wider font-medium">Score</div>
                  </div>
                  <div className="text-center flex-1 bg-slate-800/30 rounded-lg p-2">
                    <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                      {player2.games}
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-xs text-slate-400 uppercase tracking-wider font-medium">Games</div>
                  </div>
                </div>
                <div className={`mt-2 sm:mt-3 py-2 sm:py-2 md:py-2 rounded-lg text-xs sm:text-sm md:text-sm font-bold uppercase tracking-wider transition-all shadow-lg ${
                  currentPlayer === player2.symbol && !gameOver
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse shadow-green-500/50'
                    : winner === player2.symbol
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/50'
                    : 'bg-slate-800/50 text-slate-400'
                }`}>
                  {winner === player2.symbol ? '🏆 Winner!' : currentPlayer === player2.symbol && !gameOver ? (isAiThinking ? '🤔 Thinking...' : '▶ Your Turn') : 'Waiting...'}
                </div>
                {gameMode === 'pvc' && (
                  <div className="mt-2 py-1.5 px-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs sm:text-xs text-blue-300 font-medium">
                    🤖 AI: {aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-purple-500/40 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl shadow-purple-500/30 flex justify-center">
          <button
            onClick={resetScores}
            className="px-3 sm:px-6 py-1.5 sm:py-2.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold hover:shadow-lg hover:shadow-red-500/50 hover:scale-105 transition-all flex items-center gap-1.5 sm:gap-2"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            Reset Scores
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-slate-900 border border-purple-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Game Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-all"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Grid Size
                </label>
                <select
                  value={gridSize}
                  onChange={(e) => {
                    const size = parseInt(e.target.value);
                    setGridSize(size);
                    if (winCondition > size) setWinCondition(size);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                >
                  {[3, 4, 5, 6, 7, 8].map(size => (
                    <option key={size} value={size}>{size}×{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Win Condition
                </label>
                <select
                  value={winCondition}
                  onChange={(e) => setWinCondition(parseInt(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                >
                  {Array.from({ length: gridSize - 2 }, (_, i) => i + 3).map(num => (
                    <option key={num} value={num}>{num} in a row</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Player 1 Symbol
                </label>
                <select
                  value={player1.symbol}
                  onChange={(e) => setPlayer1(prev => ({ ...prev, symbol: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                >
                  {['X', 'O', '★', '♦', '●', '■', '🔥', '⚡', '💎', '🚀'].map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Player 2 Symbol
                </label>
                <select
                  value={player2.symbol}
                  onChange={(e) => setPlayer2(prev => ({ ...prev, symbol: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                >
                  {['O', 'X', '★', '♦', '●', '■', '🌟', '💫', '🎯', '🔮'].map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              </div>

              {gameMode === 'pvc' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    AI Difficulty
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => {
                      setAiDifficulty(e.target.value);
                      setPlayer2(prev => ({ ...prev, name: `AI (${e.target.value})` }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="easy">Easy - Random moves</option>
                    <option value="medium">Medium - Smart strategy</option>
                    <option value="hard">Hard - Minimax algorithm</option>
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
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
          <div className="bg-slate-900 border border-purple-500/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl sm:text-7xl mb-4">
              {winner ? '🏆' : '🤝'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {winner 
                ? `${winner === player1.symbol ? player1.name : player2.name} Wins!`
                : "It's a Draw!"}
            </h2>
            <p className="text-slate-400 mb-6">
              {winner 
                ? 'Congratulations on your victory!'
                : 'Great game! Both players played well.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={newGame}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Play Again
              </button>
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 px-6 py-3 bg-slate-800 rounded-xl font-semibold hover:bg-slate-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @media (max-width: 640px) {
          .xs\:inline {
            display: inline;
          }
        }

        /* Custom responsive fixes for 801x1014 and 1134x1014 resolutions */
        @media (min-width: 768px) and (max-width: 1200px) {
          /* Adjust main container padding for medium screens */
          .relative.z-10.flex.flex-col.h-screen {
            padding: 0.75rem;
            gap: 0.625rem;
          }

          /* Optimize game board container for medium screens */
          .flex.items-center.justify-center.order-1 {
            padding: 0.5rem;
          }

          /* Adjust player cards to be more compact */
          .bg-slate-900\/90.backdrop-blur-xl.border-2.rounded-xl {
            padding: 0.75rem !important;
          }

          /* Make player symbols slightly smaller */
          .bg-gradient-to-br.rounded-full.flex.items-center.justify-center {
            width: 3.5rem !important;
            height: 3.5rem !important;
            font-size: 1.75rem !important;
          }

          /* Adjust player input fields */
          input[type="text"] {
            font-size: 0.875rem;
            padding: 0.5rem;
          }

          /* Optimize score display */
          .text-center.flex-1.bg-slate-800\/30.rounded-lg {
            padding: 0.5rem;
          }

          /* Adjust header padding */
          header {
            padding: 0.625rem !important;
          }

          /* Optimize button sizes */
          button {
            font-size: 0.875rem;
          }
        }

        /* Specific fix for 801x1014 (portrait tablet) */
        @media (min-width: 768px) and (max-width: 850px) and (min-height: 1000px) {
          /* Force single column layout for game area */
          .flex-1.flex.flex-col.md\:grid {
            display: flex !important;
            flex-direction: column !important;
          }

          /* Maximize board space */
          .flex.items-center.justify-center.order-1 > div {
            max-width: min(92vw, 480px) !important;
            max-height: min(92vw, 480px) !important;
          }

          /* Compact player cards horizontally */
          .bg-slate-900\/90.backdrop-blur-xl.border-2 > div {
            flex-direction: row !important;
            gap: 1rem !important;
          }

          /* Reduce overall padding */
          .relative.z-10.flex.flex-col.h-screen {
            padding: 0.5rem;
            gap: 0.5rem;
          }
        }

        /* Specific fix for 1134x1014 (landscape tablet) */
        @media (min-width: 1100px) and (max-width: 1200px) and (max-height: 1100px) {
          /* Optimize grid layout */
          .flex-1.flex.flex-col.md\:grid.lg\:grid-cols-\[minmax\(200px\,1fr\)_auto_minmax\(200px\,1fr\)\] {
            grid-template-columns: minmax(150px, 0.9fr) auto minmax(150px, 0.9fr) !important;
            gap: 0.75rem !important;
          }

          /* Adjust board size for landscape */
          .flex.items-center.justify-center.order-1 > div {
            max-width: min(50vw, 600px) !important;
            max-height: min(65vh, 600px) !important;
          }

          /* Compact player cards */
          .bg-slate-900\/90.backdrop-blur-xl.border-2 {
            padding: 1rem !important;
          }

          /* Reduce player symbol size */
          .bg-gradient-to-br.rounded-full.flex.items-center.justify-center {
            width: 3.25rem !important;
            height: 3.25rem !important;
            font-size: 1.5rem !important;
          }

          /* Optimize vertical spacing */
          .relative.z-10.flex.flex-col.h-screen {
            padding: 0.625rem;
            gap: 0.5rem;
          }

          /* Compact header */
          header {
            padding: 0.5rem !important;
          }

          header h1 {
            font-size: 1.125rem !important;
          }

          /* Smaller buttons */
          header button {
            padding: 0.5rem 0.75rem;
            font-size: 0.813rem;
          }

          /* Compact footer */
          footer,
          .bg-slate-900\/90.backdrop-blur-xl.border.border-purple-500\/40.rounded-xl:last-child {
            padding: 0.5rem !important;
          }
        }

        /* General optimization for medium screens */
        @media (min-width: 768px) and (max-width: 1024px) {
          /* Ensure game status bar is compact */
          .bg-slate-900\/90.backdrop-blur-xl.border.border-purple-500\/40.rounded-xl {
            padding: 0.625rem !important;
          }

          /* Optimize cell sizes for different grid sizes */
          .bg-slate-800\/70.backdrop-blur-sm.border {
            font-size: clamp(0.875rem, 2vw, 1.5rem);
          }
        }

        /* Fix for very specific resolutions to prevent overflow */
        @media (min-width: 768px) and (max-width: 1200px) and (max-height: 1100px) {
          /* Prevent main container from overflowing */
          .relative.z-10.flex.flex-col.h-screen {
            max-height: 100vh;
            overflow-y: auto;
          }

          /* Ensure game board doesn't get too large */
          .flex.items-center.justify-center.order-1 {
            max-height: 60vh;
          }

          /* Make modals more compact */
          .fixed.inset-0.bg-black\/80 > div {
            max-height: 90vh;
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
}