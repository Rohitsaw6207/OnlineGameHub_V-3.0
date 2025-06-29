import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'
import GameResultModal from '../../components/common/GameResultModal'

const BreakoutPage = () => {
  const { theme } = useTheme()
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [gamePaused, setGamePaused] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('breakoutHighScore')
    return saved ? parseInt(saved, 10) : 0
  })

  useEffect(() => {
    document.title = 'Breakout - Online Game Hub'
  }, [])

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('breakoutHighScore', score.toString())
    }
  }, [score, highScore])

  useEffect(() => {
    if (gameOver || gameWon) {
      setShowResultModal(true)
    }
  }, [gameOver, gameWon])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !gameStarted || gameOver || gamePaused) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // Game objects
    const ballRadius = 10
    const paddleHeight = 15
    const paddleWidth = 100
    const brickRowCount = 6
    const brickColumnCount = 10
    const brickWidth = 70
    const brickHeight = 25
    const brickPadding = 5
    const brickOffsetTop = 60
    const brickOffsetLeft = 35
    
    let ballX = width / 2
    let ballY = height - 50
    let ballSpeedX = 5 + level * 0.5
    let ballSpeedY = -5 - level * 0.5
    let paddleX = (width - paddleWidth) / 2
    
    // Create bricks with different colors
    const bricks = []
    const brickColors = [
      '#ef4444', '#f97316', '#eab308', 
      '#22c55e', '#3b82f6', '#8b5cf6'
    ]
    
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = []
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { 
          x: 0, 
          y: 0, 
          status: 1,
          color: brickColors[r],
          points: (brickRowCount - r) * 10
        }
      }
    }
    
    // Paddle movement
    let rightPressed = false
    let leftPressed = false
    
    const handleKeyDown = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        rightPressed = true
      } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        leftPressed = true
      } else if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
        setGamePaused(prev => !prev)
      }
    }
    
    const handleKeyUp = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        rightPressed = false
      } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        leftPressed = false
      }
    }
    
    // Mouse movement for the paddle
    const handleMouseMove = (e) => {
      const relativeX = e.clientX - canvas.getBoundingClientRect().left
      if (relativeX > paddleWidth / 2 && relativeX < width - paddleWidth / 2) {
        paddleX = relativeX - paddleWidth / 2
      }
    }
    
    // Touch movement for mobile
    const handleTouchMove = (e) => {
      e.preventDefault()
      const relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left
      if (relativeX > paddleWidth / 2 && relativeX < width - paddleWidth / 2) {
        paddleX = relativeX - paddleWidth / 2
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    
    // Collision detection with bricks
    const collisionDetection = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r]
          if (b.status === 1) {
            if (
              ballX > b.x &&
              ballX < b.x + brickWidth &&
              ballY > b.y &&
              ballY < b.y + brickHeight
            ) {
              ballSpeedY = -ballSpeedY
              b.status = 0
              setScore(prevScore => prevScore + b.points)
              
              // Check if all bricks are broken
              let bricksRemaining = 0
              for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                  if (bricks[c][r].status === 1) {
                    bricksRemaining++
                  }
                }
              }
              
              if (bricksRemaining === 0) {
                setLevel(prevLevel => prevLevel + 1)
                setGameWon(true)
                return
              }
            }
          }
        }
      }
    }
    
    // Draw functions
    const drawBall = () => {
      const ballGradient = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, ballRadius)
      ballGradient.addColorStop(0, '#ffffff')
      ballGradient.addColorStop(1, theme === 'dark' ? '#60a5fa' : '#3b82f6')
      
      ctx.beginPath()
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
      ctx.fillStyle = ballGradient
      ctx.fill()
      
      // Add glow effect
      ctx.shadowColor = theme === 'dark' ? '#60a5fa' : '#3b82f6'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }
    
    const drawPaddle = () => {
      const paddleGradient = ctx.createLinearGradient(paddleX, height - paddleHeight, paddleX, height)
      paddleGradient.addColorStop(0, theme === 'dark' ? '#60a5fa' : '#1e40af')
      paddleGradient.addColorStop(1, theme === 'dark' ? '#3b82f6' : '#1e3a8a')
      
      ctx.fillStyle = paddleGradient
      ctx.fillRect(paddleX, height - paddleHeight, paddleWidth, paddleHeight)
      
      // Add border
      ctx.strokeStyle = theme === 'dark' ? '#1e40af' : '#1e3a8a'
      ctx.lineWidth = 2
      ctx.strokeRect(paddleX, height - paddleHeight, paddleWidth, paddleHeight)
    }
    
    const drawBricks = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop
            bricks[c][r].x = brickX
            bricks[c][r].y = brickY
            
            // Brick gradient
            const brickGradient = ctx.createLinearGradient(brickX, brickY, brickX, brickY + brickHeight)
            brickGradient.addColorStop(0, bricks[c][r].color)
            brickGradient.addColorStop(1, bricks[c][r].color + '80')
            
            ctx.fillStyle = brickGradient
            ctx.fillRect(brickX, brickY, brickWidth, brickHeight)
            
            // Add brick border and highlight
            ctx.strokeStyle = theme === 'dark' ? '#1f2937' : '#ffffff'
            ctx.lineWidth = 1
            ctx.strokeRect(brickX, brickY, brickWidth, brickHeight)
            
            // Add highlight
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
            ctx.strokeRect(brickX + 1, brickY + 1, brickWidth - 2, brickHeight - 2)
          }
        }
      }
    }
    
    const drawUI = () => {
      ctx.font = 'bold 20px Arial'
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
      ctx.textAlign = 'left'
      ctx.fillText(`Score: ${score}`, 20, 30)
      ctx.fillText(`Lives: ${lives}`, 20, 55)
      
      ctx.textAlign = 'right'
      ctx.fillText(`Level: ${level}`, width - 20, 30)
      ctx.fillText(`High: ${highScore}`, width - 20, 55)
    }
    
    // Game loop
    const gameLoop = setInterval(() => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
      bgGradient.addColorStop(0, theme === 'dark' ? '#1e293b' : '#f1f5f9')
      bgGradient.addColorStop(1, theme === 'dark' ? '#0f172a' : '#e2e8f0')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)
      
      // Draw game objects
      drawBricks()
      drawBall()
      drawPaddle()
      drawUI()
      
      collisionDetection()
      
      // Move paddle
      if (rightPressed && paddleX < width - paddleWidth) {
        paddleX += 8
      } else if (leftPressed && paddleX > 0) {
        paddleX -= 8
      }
      
      // Ball movement and collision
      ballX += ballSpeedX
      ballY += ballSpeedY
      
      // Collision with side walls
      if (ballX + ballRadius > width || ballX - ballRadius < 0) {
        ballSpeedX = -ballSpeedX
      }
      
      // Collision with top wall
      if (ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY
      }
      
      // Collision with paddle
      if (
        ballY + ballRadius > height - paddleHeight &&
        ballX > paddleX &&
        ballX < paddleX + paddleWidth
      ) {
        // Change ball direction based on where it hits the paddle
        const hitPosition = (ballX - paddleX) / paddleWidth
        const angle = (hitPosition - 0.5) * Math.PI / 3 // -60 to 60 degrees
        
        const speed = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY)
        ballSpeedX = speed * Math.sin(angle)
        ballSpeedY = -Math.abs(speed * Math.cos(angle))
      }
      
      // Ball falls below screen
      if (ballY + ballRadius > height) {
        setLives(prevLives => {
          if (prevLives - 1 <= 0) {
            setGameOver(true)
            return 0
          }
          return prevLives - 1
        })
        
        // Reset ball and paddle
        ballX = width / 2
        ballY = height - 50
        ballSpeedX = 5 + level * 0.5
        ballSpeedY = -5 - level * 0.5
        paddleX = (width - paddleWidth) / 2
      }
      
    }, 1000 / 60) // 60 FPS
    
    return () => {
      clearInterval(gameLoop)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
    }
  }, [gameStarted, gameOver, gamePaused, lives, level, theme, highScore])

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setLives(3)
    setLevel(1)
    setGameOver(false)
    setGameWon(false)
    setGamePaused(false)
    setShowResultModal(false)
  }

  const resetGame = () => {
    startGame()
  }

  const resumeGame = () => {
    setGamePaused(false)
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
      <div className="animated-bg"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold font-orbitron mb-8"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
              }}>
            <span className="bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
              Breakout
            </span>
          </h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-6 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            {!gameStarted ? (
              <div className="text-center">
                <div className="mb-6">
                  <p className="text-lg mb-4">
                    Break all the bricks with your ball and paddle!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Use arrow keys, A/D, or mouse to move. Spacebar or P to pause.
                  </p>
                  <p className="text-lg font-semibold">High Score: {highScore}</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="py-3 px-8 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold font-orbitron rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
                >
                  Start Game
                </motion.button>
              </div>
            ) : gamePaused ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
                <p className="text-xl mb-2">Current Score: {score}</p>
                <p className="text-lg mb-6">Level: {level} | Lives: {lives}</p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resumeGame}
                  className="py-3 px-8 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold font-orbitron rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                >
                  Resume Game
                </motion.button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center flex-wrap gap-4">
                  <div className="text-lg font-bold">Score: {score} | Lives: {lives} | Level: {level}</div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGamePaused(true)}
                      className="py-2 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-lg transition-all duration-300"
                    >
                      Pause
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
                    width={800} 
                    height={500} 
                    className="block max-w-full h-auto"
                  />
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Use arrow keys, A/D, or mouse to move the paddle. Spacebar or P to pause.
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
        result={gameWon ? 'win' : 'lose'}
        score={score}
        message={gameWon ? `Level ${level} Complete! Amazing!` : `Game Over! You reached level ${level}.`}
        onRestart={resetGame}
      />
    </div>
  )
}

export default BreakoutPage