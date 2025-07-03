import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'
import GameResultModal from '../../components/common/GameResultModal'

const FlappyBirdPage = () => {
  const { theme } = useTheme()
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('flappyBirdHighScore')
    return saved ? parseInt(saved, 10) : 0
  })

  useEffect(() => {
    document.title = 'Flappy Bird - Online Game Hub'
  }, [])

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('flappyBirdHighScore', score.toString())
    }
  }, [score, highScore])

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
    
    // Game settings
    const gravity = 0.6
    const flapStrength = -12
    const pipeWidth = 80
    const pipeGap = 180
    const pipeSpacing = 250
    
    // Game objects
    let birdY = height / 2
    let birdVelocity = 0
    let birdRadius = 20
    let gameSpeed = 3
    
    // Create initial pipes
    let pipes = []
    for (let i = 0; i < 4; i++) {
      pipes.push({
        x: width + i * pipeSpacing,
        topHeight: Math.random() * (height - pipeGap - 150) + 75,
        passed: false
      })
    }
    
    // Flap handler
    const handleFlap = (e) => {
      e.preventDefault()
      if (!gameOver) {
        birdVelocity = flapStrength
      }
    }
    
    // Event listeners
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleFlap(e)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    canvas.addEventListener('click', handleFlap)
    canvas.addEventListener('touchstart', handleFlap, { passive: false })
    
    // Game loop
    const gameLoop = setInterval(() => {
      if (gameOver) return
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
      bgGradient.addColorStop(0, theme === 'dark' ? '#1e3a8a' : '#87ceeb')
      bgGradient.addColorStop(1, theme === 'dark' ? '#1e40af' : '#4682b4')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)
      
      // Draw clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      for (let i = 0; i < 3; i++) {
        const cloudX = (Date.now() * 0.02 + i * 200) % (width + 100) - 50
        const cloudY = 50 + i * 30
        
        ctx.beginPath()
        ctx.arc(cloudX, cloudY, 25, 0, Math.PI * 2)
        ctx.arc(cloudX + 25, cloudY, 35, 0, Math.PI * 2)
        ctx.arc(cloudX + 50, cloudY, 25, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Update bird position
      birdVelocity += gravity
      birdY += birdVelocity
      
      // Draw bird with animation
      const birdTilt = Math.min(Math.max(birdVelocity * 3, -30), 90)
      
      ctx.save()
      ctx.translate(width / 4, birdY)
      ctx.rotate(birdTilt * Math.PI / 180)
      
      // Bird body
      const birdGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, birdRadius)
      birdGradient.addColorStop(0, '#ffd700')
      birdGradient.addColorStop(1, '#ffa500')
      
      ctx.beginPath()
      ctx.arc(0, 0, birdRadius, 0, Math.PI * 2)
      ctx.fillStyle = birdGradient
      ctx.fill()
      
      // Bird eye
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(5, -5, 6, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.arc(7, -3, 3, 0, Math.PI * 2)
      ctx.fill()
      
      // Bird beak
      ctx.fillStyle = '#ff6347'
      ctx.beginPath()
      ctx.moveTo(birdRadius - 5, 0)
      ctx.lineTo(birdRadius + 10, 0)
      ctx.lineTo(birdRadius - 5, 5)
      ctx.closePath()
      ctx.fill()
      
      ctx.restore()
      
      // Draw and move pipes
      pipes.forEach(pipe => {
        pipe.x -= gameSpeed
        
        // Pipe gradient
        const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0)
        pipeGradient.addColorStop(0, theme === 'dark' ? '#22c55e' : '#228b22')
        pipeGradient.addColorStop(0.5, theme === 'dark' ? '#16a34a' : '#32cd32')
        pipeGradient.addColorStop(1, theme === 'dark' ? '#15803d' : '#228b22')
        
        // Draw top pipe
        ctx.fillStyle = pipeGradient
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight)
        
        // Top pipe cap
        ctx.fillRect(pipe.x - 10, pipe.topHeight - 30, pipeWidth + 20, 30)
        
        // Draw bottom pipe
        ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, height - pipe.topHeight - pipeGap)
        
        // Bottom pipe cap
        ctx.fillRect(pipe.x - 10, pipe.topHeight + pipeGap, pipeWidth + 20, 30)
        
        // Pipe borders
        ctx.strokeStyle = theme === 'dark' ? '#166534' : '#006400'
        ctx.lineWidth = 3
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.topHeight)
        ctx.strokeRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, height - pipe.topHeight - pipeGap)
        ctx.strokeRect(pipe.x - 10, pipe.topHeight - 30, pipeWidth + 20, 30)
        ctx.strokeRect(pipe.x - 10, pipe.topHeight + pipeGap, pipeWidth + 20, 30)
        
        // Check for score
        if (pipe.x + pipeWidth < width / 4 && !pipe.passed) {
          pipe.passed = true
          setScore(prevScore => {
            const newScore = prevScore + 1
            // Increase game speed every 5 points
            if (newScore % 5 === 0) {
              gameSpeed += 0.5
            }
            return newScore
          })
        }
        
        // Check for collision
        const birdLeft = width / 4 - birdRadius
        const birdRight = width / 4 + birdRadius
        const birdTop = birdY - birdRadius
        const birdBottom = birdY + birdRadius
        
        if (
          birdRight > pipe.x &&
          birdLeft < pipe.x + pipeWidth &&
          (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + pipeGap)
        ) {
          setGameOver(true)
        }
      })
      
      // Create new pipes when needed
      if (pipes[0].x < -pipeWidth) {
        pipes.shift()
        pipes.push({
          x: pipes[pipes.length - 1].x + pipeSpacing,
          topHeight: Math.random() * (height - pipeGap - 150) + 75,
          passed: false
        })
      }
      
      // Check for collision with ground and ceiling
      if (birdY - birdRadius < 0 || birdY + birdRadius > height) {
        setGameOver(true)
      }
      
      // Draw ground
      const groundGradient = ctx.createLinearGradient(0, height - 50, 0, height)
      groundGradient.addColorStop(0, theme === 'dark' ? '#22c55e' : '#228b22')
      groundGradient.addColorStop(1, theme === 'dark' ? '#15803d' : '#006400')
      ctx.fillStyle = groundGradient
      ctx.fillRect(0, height - 50, width, 50)
      
      // Draw score
      ctx.font = 'bold 48px Arial'
      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 4
      ctx.textAlign = 'center'
      ctx.strokeText(score.toString(), width / 2, 80)
      ctx.fillText(score.toString(), width / 2, 80)
      
    }, 1000 / 60) // 60 FPS
    
    return () => {
      clearInterval(gameLoop)
      window.removeEventListener('keydown', handleKeyDown)
      canvas.removeEventListener('click', handleFlap)
      canvas.removeEventListener('touchstart', handleFlap)
    }
  }, [gameStarted, gameOver, theme])

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setGameOver(false)
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
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold font-orbitron mb-8"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
              }}>
            <span className="bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent">
              Flappy Bird
            </span>
          </h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-6 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            {!gameStarted ? (
              <div className="text-center">
                <div className="mb-6">
                  <p className="text-lg mb-4">
                    Tap or press spacebar to make the bird flap and avoid the pipes!
                  </p>
                  <p className="text-lg font-semibold">High Score: {highScore}</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="py-3 px-8 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold font-orbitron rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/25"
                >
                  Start Flying
                </motion.button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center flex-wrap gap-4">
                  <div className="text-xl font-bold font-orbitron">Score: {score}</div>
                  <div className="text-lg">High Score: {highScore}</div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="py-2 px-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-lg transition-all duration-300"
                  >
                    Restart
                  </motion.button>
                </div>
                
                <div className="relative overflow-hidden rounded-xl border-2 border-gray-300 dark:border-gray-600 mx-auto" style={{ width: 'fit-content' }}>
                  <canvas 
                    ref={canvasRef} 
                    width={500} 
                    height={600} 
                    className="block max-w-full h-auto"
                  />
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tap the screen or press spacebar to flap. Avoid the pipes!
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

export default FlappyBirdPage