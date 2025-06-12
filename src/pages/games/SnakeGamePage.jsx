import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '../../context/ThemeContext'

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150
const SPEED_INCREMENT = 5
const MAX_SPEED = 50

const Direction = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
}

const SnakeGamePage = () => {
  const { theme } = useTheme()
  const canvasRef = useRef(null)
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ])
  const [food, setFood] = useState({ x: 15, y: 15 })
  const [direction, setDirection] = useState(Direction.RIGHT)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [isPaused, setIsPaused] = useState(false)

  const directionRef = useRef(direction)
  const gameOverRef = useRef(gameOver)
  const isPausedRef = useRef(isPaused)

  useEffect(() => {
    document.title = 'Snake Game - Online Game Hub'
    
    // Start the game
    resetGame()
    
    // Attach event listeners
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    directionRef.current = direction
    gameOverRef.current = gameOver
    isPausedRef.current = isPaused
  }, [direction, gameOver, isPaused])

  const placeFood = useCallback(() => {
    // Generate random food position
    let newFood
    
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
      // Make sure food doesn't spawn on snake
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    
    setFood(newFood)
  }, [snake])

  const checkCollision = useCallback((head) => {
    // Check if snake hits the wall
    if (
      head.x < 0 || 
      head.x >= GRID_SIZE || 
      head.y < 0 || 
      head.y >= GRID_SIZE
    ) {
      return true
    }
    
    // Check if snake hits itself
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        return true
      }
    }
    
    return false
  }, [snake])

  const moveSnake = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current) return
    
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] }
      
      switch (directionRef.current) {
        case Direction.UP:
          head.y -= 1
          break
        case Direction.DOWN:
          head.y += 1
          break
        case Direction.LEFT:
          head.x -= 1
          break
        case Direction.RIGHT:
          head.x += 1
          break
        default:
          break
      }
      
      // Check for collisions
      if (checkCollision(head)) {
        setGameOver(true)
        return prevSnake
      }
      
      // Create new snake
      const newSnake = [head, ...prevSnake]
      
      // Check if snake ate food
      if (head.x === food.x && head.y === food.y) {
        // Grow snake (don't remove tail)
        setScore(prevScore => {
          const newScore = prevScore + 1
          
          // Speed up the game as score increases
          if (speed > MAX_SPEED && newScore % 5 === 0) {
            setSpeed(prevSpeed => Math.max(prevSpeed - SPEED_INCREMENT, MAX_SPEED))
          }
          
          return newScore
        })
        
        placeFood()
      } else {
        // Remove tail
        newSnake.pop()
      }
      
      return newSnake
    })
  }, [checkCollision, food, placeFood, speed])

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 
        ? (theme === 'dark' ? '#3B82F6' : '#2563EB') // Head color
        : (theme === 'dark' ? '#60A5FA' : '#3B82F6') // Body color
      ctx.fillRect(
        segment.x * CELL_SIZE, 
        segment.y * CELL_SIZE, 
        CELL_SIZE, 
        CELL_SIZE
      )
      
      // Draw a border around each segment
      ctx.strokeStyle = theme === 'dark' ? '#1E3A8A' : '#1D4ED8'
      ctx.strokeRect(
        segment.x * CELL_SIZE, 
        segment.y * CELL_SIZE, 
        CELL_SIZE, 
        CELL_SIZE
      )
    })
    
    // Draw food
    ctx.fillStyle = '#EF4444' // Red food
    ctx.beginPath()
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2, 
      food.y * CELL_SIZE + CELL_SIZE / 2, 
      CELL_SIZE / 2, 
      0, 
      Math.PI * 2
    )
    ctx.fill()
    
    // Draw grid (optional)
    if (theme === 'dark') {
      ctx.strokeStyle = '#334155'
    } else {
      ctx.strokeStyle = '#E2E8F0'
    }
    
    ctx.lineWidth = 0.5
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
      ctx.stroke()
      
      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }
  }, [snake, food, theme])

  useEffect(() => {
    drawGame()
  }, [snake, food, drawGame])

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, speed)
    return () => clearInterval(gameLoop)
  }, [moveSnake, speed])

  const handleKeyDown = useCallback((e) => {
    // Change direction on arrow keys
    switch (e.key) {
      case 'ArrowUp':
        if (directionRef.current !== Direction.DOWN) {
          setDirection(Direction.UP)
        }
        break
      case 'ArrowDown':
        if (directionRef.current !== Direction.UP) {
          setDirection(Direction.DOWN)
        }
        break
      case 'ArrowLeft':
        if (directionRef.current !== Direction.RIGHT) {
          setDirection(Direction.LEFT)
        }
        break
      case 'ArrowRight':
        if (directionRef.current !== Direction.LEFT) {
          setDirection(Direction.RIGHT)
        }
        break
      case ' ': // Spacebar to pause/resume
        setIsPaused(prev => !prev)
        break
      case 'r': // 'r' key to restart
        if (gameOverRef.current) {
          resetGame()
        }
        break
      default:
        break
    }
  }, [])

  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ])
    setDirection(Direction.RIGHT)
    setGameOver(false)
    setScore(0)
    setSpeed(INITIAL_SPEED)
    setIsPaused(false)
    placeFood()
  }

  const togglePause = () => {
    setIsPaused(prev => !prev)
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Snake Game</h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-xl font-bold">Score: {score}</div>
              <div className="flex gap-2">
                <button
                  onClick={togglePause}
                  className="py-1 px-3 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-lg transition-colors"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                
                {gameOver && (
                  <button
                    onClick={resetGame}
                    className="py-1 px-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Restart
                  </button>
                )}
              </div>
            </div>
            
            <div className="relative overflow-hidden">
              <canvas
                ref={canvasRef}
                width={GRID_SIZE * CELL_SIZE}
                height={GRID_SIZE * CELL_SIZE}
                className={`border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} mx-auto`}
              />
              
              {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white">
                  <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
                  <p className="text-xl mb-6">Final Score: {score}</p>
                  <button
                    onClick={resetGame}
                    className="py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              )}
              
              {isPaused && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                  <h2 className="text-3xl font-bold">Paused</h2>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Use arrow keys to move the snake. Spacebar to pause/resume. 'R' to restart.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SnakeGamePage