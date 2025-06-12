import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

const PongPage = () => {
  const { theme } = useTheme()
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState({ player: 0, ai: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [difficulty, setDifficulty] = useState('medium') // easy, medium, hard

  useEffect(() => {
    document.title = 'Pong - Online Game Hub'
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !gameStarted) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // Game objects
    const paddleHeight = 80
    const paddleWidth = 10
    const ballRadius = 8
    
    let playerY = height / 2 - paddleHeight / 2
    let aiY = height / 2 - paddleHeight / 2
    let ballX = width / 2
    let ballY = height / 2
    let ballSpeedX = 5
    let ballSpeedY = 3
    
    // AI difficulty settings
    let aiSpeed
    switch (difficulty) {
      case 'easy':
        aiSpeed = 3
        break
      case 'hard':
        aiSpeed = 6
        break
      case 'medium':
      default:
        aiSpeed = 4.5
        break
    }
    
    // Mouse movement for player paddle
    const handleMouseMove = (e) => {
      const canvasRect = canvas.getBoundingClientRect()
      const mouseY = e.clientY - canvasRect.top
      
      // Keep paddle within canvas
      if (mouseY > 0 && mouseY < height - paddleHeight) {
        playerY = mouseY
      }
    }
    
    canvas.addEventListener('mousemove', handleMouseMove)
    
    // Touch movement for mobile
    const handleTouchMove = (e) => {
      e.preventDefault()
      const canvasRect = canvas.getBoundingClientRect()
      const touchY = e.touches[0].clientY - canvasRect.top
      
      // Keep paddle within canvas
      if (touchY > 0 && touchY < height - paddleHeight) {
        playerY = touchY
      }
    }
    
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    
    // Game loop
    const gameLoop = setInterval(() => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw background
      ctx.fillStyle = theme === 'dark' ? '#1E293B' : '#F3F4F6'
      ctx.fillRect(0, 0, width, height)
      
      // Draw center line
      ctx.beginPath()
      ctx.setLineDash([5, 5])
      ctx.moveTo(width / 2, 0)
      ctx.lineTo(width / 2, height)
      ctx.strokeStyle = theme === 'dark' ? '#64748B' : '#9CA3AF'
      ctx.stroke()
      ctx.setLineDash([])
      
      // Draw paddles
      ctx.fillStyle = theme === 'dark' ? '#F0F9FF' : '#0C4A6E'
      ctx.fillRect(0, playerY, paddleWidth, paddleHeight)
      ctx.fillRect(width - paddleWidth, aiY, paddleWidth, paddleHeight)
      
      // Draw ball
      ctx.beginPath()
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
      ctx.fillStyle = theme === 'dark' ? '#F0F9FF' : '#0C4A6E'
      ctx.fill()
      
      // Move ball
      ballX += ballSpeedX
      ballY += ballSpeedY
      
      // Ball collision with top and bottom walls
      if (ballY - ballRadius < 0 || ballY + ballRadius > height) {
        ballSpeedY = -ballSpeedY
      }
      
      // Ball collision with paddles
      if (
        ballX - ballRadius < paddleWidth && 
        ballY > playerY && 
        ballY < playerY + paddleHeight
      ) {
        ballSpeedX = -ballSpeedX
        
        // Add some angle based on where the ball hits the paddle
        const hitPosition = (ballY - playerY) / paddleHeight
        ballSpeedY = 10 * (hitPosition - 0.5)
      }
      
      if (
        ballX + ballRadius > width - paddleWidth && 
        ballY > aiY && 
        ballY < aiY + paddleHeight
      ) {
        ballSpeedX = -ballSpeedX
        
        // Add some angle based on where the ball hits the paddle
        const hitPosition = (ballY - aiY) / paddleHeight
        ballSpeedY = 10 * (hitPosition - 0.5)
      }
      
      // AI movement
      const aiCenter = aiY + paddleHeight / 2
      if (aiCenter < ballY - 10) {
        aiY += aiSpeed
      } else if (aiCenter > ballY + 10) {
        aiY -= aiSpeed
      }
      
      // Keep AI paddle within canvas
      if (aiY < 0) {
        aiY = 0
      } else if (aiY + paddleHeight > height) {
        aiY = height - paddleHeight
      }
      
      // Scoring
      if (ballX - ballRadius < 0) {
        // AI scores
        setScore(prevScore => {
          const newScore = { ...prevScore, ai: prevScore.ai + 1 }
          
          // Check for game over
          if (newScore.ai >= 5) {
            setGameOver(true)
            setWinner('AI')
          }
          
          return newScore
        })
        
        // Reset ball
        ballX = width / 2
        ballY = height / 2
        ballSpeedX = -5
        ballSpeedY = 3
      }
      
      if (ballX + ballRadius > width) {
        // Player scores
        setScore(prevScore => {
          const newScore = { ...prevScore, player: prevScore.player + 1 }
          
          // Check for game over
          if (newScore.player >= 5) {
            setGameOver(true)
            setWinner('Player')
          }
          
          return newScore
        })
        
        // Reset ball
        ballX = width / 2
        ballY = height / 2
        ballSpeedX = 5
        ballSpeedY = 3
      }
      
      // Draw scores
      ctx.font = '24px Arial'
      ctx.fillStyle = theme === 'dark' ? '#F0F9FF' : '#0C4A6E'
      ctx.textAlign = 'center'
      ctx.fillText(score.player.toString(), width / 4, 30)
      ctx.fillText(score.ai.toString(), 3 * width / 4, 30)
      
    }, 1000 / 60) // 60 FPS
    
    return () => {
      clearInterval(gameLoop)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
    }
  }, [gameStarted, theme, difficulty])

  const startGame = () => {
    setGameStarted(true)
    setScore({ player: 0, ai: 0 })
    setGameOver(false)
    setWinner(null)
  }

  const restartGame = () => {
    setGameStarted(false)
    setTimeout(startGame, 10)
  }

  if (!gameStarted || gameOver) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-8">Pong</h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              {gameOver ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
                  <p className="text-xl mb-6">{winner} wins with a score of {winner === 'Player' ? score.player : score.ai}!</p>
                  <button
                    onClick={restartGame}
                    className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Play Again
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Pong</h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={400} 
              className={`border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} mx-auto`}
            />
            
            <div className="mt-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Move your mouse up and down to control the left paddle. First to 5 points wins!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PongPage