import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'
import GameResultModal from '../../components/common/GameResultModal'

const PongPage = () => {
  const { theme } = useTheme()
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState({ player: 0, ai: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [difficulty, setDifficulty] = useState('hard')
  const [showResultModal, setShowResultModal] = useState(false)

  useEffect(() => {
    document.title = 'Pong - Online Game Hub'
  }, [])

  useEffect(() => {
    if (gameOver) {
      setShowResultModal(true)
    }
  }, [gameOver])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !gameStarted) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // Game objects
    const paddleHeight = 100
    const paddleWidth = 15
    const ballRadius = 12
    
    let playerY = height / 2 - paddleHeight / 2
    let aiY = height / 2 - paddleHeight / 2
    let ballX = width / 2
    let ballY = height / 2
    let ballSpeedX = 6
    let ballSpeedY = 4
    
    // AI difficulty settings - make it very challenging
    let aiSpeed
    let aiPrediction
    switch (difficulty) {
      case 'easy':
        aiSpeed = 4
        aiPrediction = 0.7
        break
      case 'medium':
        aiSpeed = 6
        aiPrediction = 0.85
        break
      case 'hard':
      default:
        aiSpeed = 8
        aiPrediction = 0.95
        break
    }
    
    // Mouse and touch movement
    const handleMouseMove = (e) => {
      const canvasRect = canvas.getBoundingClientRect()
      const mouseY = e.clientY - canvasRect.top
      
      if (mouseY > paddleHeight / 2 && mouseY < height - paddleHeight / 2) {
        playerY = mouseY - paddleHeight / 2
      }
    }
    
    const handleTouchMove = (e) => {
      e.preventDefault()
      const canvasRect = canvas.getBoundingClientRect()
      const touchY = e.touches[0].clientY - canvasRect.top
      
      if (touchY > paddleHeight / 2 && touchY < height - paddleHeight / 2) {
        playerY = touchY - paddleHeight / 2
      }
    }
    
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    
    // Game loop
    const gameLoop = setInterval(() => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, theme === 'dark' ? '#1e293b' : '#f8fafc')
      gradient.addColorStop(1, theme === 'dark' ? '#0f172a' : '#e2e8f0')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // Draw center line
      ctx.beginPath()
      ctx.setLineDash([10, 10])
      ctx.moveTo(width / 2, 0)
      ctx.lineTo(width / 2, height)
      ctx.strokeStyle = theme === 'dark' ? '#64748b' : '#94a3b8'
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.setLineDash([])
      
      // Draw paddles with gradients
      const playerGradient = ctx.createLinearGradient(0, playerY, 0, playerY + paddleHeight)
      playerGradient.addColorStop(0, '#3b82f6')
      playerGradient.addColorStop(1, '#1d4ed8')
      ctx.fillStyle = playerGradient
      ctx.fillRect(10, playerY, paddleWidth, paddleHeight)
      
      const aiGradient = ctx.createLinearGradient(0, aiY, 0, aiY + paddleHeight)
      aiGradient.addColorStop(0, '#ef4444')
      aiGradient.addColorStop(1, '#dc2626')
      ctx.fillStyle = aiGradient
      ctx.fillRect(width - paddleWidth - 10, aiY, paddleWidth, paddleHeight)
      
      // Draw ball with glow effect
      const ballGradient = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, ballRadius)
      ballGradient.addColorStop(0, '#ffffff')
      ballGradient.addColorStop(1, theme === 'dark' ? '#e2e8f0' : '#64748b')
      
      ctx.beginPath()
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
      ctx.fillStyle = ballGradient
      ctx.fill()
      
      // Add glow effect
      ctx.shadowColor = theme === 'dark' ? '#ffffff' : '#64748b'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      
      // Move ball
      ballX += ballSpeedX
      ballY += ballSpeedY
      
      // Ball collision with top and bottom walls
      if (ballY - ballRadius < 0 || ballY + ballRadius > height) {
        ballSpeedY = -ballSpeedY
      }
      
      // Ball collision with player paddle
      if (
        ballX - ballRadius < 10 + paddleWidth && 
        ballY > playerY && 
        ballY < playerY + paddleHeight &&
        ballSpeedX < 0
      ) {
        ballSpeedX = -ballSpeedX
        const hitPosition = (ballY - playerY) / paddleHeight
        ballSpeedY = 12 * (hitPosition - 0.5)
        
        // Increase speed slightly
        ballSpeedX *= 1.05
        ballSpeedY *= 1.05
      }
      
      // Ball collision with AI paddle
      if (
        ballX + ballRadius > width - paddleWidth - 10 && 
        ballY > aiY && 
        ballY < aiY + paddleHeight &&
        ballSpeedX > 0
      ) {
        ballSpeedX = -ballSpeedX
        const hitPosition = (ballY - aiY) / paddleHeight
        ballSpeedY = 12 * (hitPosition - 0.5)
        
        // Increase speed slightly
        ballSpeedX *= 1.05
        ballSpeedY *= 1.05
      }
      
      // Advanced AI movement with prediction
      const predictedBallY = ballY + (ballSpeedY * ((width - ballX) / Math.abs(ballSpeedX)))
      const targetY = predictedBallY * aiPrediction + ballY * (1 - aiPrediction)
      const aiCenter = aiY + paddleHeight / 2
      
      if (aiCenter < targetY - 15) {
        aiY += aiSpeed
      } else if (aiCenter > targetY + 15) {
        aiY -= aiSpeed
      }
      
      // Keep AI paddle within bounds
      if (aiY < 0) aiY = 0
      if (aiY + paddleHeight > height) aiY = height - paddleHeight
      
      // Scoring
      if (ballX - ballRadius < 0) {
        setScore(prevScore => {
          const newScore = { ...prevScore, ai: prevScore.ai + 1 }
          if (newScore.ai >= 7) {
            setGameOver(true)
            setWinner('AI')
          }
          return newScore
        })
        
        // Reset ball
        ballX = width / 2
        ballY = height / 2
        ballSpeedX = 6
        ballSpeedY = 4
      }
      
      if (ballX + ballRadius > width) {
        setScore(prevScore => {
          const newScore = { ...prevScore, player: prevScore.player + 1 }
          if (newScore.player >= 7) {
            setGameOver(true)
            setWinner('Player')
          }
          return newScore
        })
        
        // Reset ball
        ballX = width / 2
        ballY = height / 2
        ballSpeedX = -6
        ballSpeedY = 4
      }
      
      // Draw scores with glow effect
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      
      // Player score
      ctx.fillStyle = '#3b82f6'
      ctx.shadowColor = '#3b82f6'
      ctx.shadowBlur = 10
      ctx.fillText(score.player.toString(), width / 4, 60)
      
      // AI score
      ctx.fillStyle = '#ef4444'
      ctx.shadowColor = '#ef4444'
      ctx.shadowBlur = 10
      ctx.fillText(score.ai.toString(), 3 * width / 4, 60)
      
      ctx.shadowBlur = 0
      
    }, 1000 / 60) // 60 FPS
    
    return () => {
      clearInterval(gameLoop)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
    }
  }, [gameStarted, theme, difficulty, score])

  const startGame = () => {
    setGameStarted(true)
    setScore({ player: 0, ai: 0 })
    setGameOver(false)
    setWinner(null)
    setShowResultModal(false)
  }

  const resetGame = () => {
    setGameStarted(false)
    setTimeout(startGame, 100)
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
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Pong
            </span>
          </h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-6 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            {!gameStarted ? (
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-6">Select Difficulty</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <motion.button
                      key={level}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDifficulty(level)}
                      className={`py-3 px-4 font-medium rounded-lg transition-all duration-300 ${
                        difficulty === level
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : `${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </motion.button>
                  ))}
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  First to 7 points wins! Move your mouse or finger to control your paddle.
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="py-3 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold font-orbitron rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  Start Game
                </motion.button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="text-lg font-bold mb-2">
                    Player {score.player} - {score.ai} AI
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    First to 7 wins • Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-xl border-2 border-gray-300 dark:border-gray-600 mx-auto" style={{ width: 'fit-content' }}>
                  <canvas 
                    ref={canvasRef} 
                    width={800} 
                    height={400} 
                    className="block max-w-full h-auto"
                  />
                </div>
                
                <div className="mt-6 flex gap-4 justify-center flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="py-2 px-6 bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium rounded-lg transition-all duration-300"
                  >
                    New Game
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGameStarted(false)}
                    className="py-2 px-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg transition-all duration-300"
                  >
                    Change Difficulty
                  </motion.button>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Move your mouse or finger up and down to control your paddle (blue).
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
        result={winner === 'Player' ? 'win' : 'lose'}
        message={winner === 'Player' ? 'Congratulations! You won!' : 'AI wins! Try again!'}
        onRestart={resetGame}
        showScore={false}
      />
    </div>
  )
}

export default PongPage