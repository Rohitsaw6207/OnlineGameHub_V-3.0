import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'
import GameResultModal from '../../components/common/GameResultModal'

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 200
const SPEED_INCREMENT = 10
const MAX_SPEED = 80

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
  const [gameStarted, setGameStarted] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore')
    return saved ? parseInt(saved, 10) : 0
  })

  const directionRef = useRef(direction)
  const gameOverRef = useRef(gameOver)
  const isPausedRef = useRef(isPaused)

  useEffect(() => {
    document.title = 'Snake Game - Online Game Hub'
  }, [])

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('snakeHighScore', score.toString())
    }
  }, [score, highScore])

  useEffect(() => {
    directionRef.current = direction
    gameOverRef.current = gameOver
    isPausedRef.current = isPaused
  }, [direction, gameOver, isPaused])

  useEffect(() => {
    if (gameOver) {
      setShowResultModal(true)
    }
  }, [gameOver])

  const placeFood = useCallback(() => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    
    setFood(newFood)
  }, [snake])

  const checkCollision = useCallback((head) => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true
    }
    
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        return true
      }
    }
    
    return false
  }, [snake])

  const moveSnake = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current || !gameStarted) return
    
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
      
      if (checkCollision(head)) {
        setGameOver(true)
        return prevSnake
      }
      
      const newSnake = [head, ...prevSnake]
      
      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => {
          const newScore = prevScore + 10
          if (speed > MAX_SPEED && newScore % 50 === 0) {
            setSpeed(prevSpeed => Math.max(prevSpeed - SPEED_INCREMENT, MAX_SPEED))
          }
          return newScore
        })
        placeFood()
      } else {
        newSnake.pop()
      }
      
      return newSnake
    })
  }, [checkCollision, food, placeFood, speed, gameStarted])

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw background
    ctx.fillStyle = theme === 'dark' ? '#1e293b' : '#f8fafc'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw grid
    ctx.strokeStyle = theme === 'dark' ? '#334155' : '#e2e8f0'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
      const gradient = ctx.createLinearGradient(
        segment.x * CELL_SIZE, 
        segment.y * CELL_SIZE,
        (segment.x + 1) * CELL_SIZE, 
        (segment.y + 1) * CELL_SIZE
      )
      
      if (index === 0) {
        gradient.addColorStop(0, '#10b981')
        gradient.addColorStop(1, '#059669')
      } else {
        gradient.addColorStop(0, '#34d399')
        gradient.addColorStop(1, '#10b981')
      }
      
      ctx.fillStyle = gradient
      ctx.fillRect(
        segment.x * CELL_SIZE + 1, 
        segment.y * CELL_SIZE + 1, 
        CELL_SIZE - 2, 
        CELL_SIZE - 2
      )
      
      // Add eyes to head
      if (index === 0) {
        ctx.fillStyle = '#ffffff'
        const eyeSize = 3
        ctx.fillRect(
          segment.x * CELL_SIZE + 5, 
          segment.y * CELL_SIZE + 5, 
          eyeSize, eyeSize
        )
        ctx.fillRect(
          segment.x * CELL_SIZE + 12, 
          segment.y * CELL_SIZE + 5, 
          eyeSize, eyeSize
        )
      }
    })
    
    // Draw food with glow effect
    const foodGradient = ctx.createRadialGradient(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      0,
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2
    )
    foodGradient.addColorStop(0, '#ef4444')
    foodGradient.addColorStop(1, '#dc2626')
    
    ctx.fillStyle = foodGradient
    ctx.beginPath()
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2, 
      food.y * CELL_SIZE + CELL_SIZE / 2, 
      CELL_SIZE / 2 - 1, 
      0, 
      Math.PI * 2
    )
    ctx.fill()
  }, [snake, food, theme])

  useEffect(() => {
    if (gameStarted) {
      drawGame()
    }
  }, [snake, food, drawGame, gameStarted])

  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      const gameLoop = setInterval(moveSnake, speed)
      return () => clearInterval(gameLoop)
    }
  }, [moveSnake, speed, gameStarted, gameOver, isPaused])

  const handleKeyDown = useCallback((e) => {
    if (!gameStarted) return
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (directionRef.current !== Direction.DOWN) {
          setDirection(Direction.UP)
        }
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        if (directionRef.current !== Direction.UP) {
          setDirection(Direction.DOWN)
        }
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (directionRef.current !== Direction.RIGHT) {
          setDirection(Direction.LEFT)
        }
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (directionRef.current !== Direction.LEFT) {
          setDirection(Direction.RIGHT)
        }
        break
      case ' ':
        setIsPaused(prev => !prev)
        break
      default:
        break
    }
  }, [gameStarted])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const startGame = () => {
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
    setGameStarted(true)
    setShowResultModal(false)
    placeFood()
  }

  const resetGame = () => {
    startGame()
  }

  const togglePause = () => {
    setIsPaused(prev => !prev)
  }

  // Touch controls for mobile
  const handleTouchStart = (e) => {
    e.preventDefault()
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
      <div className="animated-bg"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold font-orbitron mb-8"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
              }}>
            <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              Snake Game
            </span>
          </h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-6 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            {!gameStarted ? (
              <div className="text-center">
                <div className="mb-6">
                  <p className="text-lg mb-4">
                    Control the snake to eat food and grow longer!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Use arrow keys or WASD to move. Spacebar to pause.
                  </p>
                  <p className="text-lg font-semibold">High Score: {highScore}</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="py-3 px-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold font-orbitron rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                >
                  Start Game
                </motion.button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                  <div className="text-xl font-bold font-orbitron">Score: {score}</div>
                  <div className="text-lg">High Score: {highScore}</div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={togglePause}
                      className="py-2 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-lg transition-all duration-300"
                    >
                      {isPaused ? 'Resume' : 'Pause'}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetGame}
                      className="py-2 px-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-lg transition-all duration-300"
                    >
                      Restart
                    </motion.button>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-xl border-2 border-gray-300 dark:border-gray-600 mx-auto" style={{ width: 'fit-content' }}>
                  <canvas
                    ref={canvasRef}
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                    className="block"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                  />
                  
                  {isPaused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <h2 className="text-3xl font-bold text-white font-orbitron">Paused</h2>
                    </div>
                  )}
                </div>
                
                {/* Mobile Controls */}
                <div className="mt-6 grid grid-cols-3 gap-2 max-w-xs mx-auto md:hidden">
                  <div></div>
                  <button
                    onTouchStart={() => setDirection(Direction.UP)}
                    className="py-3 px-4 bg-gray-600 text-white rounded-lg font-bold"
                  >
                    ↑
                  </button>
                  <div></div>
                  
                  <button
                    onTouchStart={() => setDirection(Direction.LEFT)}
                    className="py-3 px-4 bg-gray-600 text-white rounded-lg font-bold"
                  >
                    ←
                  </button>
                  <button
                    onTouchStart={togglePause}
                    className="py-3 px-4 bg-yellow-600 text-white rounded-lg font-bold text-sm"
                  >
                    ⏸
                  </button>
                  <button
                    onTouchStart={() => setDirection(Direction.RIGHT)}
                    className="py-3 px-4 bg-gray-600 text-white rounded-lg font-bold"
                  >
                    →
                  </button>
                  
                  <div></div>
                  <button
                    onTouchStart={() => setDirection(Direction.DOWN)}
                    className="py-3 px-4 bg-gray-600 text-white rounded-lg font-bold"
                  >
                    ↓
                  </button>
                  <div></div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Use arrow keys or WASD to move. Spacebar to pause.
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      <GameResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result="lose"
        score={score}
        message={`Game Over! You scored ${score} points.`}
        onRestart={resetGame}
      />
    </div>
  )
}

export default SnakeGamePage