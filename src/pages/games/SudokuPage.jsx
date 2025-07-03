import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import GameResultModal from '../../components/common/GameResultModal'

const SudokuPage = () => {
  const { theme } = useTheme()
  const [board, setBoard] = useState([])
  const [solution, setSolution] = useState([])
  const [selectedCell, setSelectedCell] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [difficulty, setDifficulty] = useState('medium')
  const [gameStarted, setGameStarted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [hints, setHints] = useState(3)
  const [mistakes, setMistakes] = useState(0)
  const [notes, setNotes] = useState({})
  const [noteMode, setNoteMode] = useState(false)

  const generateSudoku = useCallback(() => {
    const grid = Array(9).fill().map(() => Array(9).fill(0))
    
    fillDiagonalBoxes(grid)
    solveSudoku(grid)
    
    const fullSolution = grid.map(row => [...row])
    
    let cellsToRemove
    switch (difficulty) {
      case 'easy':
        cellsToRemove = 35
        break
      case 'hard':
        cellsToRemove = 55
        break
      case 'medium':
      default:
        cellsToRemove = 45
        break
    }
    
    let count = 0
    while (count < cellsToRemove) {
      const row = Math.floor(Math.random() * 9)
      const col = Math.floor(Math.random() * 9)
      
      if (grid[row][col] !== 0) {
        grid[row][col] = 0
        count++
      }
    }
    
    const initialCells = []
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] !== 0) {
          initialCells.push(`${i}-${j}`)
        }
      }
    }
    
    setBoard(grid)
    setSolution(fullSolution)
    
    return initialCells
  }, [difficulty])

  const fillDiagonalBoxes = (grid) => {
    for (let box = 0; box < 9; box += 3) {
      fillBox(grid, box, box)
    }
  }

  const fillBox = (grid, row, col) => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    shuffle(nums)
    
    let index = 0
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        grid[row + i][col + j] = nums[index++]
      }
    }
  }

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  const isSafe = (grid, row, col, num) => {
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false
    }
    
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false
    }
    
    const startRow = row - (row % 3)
    const startCol = col - (col % 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false
      }
    }
    
    return true
  }

  const solveSudoku = (grid) => {
    let row = -1
    let col = -1
    let isEmpty = true
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === 0) {
          row = i
          col = j
          isEmpty = false
          break
        }
      }
      if (!isEmpty) break
    }
    
    if (isEmpty) return true
    
    for (let num = 1; num <= 9; num++) {
      if (isSafe(grid, row, col, num)) {
        grid[row][col] = num
        
        if (solveSudoku(grid)) return true
        
        grid[row][col] = 0
      }
    }
    
    return false
  }

  const [initialCells, setInitialCells] = useState([])

  useEffect(() => {
    document.title = 'Sudoku - Online Game Hub'
  }, [])

  useEffect(() => {
    if (gameStarted) {
      const cells = generateSudoku()
      setInitialCells(cells)
      setIsComplete(false)
      setIsValid(true)
      setSelectedCell(null)
      setTimer(0)
      setIsTimerRunning(true)
      setHints(3)
      setMistakes(0)
      setNotes({})
      setNoteMode(false)
    }
  }, [gameStarted, generateSudoku])

  useEffect(() => {
    let interval
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prevTime => prevTime + 1)
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [isTimerRunning])

  useEffect(() => {
    if (isComplete && isValid) {
      setShowResultModal(true)
      setIsTimerRunning(false)
    }
  }, [isComplete, isValid])

  const handleCellClick = (row, col) => {
    if (!initialCells.includes(`${row}-${col}`)) {
      setSelectedCell({ row, col })
    }
  }

  const handleNumberInput = (num) => {
    if (!selectedCell || initialCells.includes(`${selectedCell.row}-${selectedCell.col}`)) return
    
    const { row, col } = selectedCell
    const cellKey = `${row}-${col}`
    
    if (noteMode) {
      const newNotes = { ...notes }
      if (!newNotes[cellKey]) newNotes[cellKey] = []
      
      if (newNotes[cellKey].includes(num)) {
        newNotes[cellKey] = newNotes[cellKey].filter(n => n !== num)
      } else {
        newNotes[cellKey] = [...newNotes[cellKey], num].sort()
      }
      
      if (newNotes[cellKey].length === 0) {
        delete newNotes[cellKey]
      }
      
      setNotes(newNotes)
      return
    }
    
    const newBoard = [...board]
    newBoard[row][col] = num
    setBoard(newBoard)
    
    // Clear notes for this cell
    const newNotes = { ...notes }
    delete newNotes[cellKey]
    setNotes(newNotes)
    
    // Check if move is correct
    if (num !== 0 && num !== solution[row][col]) {
      setMistakes(prev => prev + 1)
    }
    
    let complete = true
    let valid = true
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (newBoard[i][j] === 0) {
          complete = false
        } else if (newBoard[i][j] !== solution[i][j]) {
          valid = false
        }
      }
    }
    
    setIsComplete(complete)
    setIsValid(valid)
  }

  const useHint = () => {
    if (hints <= 0 || !selectedCell) return
    
    const { row, col } = selectedCell
    if (initialCells.includes(`${row}-${col}`) || board[row][col] !== 0) return
    
    handleNumberInput(solution[row][col])
    setHints(prev => prev - 1)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startGame = () => {
    setGameStarted(true)
  }

  const restartGame = () => {
    setGameStarted(false)
    setTimeout(() => {
      setGameStarted(true)
    }, 10)
  }

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'from-green-500 to-emerald-500'
      case 'hard': return 'from-red-500 to-pink-500'
      default: return 'from-blue-500 to-cyan-500'
    }
  }

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
        <div className="animated-bg"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md mx-auto text-center"
          >
            <h1 className="text-4xl font-bold font-orbitron mb-8"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
                }}>
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Sudoku
              </span>
            </h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-6">Select Difficulty</h2>
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                {['easy', 'medium', 'hard'].map((level) => (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDifficulty(level)}
                    className={`py-4 px-6 font-medium rounded-lg transition-all duration-300 ${
                      difficulty === level
                        ? `bg-gradient-to-r ${getDifficultyColor()} text-white shadow-lg`
                        : `${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                    <div className="text-sm opacity-75 mt-1">
                      {level === 'easy' && '35 empty cells'}
                      {level === 'medium' && '45 empty cells'}
                      {level === 'hard' && '55 empty cells'}
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className={`w-full py-3 px-4 bg-gradient-to-r ${getDifficultyColor()} text-white font-bold font-orbitron rounded-xl transition-all duration-300 hover:shadow-lg`}
              >
                Start Game
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
      <div className="animated-bg"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-4xl font-bold font-orbitron mb-8 text-center"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
              }}>
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Sudoku
            </span>
          </h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-6 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Game Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                <div className="text-sm opacity-75">Time</div>
                <div className="font-bold font-orbitron">{formatTime(timer)}</div>
              </div>
              <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                <div className="text-sm opacity-75">Difficulty</div>
                <div className="font-bold capitalize">{difficulty}</div>
              </div>
              <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                <div className="text-sm opacity-75">Hints</div>
                <div className="font-bold text-blue-500">{hints}</div>
              </div>
              <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                <div className="text-sm opacity-75">Mistakes</div>
                <div className="font-bold text-red-500">{mistakes}</div>
              </div>
            </div>
            
            {/* Sudoku Board */}
            <div className="mb-6 flex justify-center">
              <div className={`grid grid-cols-9 gap-0 border-4 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-800'} rounded-xl overflow-hidden`} style={{ width: 'min(100%, 450px)', aspectRatio: '1' }}>
                {board.length > 0 && board.map((row, rowIndex) => (
                  row.map((cell, colIndex) => {
                    const cellKey = `${rowIndex}-${colIndex}`
                    const isSelected = selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex
                    const isInitial = initialCells.includes(cellKey)
                    const isWrong = cell !== 0 && cell !== solution[rowIndex][colIndex]
                    const cellNotes = notes[cellKey] || []
                    
                    return (
                      <motion.div
                        key={cellKey}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`
                          aspect-square flex items-center justify-center text-lg sm:text-xl font-bold cursor-pointer
                          border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}
                          ${(rowIndex + 1) % 3 === 0 && rowIndex < 8 ? `border-b-2 ${theme === 'dark' ? 'border-b-gray-600' : 'border-b-gray-800'}` : ''}
                          ${(colIndex + 1) % 3 === 0 && colIndex < 8 ? `border-r-2 ${theme === 'dark' ? 'border-r-gray-600' : 'border-r-gray-800'}` : ''}
                          ${isSelected 
                            ? 'bg-blue-200 dark:bg-blue-800 ring-2 ring-blue-500' 
                            : isInitial
                              ? (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')
                              : (theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50')
                          }
                          ${isWrong ? 'text-red-500 bg-red-100 dark:bg-red-900' : ''}
                          transition-all duration-200
                        `}
                      >
                        {cell !== 0 ? (
                          <span className={isInitial ? 'text-gray-900 dark:text-white' : 'text-blue-600 dark:text-blue-400'}>
                            {cell}
                          </span>
                        ) : cellNotes.length > 0 ? (
                          <div className="grid grid-cols-3 gap-0 w-full h-full text-xs">
                            {[1,2,3,4,5,6,7,8,9].map(num => (
                              <div key={num} className="flex items-center justify-center">
                                {cellNotes.includes(num) ? (
                                  <span className="text-gray-500 dark:text-gray-400">{num}</span>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </motion.div>
                    )
                  })
                ))}
              </div>
            </div>
            
            {/* Controls */}
            <div className="space-y-4">
              {/* Number Input */}
              <div className="grid grid-cols-9 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleNumberInput(num)}
                    className={`aspect-square ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-bold rounded-lg transition-all duration-200 text-lg`}
                    disabled={!selectedCell || initialCells.includes(`${selectedCell.row}-${selectedCell.col}`)}
                  >
                    {num}
                  </motion.button>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNumberInput(0)}
                  className={`py-2 px-3 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-medium rounded-lg transition-all duration-200`}
                  disabled={!selectedCell || initialCells.includes(`${selectedCell.row}-${selectedCell.col}`)}
                >
                  Clear
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNoteMode(!noteMode)}
                  className={`py-2 px-3 ${noteMode ? 'bg-blue-600 text-white' : `${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`} font-medium rounded-lg transition-all duration-200`}
                >
                  Notes
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={useHint}
                  className={`py-2 px-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-lg transition-all duration-200 ${hints <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={hints <= 0 || !selectedCell}
                >
                  Hint ({hints})
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={restartGame}
                  className="py-2 px-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg transition-all duration-200"
                >
                  New Game
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <GameResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result="win"
        message={`Congratulations! You solved the ${difficulty} puzzle in ${formatTime(timer)}!`}
        onRestart={restartGame}
        showScore={false}
      />
    </div>
  )
}

export default SudokuPage