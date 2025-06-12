import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

const BreakoutPage = () => {
  const { theme } = useTheme()
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [gamePaused, setGamePaused] = useState(false)
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
    const canvas = canvasRef.current
    if (!canvas || !gameStarted || gameOver || gamePaused) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // Game objects
    const ballRadius = 8
    const paddleHeight = 10
    const paddleWidth = 75
    const brickRowCount = 5
    const brickColumnCount = 9
    const brickWidth = 54
    const brickHeight = 20
    const brickPadding = 10
    const brickOffsetTop = 30
    const brickOffsetLeft = 30
    
    let ballX = width / 2
    let ballY = height - 30
    let ballSpeedX = 4
    let ballSpeedY = -4
    let paddleX = (width - paddleWidth) / 2
    
    // Create bricks
    const bricks = []
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = []
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 }
      }
    }
    
    // Paddle movement
    let rightPressed = false
    let leftPressed = false
    
    const handleKeyDown = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true
      }
    }
    
    const handleKeyUp = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false
      } else if (e.key === 'p' || e.key === 'P') {
        setGamePaused(prev => !prev)
      }
    }
    
    // Mouse movement for the paddle
    const handleMouseMove = (e) => {
      const relativeX = e.clientX - canvas.getBoundingClientRect().left
      if (relativeX > 0 && relativeX < width) {
        paddleX = relativeX - paddleWidth / 2
      }
    }
    
    // Touch movement for mobile
    const handleTouchMove = (e) => {
      e.preventDefault()
      const relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left
      if (relativeX > 0 && relativeX < width) {
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
              setScore(prevScore => prevScore + (10 * level))
              
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
                // Level up!
                setLevel(prevLevel => prevLevel + 1)
                
                // Reset ball position
                ballX = width / 2
                ballY = height - 30
                
                // Increase speed
                ballSpeedX = (ballSpeedX > 0) ? ballSpeedX + 0.5 : ballSpeedX - 0.5
                ballSpeedY = (ballSpeedY > 0) ? ballSpeedY + 0.5 : ballSpeedY - 0.5
                
                // Reset bricks
                for (let c = 0; c < brickColumnCount; c++) {
                  for (let r = 0; r < brickRowCount; r++) {
                    bricks[c][r].status = 1
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Draw functions
    const drawBall = () => {
      ctx.beginPath()
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#0284c7'
      ctx.fill()
      ctx.closePath()
    }
    
    const drawPaddle = () => {
      ctx.beginPath()
      ctx.rect(paddleX, height - paddleHeight, paddleWidth, paddleHeight)
      ctx.fillStyle = theme === 'dark' ? '#60a5fa' : '#1e40af'
      ctx.fill()
      ctx.closePath()
    }
    
    const drawBricks = () => {
      const colors = [
        '#ef4444', // Red
        '#f97316', // Orange
        '#eab308', // Yellow
        '#22c55e', // Green
        '#3b82f6'  // Blue
      ]
      
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop
            bricks[c][r].x = brickX
            bricks[c][r].y = brickY
            
            ctx.beginPath()
            ctx.rect(brickX, brickY, brickWidth, brickHeight)
            ctx.fillStyle = colors[r]
            ctx.fill()
            ctx.closePath()
            
            // Add brick border
            ctx.beginPath()
            ctx.rect(brickX, brickY, brickWidth, brickHeight)
            ctx.strokeStyle = theme === 'dark' ? '#1f2937' : '#ffffff'
            ctx.stroke()
            ctx.closePath()
          }
        }
      }
    }
    
    const drawScore = () => {
      ctx.font = '16px Arial'
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
      ctx.textAlign = 'left'
      ctx.fillText(`Score: ${score}`, 8, 20)
    }
    
    const drawLives = () => {
      ctx.font = '16px Arial'
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
      ctx.textAlign = 'right'
      ctx.fillText(`Lives: ${lives}`, width - 8, 20)
    }
    
    const drawLevel = () => {
      ctx.font = '16px Arial'
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
      ctx.textAlign = 'center'
      ctx.fillText(`Level: ${level}`, width / 2, 20)
    }
    
    // Game loop
    const gameLoop = setInterval(() => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw background
      ctx.fillStyle = theme === 'dark' ? '#1e293b' : '#f3f4f6'
      ctx.fillRect(0, 0, width, height)
      
      // Draw game objects
      drawBricks()
      drawBall()
      drawPaddle()
      drawScore()
      drawLives()
      drawLevel()
      
      collisionDetection()
      
      // Move paddle
      if (rightPressed && paddleX < width - paddleWidth) {
        paddleX += 7
      } else if (leftPressed && paddleX > 0) {
        paddleX -= 7
      }
      
      // Keep paddle within bounds
      if (paddleX < 0) {
        paddleX = 0
      } else if (paddleX > width - paddleWidth) {
        paddleX = width - paddleWidth
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
        const angle = hitPosition * (Math.PI / 2) - Math.PI / 4 // -45 to 45 degrees
        
        const speed = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY)
        ballSpeedX = speed * Math.sin(angle)
        ballSpeedY = -speed * Math.cos(angle)
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
        ballY = height - 30
        ballSpeedX = 4
        ballSpeedY = -4
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
  }, [gameStarted, gameOver, gamePaused, lives, level, theme])

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setLives(3)
    setLevel(1)
    setGameOver(false)
    setGamePaused(false)
  }

  const resumeGame = () => {
    setGamePaused(false)
  }

  if (gameOver) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-8">Breakout</h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
              <p className="text-xl mb-2">Your Score: {score}</p>
              <p className="text-lg mb-2">Level Reached: {level}</p>
              <p className="text-lg mb-6">High Score: {highScore}</p>
              
              <button
                onClick={startGame}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (gamePaused) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-8">Breakout</h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
              <p className="text-xl mb-2">Current Score: {score}</p>
              <p className="text-lg mb-6">Level: {level}</p>
              
              <button
                onClick={resumeGame}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Resume Game
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-8">Breakout</h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className="text-xl font-semibold mb-4">How to Play</h2>
              <p className="mb-6">
                Use the left and right arrow keys or your mouse to move the paddle.
                Break all the bricks to advance to the next level. Press 'P' to pause the game.
              </p>
              
              <div className="mb-6">
                <p className="text-lg font-semibold">High Score: {highScore}</p>
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
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Breakout</h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={400} 
              className={`border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} mx-auto`}
            />
            
            <div className="mt-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Use the left and right arrow keys or your mouse to move the paddle.
                Press 'P' to pause the game.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BreakoutPage