# 🎮 Nexus Tic-Tac-Toe V2

A modern, feature-rich Tic-Tac-Toe game built with React, Vite, and Tailwind CSS. This project includes AI opponents, customizable game modes, responsive design, and persistent game statistics.

![Tic-Tac-Toe Game](https://img.shields.io/badge/Game-Tic--Tac--Toe-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0.3-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 Game Modes
- **Player vs Player (PvP)**: Play against a friend locally
- **Player vs Computer (PvC)**: Challenge AI opponents with three difficulty levels

### 🤖 AI Engine
Advanced AI implementation with three difficulty levels:
- **Easy**: Random move selection
- **Medium**: Strategic play with blocking and winning move detection
- **Hard**: Minimax algorithm with alpha-beta pruning for optimal gameplay

### ⚙️ Customizable Settings
- **Grid Size**: Choose from 3×3 to 8×8 boards
- **Win Condition**: Set how many symbols in a row are needed to win (3 to grid size)
- **Custom Symbols**: Select from various symbols (X, O, ★, ♦, ●, ■, 🔥, ⚡, 💎, 🚀, etc.)
- **Player Names**: Customize player names with persistent storage
 - **Starting Player**: Choose Player 1, Player 2, Alternate each game, or Random
 - **Vs AI: Your Side**: Pick whether you play as Player 1 or Player 2

### 📊 Statistics Tracking
- **Score Tracking**: Keep track of wins for both players
- **Games Played**: Monitor total games played
- **Persistent Storage**: All statistics saved to localStorage
- **Reset Functionality**: Clear scores and start fresh

### 🎨 Modern UI/UX
- **Gradient Backgrounds**: Beautiful animated background effects
- **Responsive Design**: Optimized for all screen sizes (mobile, tablet, desktop)
- **Smooth Animations**: Pulse effects, hover states, and transitions
- **Dark Theme**: Modern dark mode interface with purple/blue gradients
- **Visual Feedback**: Highlighted winning cells, turn indicators, and game status

### 📱 Responsive Breakpoints
Special optimizations for:
- Mobile devices (< 640px)
- Tablets portrait (801×1014)
- Tablets landscape (1134×1014)
- Desktop (> 1200px)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Mohamed-EDDAHMANI/Tic-Tac-Toe_V2.git
cd Tic-Tac-Toe_V2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder.

## 📖 Project Structure

```
tic_tak_toe/
├── src/
│   ├── NexusTicTacToe.jsx    # Main game component
│   ├── main.jsx               # App entry point
│   ├── index.css              # Global styles
│   └── App.css                # Component styles
├── public/                    # Static assets
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── eslint.config.js          # ESLint configuration
```

## 🧩 Core Functions & Components

### AIEngine Class

The AI brain of the game with multiple difficulty implementations:

#### `makeMove(board, symbol, opponentSymbol, gridSize, winCondition)`
Main AI decision-making function that routes to appropriate difficulty level.

**Parameters:**
- `board`: 2D array representing the game board
- `symbol`: AI player's symbol
- `opponentSymbol`: Human player's symbol
- `gridSize`: Size of the grid (3-8)
- `winCondition`: Number of symbols needed to win

**Returns:** `[row, col]` coordinates for the AI's move

#### `makeRandomMove(board, gridSize)`
Easy difficulty implementation - selects random available cells.

#### `makeMediumMove(board, symbol, opponentSymbol, gridSize, winCondition)`
Medium difficulty with strategic thinking:
1. Checks for winning moves
2. Blocks opponent's winning moves
3. Prioritizes center position (for 3×3)
4. Selects corners when available
5. Falls back to random moves

#### `makeHardMove(board, symbol, opponentSymbol, gridSize, winCondition)`
Hard difficulty using Minimax algorithm with alpha-beta pruning for optimal play.

#### `minimax(board, aiSymbol, humanSymbol, gridSize, winCondition, depth, isMaximizing, alpha, beta)`
Recursive Minimax algorithm implementation.

**Features:**
- Alpha-beta pruning for optimization
- Depth limiting (max 6 levels) for performance
- Score calculation based on win/loss/draw outcomes

#### `findWinningMove(board, symbol, gridSize, winCondition)`
Scans the board to find immediate winning opportunities.

#### `checkWinFromPosition(board, row, col, symbol, gridSize, winCondition)`
Checks if a specific position creates a winning condition in any direction.

#### `evaluateBoard(board, aiSymbol, humanSymbol, gridSize, winCondition)`
Evaluates the current board state to determine if there's a winner.

#### `isBoardFull(board, gridSize)`
Checks if the board is completely filled (for draw detection).

---

### Game State Management

#### `initializeBoard()`
Creates a new empty game board based on the selected grid size.

#### `handleCellClick(row, col)`
Handles player moves:
1. Validates the move (checks if cell is empty, game not over)
2. Updates the board
3. Checks for win/draw conditions
4. Switches to the next player

#### `makeAiMove()`
Triggers AI move with thinking delay for better UX:
- Easy: 400ms delay
- Medium: 800ms delay
- Hard: 1200ms delay

#### `checkWin(boardState, row, col)`
Checks all four directions (horizontal, vertical, diagonal) for winning combinations.

**Returns:** `{ win: boolean, cells: array }` - win status and winning cell coordinates

#### `getCellsInDirection(boardState, row, col, dx, dy)`
Counts consecutive symbols in a specific direction.

**Parameters:**
- `dx, dy`: Direction vectors (0,1 for horizontal, 1,0 for vertical, etc.)

#### `checkDraw(boardState)`
Verifies if all cells are filled without a winner.

#### `handleWin(cells)`
Processes win conditions:
1. Sets game over state
2. Updates winner
3. Highlights winning cells
4. Updates player statistics
5. Shows end game modal

#### `handleDraw()`
Processes draw conditions:
1. Sets game over state
2. Updates games played count
3. Shows draw modal

---

### Game Control Functions

#### `newGame()`
Resets the game state:
- Initializes new board
- Sets starter based on configuration (Player 1, Player 2, Alternate, or Random)
- Clears game over flags
- Hides modals
- Stops AI thinking

#### `resetScores()`
Clears all player statistics (scores and games played).

#### `switchMode(mode)`
Changes between PvP and PvC modes:
- Updates game mode
- Adjusts player 2 name for AI mode
- Starts a new game

#### `isWinningCell(row, col)`
Helper function to check if a cell is part of the winning combination (for highlighting).

---

### LocalStorage Functions

#### `loadFromLocalStorage(key, defaultValue)`
Safely loads data from localStorage with error handling.

**Features:**
- JSON parsing
- Error catching
- Default value fallback

#### Auto-save Effects
Uses React `useEffect` hooks to automatically save:
- Player 1 data (name, symbol, score, games)
- Player 2 data (name, symbol, score, games)
- AI difficulty setting

---

## 🎮 How to Play

1. **Choose Game Mode**: Select PvP or AI mode
2. **Configure Settings**: Adjust grid size, win condition, and symbols
3. **Enter Names**: Customize player names
4. **Play**: Click on cells to make your move
5. **Win**: Get the required number of symbols in a row (horizontal, vertical, or diagonal)
6. **Track Progress**: View scores and statistics in real-time

## 🎨 Styling & Design

### Technologies Used
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Animations**: Blob animations for background effects
- **Gradient Overlays**: Multi-layered radial gradients
- **Responsive Utilities**: Mobile-first responsive design

### Color Scheme
- Primary: Purple (#A855F7)
- Secondary: Blue (#60A5FA)
- Accent: Pink (#EC4899)
- Background: Slate 950 (#020617)

### Special Effects
- Animated background blobs
- Pulsing turn indicators
- Winning cell highlights with glow effects
- Hover states with scale transformations
- Box shadows with colored glows

## 🔧 Configuration

### Vite Configuration
- React plugin for Fast Refresh
- HMR (Hot Module Replacement) enabled

### Tailwind Configuration
- Custom animation delays
- Extended color palette
- Responsive breakpoint customization

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Mohamed EDDAHMANI**
- GitHub: [@Mohamed-EDDAHMANI](https://github.com/Mohamed-EDDAHMANI)

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite for the blazing fast build tool
- Tailwind CSS for the utility-first CSS framework
- Lucide React for beautiful icons

---

**Enjoy playing Nexus Tic-Tac-Toe! 🎮✨**
