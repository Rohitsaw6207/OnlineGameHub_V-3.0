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
    const ballRadius = 12
    const paddleHeight = 18
    const paddleWidth = 120
    const brickRowCount = 6
    const brickColumnCount = 10
    const brickWidth = 75
    const brickHeight = 30
    const brickPadding = 5
    const brickOffsetTop = 80
    const brickOffsetLeft = (width - (brickColumnCount * (brickWidth + brickPadding) - brickPadding)) / 2
    
    let ballX = width / 2
    let ballY = height - 80
    let ballSpeedX = 4 + level * 0.3
    let ballSpeedY = -4 - level * 0.3
    let paddleX = (width - paddleWidth) / 2
    
    // Create bricks with different colors and point values
    const bricks = []
    const brickColors = [
      { color: '#ef4444', points: 60 }, // Red - top row, most points
      { color: '#f97316', points: 50 }, // Orange
      { color: '#eab308', points: 40 }, // Yellow
      { color: '#22c55e', points: 30 }, // Green
      { color: '#3b82f6', points: 20 }, // Blue
      { color: '#8b5cf6', points: 10 }  // Purple - bottom row, least points
    ]
    
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = []
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { 
          x: 0, 
          y: 0, 
          status: 1,
          color: brickColors[r].color,
          points: brickColors[r].points,
          hits: 0,
          maxHits: r < 2 ? 2 : 1 // Top 2 rows need 2 hits
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
    
    // Enhanced collision detection with bricks
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
              b.hits++
              
              if (b.hits >= b.maxHits) {
                b.status = 0
                setScore(prevScore => prevScore + b.points)
              }
              
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
    
    // Draw functions with enhanced graphics
    const drawBall = () => {
      // Ball shadow
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.arc(ballX + 2, ballY + 2, ballRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      
      // Ball gradient
      const ballGradient = ctx.createRadialGradient(ballX - 3, ballY - 3, 0, ballX, ballY, ballRadius)
      ballGradient.addColorStop(0, '#ffffff')
      ballGradient.addColorStop(0.3, theme === 'dark' ? '#60a5fa' : '#3b82f6')
      ballGradient.addColorStop(1, theme === 'dark' ? '#3b82f6' : '#1d4ed8')
      
      ctx.beginPath()
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
      ctx.fillStyle = ballGradient
      ctx.fill()
      
      // Ball outline
      ctx.strokeStyle = theme === 'dark' ? '#1d4ed8' : '#1e3a8a'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Add glow effect
      ctx.shadowColor = theme === 'dark' ? '#60a5fa' : '#3b82f6'
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }
    
    const drawPaddle = () => {
      // Paddle shadow
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = 'black'
      ctx.fillRect(paddleX + 2, height - paddleHeight + 2, paddleWidth, paddleHeight)
      ctx.restore()
      
      // Paddle gradient
      const paddleGradient = ctx.createLinearGradient(paddleX, height - paddleHeight, paddleX, height)
      paddleGradient.addColorStop(0, theme === 'dark' ? '#60a5fa' : '#1e40af')
      paddleGradient.addColorStop(0.5, theme === 'dark' ? '#3b82f6' : '#1d4ed8')
      paddleGradient.addColorStop(1, theme === 'dark' ? '#1d4ed8' : '#1e3a8a')
      
      ctx.fillStyle = paddleGradient
      ctx.fillRect(paddleX, height - paddleHeight, paddleWidth, paddleHeight)
      
      // Paddle border and highlights
      ctx.strokeStyle = theme === 'dark' ? '#1e3a8a' : '#1e40af'
      ctx.lineWidth = 2
      ctx.strokeRect(paddleX, height - paddleHeight, paddleWidth, paddleHeight)
      
      // Paddle highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 1
      ctx.strokeRect(paddleX + 2, height - paddleHeight + 2, paddleWidth - 4, paddleHeight - 4)
    }
    
    const drawBricks = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop
            bricks[c][r].x = brickX
            bricks[c][r].y = brickY
            
            // Brick shadow
            ctx.save()
            ctx.globalAlpha = 0.3
            ctx.fillStyle = 'black'
            ctx.fillRect(brickX + 2, brickY + 2, brickWidth, brickHeight)
            ctx.restore()
            
            // Brick gradient based on hits
            const brickGradient = ctx.createLinearGradient(brickX, brickY, brickX, brickY + brickHeight)
            const baseColor = bricks[c][r].color
            const alpha = bricks[c][r].hits > 0 ? '80' : 'FF'
            
            brickGradient.addColorStop(0, baseColor)
            brickGradient.addColorStop(0.5, baseColor + 'CC')
            brickGradient.addColorStop(1, baseColor + alpha)
            
            ctx.fillStyle = brickGradient
            ctx.fillRect(brickX, brickY, brickWidth, brickHeight)
            
            // Brick border
            ctx.strokeStyle = theme === 'dark' ? '#1f2937' : '#ffffff'
            ctx.lineWidth = 2
            ctx.strokeRect(brickX, brickY, brickWidth, brickHeight)
            
            // Brick highlight
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
            ctx.lineWidth = 1
            ctx.strokeRect(brickX + 2, brickY + 2, brickWidth - 4, brickHeight - 4)
            
            // Show hit indicator for multi-hit bricks
            if (bricks[c][r].maxHits > 1) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
              ctx.font = 'bold 14px Arial'
              ctx.textAlign = 'center'
              ctx.fillText(
                (bricks[c][r].maxHits - bricks[c][r].hits).toString(),
                brickX + brickWidth / 2,
                brickY + brickHeight / 2 + 5
              )
            }
          }
        }
      }
    }
    
    const drawBackground = () => {
      // Beautiful gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
      bgGradient.addColorStop(0, theme === 'dark' ? '#0f172a' : '#f8fafc')
      bgGradient.addColorStop(0.5, theme === 'dark' ? '#1e293b' : '#f1f5f9')
      bgGradient.addColorStop(1, theme === 'dark' ? '#334155' : '#e2e8f0')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add some decorative elements
      ctx.fillStyle = theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.arc(width * 0.1 + i * width * 0.2, height * 0.8, 30, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    const drawUI = () => {
      ctx.font = 'bold 24px Arial'
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
      ctx.strokeStyle = theme === 'dark' ? '#000000' : '#ffffff'
      ctx.lineWidth = 2
      
      ctx.textAlign = 'left'
      ctx.strokeText(`Score: ${score}`, 20, 40)
      ctx.fillText(`Score: ${score}`, 20, 40)
      
      ctx.strokeText(`Lives: ${lives}`, 20, 70)
      ctx.fillText(`Lives: ${lives}`, 20, 70)
      
      ctx.textAlign = 'right'
      ctx.strokeText(`Level: ${level}`, width - 20, 40)
      ctx.fillText(`Level: ${level}`, width - 20, 40)
      
      ctx.strokeText(`High: ${highScore}`, width - 20, 70)
      ctx.fillText(`High: ${highScore}`, width - 20, 70)
    }
    
    // Game loop
    const gameLoop = setInterval(() => {
      // Clear canvas and draw background
      drawBackground()
      
      // Draw game objects
      drawBricks()
      drawBall()
      drawPaddle()
      drawUI()
      
      collisionDetection()
      
      // Move paddle
      if (rightPressed && paddleX < width - paddleWidth) {
        paddleX += 10
      } else if (leftPressed && paddleX > 0) {
        paddleX -= 10
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
      
      // Enhanced collision with paddle
      if (
        ballY + ballRadius > height - paddleHeight &&
        ballX > paddleX &&
        ballX < paddleX + paddleWidth
      ) {
        // Calculate hit position on paddle (0 to 1)
        const hitPosition = (ballX - paddleX) / paddleWidth
        
        // Calculate new angle based on hit position
        const maxAngle = Math.PI / 3 // 60 degrees
        const angle = (hitPosition - 0.5) * maxAngle
        
        // Calculate new velocity
        const speed = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY)
        ballSpeedX = speed * Math.sin(angle)
        ballSpeedY = -Math.abs(speed * Math.cos(angle))
        
        // Ensure minimum upward velocity
        if (ballSpeedY > -2) {
          ballSpeedY = -2
        }
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
        ballY = height - 80
        ballSpeedX = 4 + level * 0.3
        ballSpeedY = -4 - level * 0.3
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
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <span className="text-sm opacity-75">High Score</span>
                      <div className="text-2xl font-bold font-orbitron text-orange-500">{highScore}</div>
                    </div>
                  </div>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                    <div className="text-sm opacity-75">Score</div>
                    <div className="text-xl font-bold">{score}</div>
                  </div>
                  <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                    <div className="text-sm opacity-75">Lives</div>
                    <div className="text-xl font-bold">{lives}</div>
                  </div>
                  <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                    <div className="text-sm opacity-75">Level</div>
                    <div className="text-xl font-bold">{level}</div>
                  </div>
                  <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                    <div className="text-sm opacity-75">High</div>
                    <div className="text-xl font-bold text-orange-500">{highScore}</div>
                  </div>
                </div>
                
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
                <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                    <div className="text-sm opacity-75">Score</div>
                    <div className="text-xl font-bold font-orbitron">{score}</div>
                  </div>
                  <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                    <div className="text-sm opacity-75">Lives</div>
                    <div className="text-xl font-bold">{lives}</div>
                  </div>
                  <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                    <div className="text-sm opacity-75">Level</div>
                    <div className="text-xl font-bold">{level}</div>
                  </div>
                  <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                    <div className="text-sm opacity-75">High</div>
                    <div className="text-xl font-bold text-orange-500">{highScore}</div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-xl border-2 border-gray-300 dark:border-gray-600 mx-auto" style={{ width: 'fit-content' }}>
                  <canvas 
                    ref={canvasRef} 
                    width={800} 
                    height={600} 
                    className="block max-w-full h-auto"
                    style={{ maxHeight: '60vh' }}
                  />
                </div>
                
                <div className="mt-4 flex gap-2 justify-center flex-wrap">
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