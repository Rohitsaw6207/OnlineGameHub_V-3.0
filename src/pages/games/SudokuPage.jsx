import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../../context/ThemeContext'

const SudokuPage = () => {
  const { theme } = useTheme()
  const [board, setBoard] = useState([])
  const [solution, setSolution] = useState([])
  const [selectedCell, setSelectedCell] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [difficulty, setDifficulty] = useState('medium') // easy, medium, hard
  const [gameStarted, setGameStarted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const generateSudoku = useCallback(() => {
    // Create an empty 9x9 grid
    const grid = Array(9).fill().map(() => Array(9).fill(0))
    
    // Fill the diagonal boxes first (these are independent)
    fillDiagonalBoxes(grid)
    
    // Fill the rest of the grid
    solveSudoku(grid)
    
    // Save the solution
    const fullSolution = grid.map(row => [...row])
    
    // Remove numbers based on difficulty
    let cellsToRemove
    switch (difficulty) {
      case 'easy':
        cellsToRemove = 30 // Keep 51 numbers, remove 30
        break
      case 'hard':
        cellsToRemove = 60 // Keep 21 numbers, remove 60
        break
      case 'medium':
      default:
        cellsToRemove = 45 // Keep 36 numbers, remove 45
        break
    }
    
    // Remove numbers
    let count = 0
    while (count < cellsToRemove) {
      const row = Math.floor(Math.random() * 9)
      const col = Math.floor(Math.random() * 9)
      
      if (grid[row][col] !== 0) {
        grid[row][col] = 0
        count++
      }
    }
    
    // Mark initial cells
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

  // Fill the 3 diagonal 3x3 boxes (which are independent)
  const fillDiagonalBoxes = (grid) => {
    for (let box = 0; box < 9; box += 3) {
      fillBox(grid, box, box)
    }
  }

  // Fill a 3x3 box starting at (row, col)
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

  // Shuffle array
  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  // Check if it's safe to place num at (row, col)
  const isSafe = (grid, row, col, num) => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false
    }
    
    // Check 3x3 box
    const startRow = row - (row % 3)
    const startCol = col - (col % 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false
      }
    }
    
    return true
  }

  // Solve the Sudoku using backtracking
  const solveSudoku = (grid) => {
    let row = -1
    let col = -1
    let isEmpty = true
    
    // Find an empty cell
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
    
    // No empty cell found, we're done
    if (isEmpty) return true
    
    // Try placing numbers 1-9
    for (let num = 1; num <= 9; num++) {
      if (isSafe(grid, row, col, num)) {
        grid[row][col] = num
        
        if (solveSudoku(grid)) return true
        
        // If placing num doesn't lead to a solution, backtrack
        grid[row][col] = 0
      }
    }
    
    return false
  }

  // Initial game state
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
    }
  }, [gameStarted, generateSudoku])

  // Timer effect
  useEffect(() => {
    let interval
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prevTime => prevTime + 1)
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const handleCellClick = (row, col) => {
    // Can't select initial cells
    if (!initialCells.includes(`${row}-${col}`)) {
      setSelectedCell({ row, col })
    }
  }

  const handleNumberInput = (num) => {
    if (!selectedCell || initialCells.includes(`${selectedCell.row}-${selectedCell.col}`)) return
    
    const { row, col } = selectedCell
    const newBoard = [...board]
    newBoard[row][col] = num
    setBoard(newBoard)
    
    // Check if the board is complete and valid
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
    
    if (complete && valid) {
      setIsTimerRunning(false)
    }
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

  if (!gameStarted) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-8">Sudoku</h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className="text-xl font-semibold mb-6">Select Difficulty</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setDifficulty('easy')}
                  className={`py-2 px-4 font-medium rounded-lg transition-colors ${
                    difficulty === 'easy'
                      ? 'bg-primary-600 text-white'
                      : `${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-gray-300`
                  }`}
                >
                  Easy
                </button>
                
                <button
                  onClick={() => setDifficulty('medium')}
                  className={`py-2 px-4 font-medium rounded-lg transition-colors ${
                    difficulty === 'medium'
                      ? 'bg-primary-600 text-white'
                      : `${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-gray-300`
                  }`}
                >
                  Medium
                </button>
                
                <button
                  onClick={() => setDifficulty('hard')}
                  className={`py-2 px-4 font-medium rounded-lg transition-colors ${
                    difficulty === 'hard'
                      ? 'bg-primary-600 text-white'
                      : `${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-gray-300`
                  }`}
                >
                  Hard
                </button>
              </div>
              
              <button
                onClick={startGame}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Sudoku</h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-bold">
                Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </div>
              <div className="text-lg font-bold">
                Time: {formatTime(timer)}
              </div>
            </div>
            
            {/* Sudoku Board */}
            <div className={`grid grid-cols-9 gap-0 mb-6 mx-auto max-w-md border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-800'}`}>
              {board.length > 0 && board.map((row, rowIndex) => (
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`
                      w-full aspect-square flex items-center justify-center text-lg sm:text-xl font-semibold
                      border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}
                      ${(rowIndex + 1) % 3 === 0 && rowIndex < 8 ? `border-b-2 ${theme === 'dark' ? 'border-b-gray-600' : 'border-b-gray-800'}` : ''}
                      ${(colIndex + 1) % 3 === 0 && colIndex < 8 ? `border-r-2 ${theme === 'dark' ? 'border-r-gray-600' : 'border-r-gray-800'}` : ''}
                      ${selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex 
                        ? 'bg-primary-100 dark:bg-primary-900' 
                        : initialCells.includes(`${rowIndex}-${colIndex}`)
                          ? (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')
                          : ''
                      }
                      ${!isValid && cell !== 0 && cell !== solution[rowIndex][colIndex] ? 'text-red-600' : ''}
                      transition-colors cursor-pointer
                    `}
                  >
                    {cell !== 0 ? cell : ''}
                  </div>
                ))
              ))}
            </div>
            
            {/* Number Input Pad */}
            <div className="grid grid-cols-9 gap-2 mb-6 max-w-md mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  className={`py-2 px-0 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-bold rounded transition-colors`}
                  disabled={!selectedCell || initialCells.includes(`${selectedCell.row}-${selectedCell.col}`)}
                >
                  {num}
                </button>
              ))}
            </div>
            
            {/* Clear button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={() => handleNumberInput(0)}
                className={`py-2 px-4 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-medium rounded-lg transition-colors mr-4`}
                disabled={!selectedCell || initialCells.includes(`${selectedCell.row}-${selectedCell.col}`)}
              >
                Clear Cell
              </button>
              
              <button
                onClick={restartGame}
                className="py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                New Game
              </button>
            </div>
            
            {/* Game completed message */}
            {isComplete && isValid && (
              <div className="mt-4 p-4 bg-success-100 text-success-800 rounded-lg">
                Congratulations! You've solved the puzzle in {formatTime(timer)}!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SudokuPage