import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import GameResultModal from '../../components/common/GameResultModal'

const ChessPage = () => {
  const { theme } = useTheme()
  const [gameMode, setGameMode] = useState(null) // 'local' or 'computer'
  const [board, setBoard] = useState(initialBoard())
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [currentPlayer, setCurrentPlayer] = useState('white')
  const [gameStatus, setGameStatus] = useState('') // '', 'check', 'checkmate'
  const [showResultModal, setShowResultModal] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])

  useEffect(() => {
    document.title = 'Chess - Online Game Hub'
  }, [])

  useEffect(() => {
    // Computer's turn (extremely hard AI with deep search)
    if (gameMode === 'computer' && currentPlayer === 'black' && gameStatus !== 'checkmate') {
      const timer = setTimeout(() => {
        makeComputerMove()
      }, 1500) // Longer thinking time for harder AI
      
      return () => clearTimeout(timer)
    }
  }, [gameMode, currentPlayer, gameStatus])

  useEffect(() => {
    if (gameStatus === 'checkmate') {
      const winner = currentPlayer === 'white' ? 'black' : 'white'
      const result = gameMode === 'computer' ? (winner === 'white' ? 'win' : 'lose') : 'win'
      const message = gameMode === 'computer' 
        ? (winner === 'white' ? 'Incredible! You defeated the master!' : 'Computer wins! Try again!')
        : `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`
      
      setGameResult({ result, message })
      setShowResultModal(true)
    }
  }, [gameStatus, currentPlayer, gameMode])

  function initialBoard() {
    const board = Array(8).fill().map(() => Array(8).fill(null))
    
    // Place pawns
    for (let i = 0; i < 8; i++) {
      board[1][i] = { type: 'pawn', color: 'black' }
      board[6][i] = { type: 'pawn', color: 'white' }
    }
    
    // Place other pieces
    const backRankOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
    
    for (let i = 0; i < 8; i++) {
      board[0][i] = { type: backRankOrder[i], color: 'black' }
      board[7][i] = { type: backRankOrder[i], color: 'white' }
    }
    
    return board
  }

  const getPieceSymbol = (piece) => {
    if (!piece) return null
    
    const symbols = {
      white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
      },
      black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
      }
    }
    
    return symbols[piece.color][piece.type]
  }

  // Advanced evaluation function for very hard AI
  const evaluateBoard = (board) => {
    const pieceValues = {
      pawn: 100,
      knight: 320,
      bishop: 330,
      rook: 500,
      queen: 900,
      king: 20000
    }
    
    // Position tables for better piece placement
    const pawnTable = [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5,  5, 10, 25, 25, 10,  5,  5],
      [0,  0,  0, 20, 20,  0,  0,  0],
      [5, -5,-10,  0,  0,-10, -5,  5],
      [5, 10, 10,-20,-20, 10, 10,  5],
      [0,  0,  0,  0,  0,  0,  0,  0]
    ]
    
    const knightTable = [
      [-50,-40,-30,-30,-30,-30,-40,-50],
      [-40,-20,  0,  0,  0,  0,-20,-40],
      [-30,  0, 10, 15, 15, 10,  0,-30],
      [-30,  5, 15, 20, 20, 15,  5,-30],
      [-30,  0, 15, 20, 20, 15,  0,-30],
      [-30,  5, 10, 15, 15, 10,  5,-30],
      [-40,-20,  0,  5,  5,  0,-20,-40],
      [-50,-40,-30,-30,-30,-30,-40,-50]
    ]
    
    let score = 0
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece) {
          let value = pieceValues[piece.type]
          
          // Add positional bonuses
          if (piece.type === 'pawn') {
            value += piece.color === 'white' ? pawnTable[7-row][col] : pawnTable[row][col]
          } else if (piece.type === 'knight') {
            value += piece.color === 'white' ? knightTable[7-row][col] : knightTable[row][col]
          }
          
          // Encourage center control
          const centerDistance = Math.abs(3.5 - row) + Math.abs(3.5 - col)
          if (piece.type !== 'pawn' && piece.type !== 'king') {
            value += (7 - centerDistance) * 5
          }
          
          score += piece.color === 'black' ? value : -value
        }
      }
    }
    
    return score
  }

  const getAllValidMoves = (board, color) => {
    const moves = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece && piece.color === color) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (isValidMove(row, col, toRow, toCol, board)) {
                moves.push({ fromRow: row, fromCol: col, toRow, toCol })
              }
            }
          }
        }
      }
    }
    return moves
  }

  // Enhanced minimax with deeper search and better pruning
  const minimax = (board, depth, isMaximizing, alpha, beta) => {
    if (depth === 0) {
      return evaluateBoard(board)
    }
    
    const color = isMaximizing ? 'black' : 'white'
    const moves = getAllValidMoves(board, color)
    
    if (moves.length === 0) {
      // Check if it's checkmate or stalemate
      const kingInCheck = isKingInCheck(board, color)
      if (kingInCheck) {
        return isMaximizing ? -10000 + depth : 10000 - depth // Checkmate
      }
      return 0 // Stalemate
    }
    
    // Order moves for better pruning (captures first)
    moves.sort((a, b) => {
      const captureA = board[a.toRow][a.toCol] ? 1 : 0
      const captureB = board[b.toRow][b.toCol] ? 1 : 0
      return captureB - captureA
    })
    
    if (isMaximizing) {
      let maxEval = -Infinity
      for (const move of moves) {
        const newBoard = makeMove(board, move.fromRow, move.fromCol, move.toRow, move.toCol)
        const eval_ = minimax(newBoard, depth - 1, false, alpha, beta)
        maxEval = Math.max(maxEval, eval_)
        alpha = Math.max(alpha, eval_)
        if (beta <= alpha) break // Alpha-beta pruning
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (const move of moves) {
        const newBoard = makeMove(board, move.fromRow, move.fromCol, move.toRow, move.toCol)
        const eval_ = minimax(newBoard, depth - 1, true, alpha, beta)
        minEval = Math.min(minEval, eval_)
        beta = Math.min(beta, eval_)
        if (beta <= alpha) break // Alpha-beta pruning
      }
      return minEval
    }
  }

  const makeMove = (board, fromRow, fromCol, toRow, toCol) => {
    const newBoard = board.map(row => [...row])
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol]
    newBoard[fromRow][fromCol] = null
    return newBoard
  }

  const isKingInCheck = (board, color) => {
    // Find the king
    let kingRow, kingCol
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece && piece.type === 'king' && piece.color === color) {
          kingRow = row
          kingCol = col
          break
        }
      }
    }
    
    // Check if any opponent piece can attack the king
    const opponentColor = color === 'white' ? 'black' : 'white'
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece && piece.color === opponentColor) {
          if (isValidMove(row, col, kingRow, kingCol, board, true)) {
            return true
          }
        }
      }
    }
    
    return false
  }

  const makeComputerMove = () => {
    const moves = getAllValidMoves(board, 'black')
    if (moves.length === 0) {
      setGameStatus('checkmate')
      return
    }
    
    let bestMove = moves[0]
    let bestScore = -Infinity
    
    // Use deeper search for very hard difficulty
    for (const move of moves) {
      const newBoard = makeMove(board, move.fromRow, move.fromCol, move.toRow, move.toCol)
      const score = minimax(newBoard, 4, false, -Infinity, Infinity) // Depth 4 for very hard
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    
    movePiece(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol)
    setCurrentPlayer('white')
  }

  const handleCellClick = (row, col) => {
    // If no piece is selected and there's a piece of the current player's color at this cell
    if (!selectedPiece && board[row][col] && board[row][col].color === currentPlayer) {
      setSelectedPiece({ row, col, piece: board[row][col] })
      return
    }
    
    // If a piece is already selected
    if (selectedPiece) {
      // If clicking on same piece, deselect it
      if (row === selectedPiece.row && col === selectedPiece.col) {
        setSelectedPiece(null)
        return
      }
      
      // If clicking on another piece of the same color, select that piece instead
      if (board[row][col] && board[row][col].color === currentPlayer) {
        setSelectedPiece({ row, col, piece: board[row][col] })
        return
      }
      
      // Otherwise, try to move the selected piece
      if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
        movePiece(selectedPiece.row, selectedPiece.col, row, col)
        setSelectedPiece(null)
        
        // Switch turns
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white')
      }
    }
  }

  const isValidMove = (fromRow, fromCol, toRow, toCol, boardToCheck = board, ignoreKingSafety = false) => {
    const piece = boardToCheck[fromRow][fromCol]
    if (!piece) return false
    
    // Check if destination has a piece of the same color
    if (boardToCheck[toRow][toCol] && boardToCheck[toRow][toCol].color === piece.color) {
      return false
    }
    
    // Basic move validation for each piece type
    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1
        const startRow = piece.color === 'white' ? 6 : 1
        
        // Forward movement
        if (fromCol === toCol && !boardToCheck[toRow][toCol]) {
          if (toRow === fromRow + direction) return true
          if (fromRow === startRow && toRow === fromRow + 2 * direction) return true
        }
        
        // Captures
        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && boardToCheck[toRow][toCol]) {
          return true
        }
        
        return false
        
      case 'rook':
        if (fromRow !== toRow && fromCol !== toCol) return false
        return isPathClear(fromRow, fromCol, toRow, toCol, boardToCheck)
        
      case 'knight':
        return (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) ||
               (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2)
        
      case 'bishop':
        if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false
        return isPathClear(fromRow, fromCol, toRow, toCol, boardToCheck)
        
      case 'queen':
        const isDiagonal = Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)
        const isStraight = fromRow === toRow || fromCol === toCol
        if (!isDiagonal && !isStraight) return false
        return isPathClear(fromRow, fromCol, toRow, toCol, boardToCheck)
        
      case 'king':
        return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1
        
      default:
        return false
    }
  }

  const isPathClear = (fromRow, fromCol, toRow, toCol, boardToCheck) => {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0
    
    let row = fromRow + rowStep
    let col = fromCol + colStep
    
    while (row !== toRow || col !== toCol) {
      if (boardToCheck[row][col]) return false
      row += rowStep
      col += colStep
    }
    
    return true
  }

  const movePiece = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = [...board.map(row => [...row])]
    
    // Move the piece
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol]
    newBoard[fromRow][fromCol] = null
    
    // Pawn promotion
    if (newBoard[toRow][toCol].type === 'pawn' && (toRow === 0 || toRow === 7)) {
      newBoard[toRow][toCol] = { type: 'queen', color: newBoard[toRow][toCol].color }
    }
    
    setBoard(newBoard)
    setMoveHistory(prev => [...prev, { fromRow, fromCol, toRow, toCol }])
    
    // Check for checkmate (simplified)
    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white'
    const moves = getAllValidMoves(newBoard, nextPlayer)
    if (moves.length === 0) {
      setGameStatus('checkmate')
    }
  }

  const resetGame = () => {
    setBoard(initialBoard())
    setSelectedPiece(null)
    setCurrentPlayer('white')
    setGameStatus('')
    setShowResultModal(false)
    setGameResult(null)
    setMoveHistory([])
  }

  const selectGameMode = (mode) => {
    setGameMode(mode)
    resetGame()
  }

  if (!gameMode) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition relative overflow-hidden`}>
        <div className="animated-bg"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-4xl font-bold font-orbitron mb-8"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
                }}>
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Chess
              </span>
            </h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-6">Select Game Mode</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => selectGameMode('local')}
                  className="py-4 px-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
                >
                  Play Local (2 Players)
                </button>
                
                <button
                  onClick={() => selectGameMode('computer')}
                  className="py-4 px-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
                >
                  Play vs Computer (Grandmaster)
                </button>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Warning: The computer plays at grandmaster level with deep analysis!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition relative overflow-hidden`}>
      <div className="animated-bg"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-4xl font-bold font-orbitron mb-8"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
              }}>
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Chess
            </span>
          </h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-xl font-bold font-orbitron">
                {gameStatus === 'checkmate' 
                  ? `Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins!` 
                  : gameStatus === 'check' 
                    ? `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} is in check!` 
                    : gameMode === 'computer' && currentPlayer === 'black'
                      ? 'Computer thinking...'
                      : `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`}
              </div>
              
              <button
                onClick={resetGame}
                className="py-1 px-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
              >
                New Game
              </button>
            </div>
            
            {/* Chess Board */}
            <div className="grid grid-cols-8 gap-0 mx-auto max-w-md aspect-square mb-6 border-2 border-gray-800 rounded-lg overflow-hidden">
              {board.map((row, rowIndex) => (
                row.map((cell, colIndex) => {
                  const isLightSquare = (rowIndex + colIndex) % 2 === 0
                  const isSelected = selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex
                  
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`
                        w-full aspect-square flex items-center justify-center text-3xl cursor-pointer transition-all duration-200
                        ${isLightSquare 
                          ? (theme === 'dark' ? 'bg-amber-100' : 'bg-amber-100') 
                          : (theme === 'dark' ? 'bg-amber-800' : 'bg-amber-800')
                        }
                        ${isSelected ? 'ring-4 ring-inset ring-yellow-400 bg-yellow-200' : ''}
                        hover:brightness-110
                      `}
                    >
                      {getPieceSymbol(cell)}
                    </div>
                  )
                })
              ))}
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setGameMode(null)}
                className="py-2 px-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/25"
              >
                Change Mode
              </button>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Click on a piece to select it, then click on a destination square to move it.
              </p>
            </div>
          </div>
        </div>
      </div>

      <GameResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={gameResult?.result}
        message={gameResult?.message}
        onRestart={resetGame}
        showScore={false}
      />
    </div>
  )
}

export default ChessPage