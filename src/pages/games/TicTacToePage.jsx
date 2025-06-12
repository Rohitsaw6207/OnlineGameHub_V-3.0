import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import GameResultModal from '../../components/common/GameResultModal'

const TicTacToePage = () => {
  const { theme } = useTheme()
  const [gameMode, setGameMode] = useState(null) // 'local' or 'computer'
  const [board, setBoard] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [winner, setWinner] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [gameResult, setGameResult] = useState(null)

  useEffect(() => {
    document.title = 'Tic Tac Toe - Online Game Hub'
  }, [])

  useEffect(() => {
    // Computer's turn (extremely hard AI using perfect minimax)
    if (gameMode === 'computer' && !xIsNext && !winner && !gameOver) {
      const timer = setTimeout(() => {
        makeComputerMove()
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [gameMode, xIsNext, winner, gameOver])

  useEffect(() => {
    if (winner || gameOver) {
      let result = 'draw'
      let message = "It's a draw!"
      
      if (winner === 'X') {
        result = 'win'
        message = gameMode === 'computer' ? 'You won! (Incredible!)' : 'Player X wins!'
      } else if (winner === 'O') {
        result = gameMode === 'computer' ? 'lose' : 'win'
        message = gameMode === 'computer' ? 'Computer wins!' : 'Player O wins!'
      }
      
      setGameResult({ result, message })
      setShowResultModal(true)
    }
  }, [winner, gameOver, gameMode])

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    
    return null
  }

  // Perfect minimax algorithm - computer will never lose
  const minimax = (squares, depth, isMaximizing, alpha = -Infinity, beta = Infinity) => {
    const winner = checkWinner(squares)
    
    // Terminal states
    if (winner === 'O') return 10 - depth // Computer wins (better if sooner)
    if (winner === 'X') return depth - 10 // Human wins (worse if sooner)
    if (squares.every(square => square !== null)) return 0 // Draw
    
    if (isMaximizing) {
      let bestScore = -Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O'
          const score = minimax(squares, depth + 1, false, alpha, beta)
          squares[i] = null
          bestScore = Math.max(score, bestScore)
          alpha = Math.max(alpha, score)
          if (beta <= alpha) break // Alpha-beta pruning
        }
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X'
          const score = minimax(squares, depth + 1, true, alpha, beta)
          squares[i] = null
          bestScore = Math.min(score, bestScore)
          beta = Math.min(beta, score)
          if (beta <= alpha) break // Alpha-beta pruning
        }
      }
      return bestScore
    }
  }

  const handleClick = (i) => {
    if (board[i] || winner || gameOver) return
    
    const newBoard = [...board]
    newBoard[i] = xIsNext ? 'X' : 'O'
    setBoard(newBoard)
    
    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      return
    }
    
    // Check for draw
    if (newBoard.every(square => square !== null)) {
      setGameOver(true)
      return
    }
    
    setXIsNext(!xIsNext)
  }

  const makeComputerMove = () => {
    const newBoard = [...board]
    let bestScore = -Infinity
    let bestMove = 0
    
    // Use perfect minimax algorithm - computer will play optimally
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === null) {
        newBoard[i] = 'O'
        const score = minimax(newBoard, 0, false)
        newBoard[i] = null
        
        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }
    
    newBoard[bestMove] = 'O'
    setBoard(newBoard)
    
    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      return
    }
    
    // Check for draw
    if (newBoard.every(square => square !== null)) {
      setGameOver(true)
      return
    }
    
    setXIsNext(true)
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setXIsNext(true)
    setWinner(null)
    setGameOver(false)
    setShowResultModal(false)
    setGameResult(null)
  }

  const selectGameMode = (mode) => {
    setGameMode(mode)
    resetGame()
  }

  const renderSquare = (i) => {
    const winningClass = winner && board[i] === winner ? 'bg-success-200 dark:bg-success-800' : ''
    
    return (
      <button
        className={`w-full h-full aspect-square flex items-center justify-center text-4xl md:text-6xl font-bold ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${winningClass} transition-colors rounded-lg border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} disabled:cursor-not-allowed`}
        onClick={() => handleClick(i)}
        disabled={!!board[i] || !!winner || gameOver || (gameMode === 'computer' && !xIsNext)}
      >
        <span className={board[i] === 'X' ? 'text-blue-500' : 'text-red-500'}>
          {board[i]}
        </span>
      </button>
    )
  }

  const getStatusMessage = () => {
    if (winner) {
      return `Winner: ${winner}`
    } else if (gameOver) {
      return 'Game ended in a draw'
    } else {
      if (gameMode === 'computer') {
        return xIsNext ? 'Your turn (X)' : 'Computer thinking...'
      }
      return `Next player: ${xIsNext ? 'X' : 'O'}`
    }
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
                Tic Tac Toe
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
                  Play vs Computer (Impossible)
                </button>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Warning: The computer uses perfect strategy and will never lose!
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
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold font-orbitron mb-8"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
              }}>
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Tic Tac Toe
            </span>
          </h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="mb-4">
              <div className="text-xl font-bold mb-2 font-orbitron">
                {getStatusMessage()}
              </div>
              
              <div className="grid grid-cols-3 gap-2 aspect-square mb-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="aspect-square">
                    {renderSquare(i)}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetGame}
                  className="py-2 px-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                >
                  Play Again
                </button>
                
                <button
                  onClick={() => setGameMode(null)}
                  className="py-2 px-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/25"
                >
                  Change Mode
                </button>
              </div>
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

export default TicTacToePage