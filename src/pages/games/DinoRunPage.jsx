import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'
import GameResultModal from '../../components/common/GameResultModal'

const DinoRunPage = () => {
  const { theme } = useTheme()
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('dinoRunHighScore')
    return saved ? parseInt(saved, 10) : 0
  })

  useEffect(() => {
    document.title = 'Dino Run - Online Game Hub'
  }, [])

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('dinoRunHighScore', score.toString())
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
    const groundY = height - 80
    let gameSpeed = 8
    const gravity = 1.2
    let spawnTimer = 0
    const obstacleInterval = 80
    
    // Dino properties
    const dinoWidth = 60
    const dinoHeight = 70
    let dinoX = 80
    let dinoY = groundY - dinoHeight
    let dinoVelocityY = 0
    let jumping = false
    let ducking = false
    let animationFrame = 0
    
    // Obstacles and environment
    const obstacles = []
    const clouds = []
    const cacti = []
    
    // Initialize clouds
    for (let i = 0; i < 4; i++) {
      clouds.push({
        x: Math.random() * width,
        y: Math.random() * (height / 3),
        width: 60 + Math.random() * 40,
        height: 30,
        speed: 1 + Math.random() * 2
      })
    }
    
    // Input handlers
    const handleJump = () => {
      if (!jumping && !gameOver) {
        jumping = true
        dinoVelocityY = -22
      }
    }
    
    const handleDuckStart = () => {
      if (!jumping && !gameOver) {
        ducking = true
      }
    }
    
    const handleDuckEnd = () => {
      ducking = false
    }
    
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !jumping) {
        e.preventDefault()
        handleJump()
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        handleDuckStart()
      }
    }
    
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowDown') {
        e.preventDefault()
        handleDuckEnd()
      }
    }
    
    const handleTouchStart = (e) => {
      e.preventDefault()
      if (e.touches.length === 1) {
        handleJump()
      }
    }
    
    const handleTouchEnd = (e) => {
      e.preventDefault()
      handleDuckEnd()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
    
    // Spawn obstacles
    const spawnObstacle = () => {
      const types = ['cactus', 'bird', 'rock']
      const type = types[Math.floor(Math.random() * types.length)]
      
      let obstacleHeight, obstacleWidth, obstacleY
      
      switch (type) {
        case 'cactus':
          obstacleHeight = 50 + Math.random() * 30
          obstacleWidth = 25 + Math.random() * 15
          obstacleY = groundY - obstacleHeight
          break
        case 'bird':
          obstacleHeight = 30
          obstacleWidth = 40
          obstacleY = groundY - 120 - Math.random() * 50
          break
        case 'rock':
          obstacleHeight = 35
          obstacleWidth = 35
          obstacleY = groundY - obstacleHeight
          break
      }
      
      obstacles.push({
        x: width,
        y: obstacleY,
        width: obstacleWidth,
        height: obstacleHeight,
        type,
        animFrame: 0
      })
    }
    
    // Check collision
    const checkCollision = (obstacle) => {
      const currentDinoHeight = ducking ? dinoHeight / 2 : dinoHeight
      const currentDinoY = ducking ? dinoY + dinoHeight / 2 : dinoY
      const currentDinoWidth = ducking ? dinoWidth * 1.2 : dinoWidth
      
      return (
        dinoX < obstacle.x + obstacle.width - 10 &&
        dinoX + currentDinoWidth > obstacle.x + 10 &&
        currentDinoY < obstacle.y + obstacle.height - 5 &&
        currentDinoY + currentDinoHeight > obstacle.y + 5
      )
    }
    
    // Draw functions
    const drawDino = () => {
      animationFrame++
      
      ctx.fillStyle = theme === 'dark' ? '#4ade80' : '#22c55e'
      
      if (ducking) {
        // Ducking dino
        ctx.fillRect(dinoX, dinoY + dinoHeight / 2, dinoWidth * 1.2, dinoHeight / 2)
        
        // Head
        ctx.fillRect(dinoX + dinoWidth * 0.8, dinoY + dinoHeight / 2, dinoWidth * 0.4, dinoHeight * 0.3)
      } else {
        // Standing/jumping dino body
        ctx.fillRect(dinoX, dinoY, dinoWidth * 0.8, dinoHeight)
        
        // Head
        ctx.fillRect(dinoX + dinoWidth * 0.6, dinoY, dinoWidth * 0.4, dinoHeight * 0.4)
        
        // Tail
        ctx.fillRect(dinoX - dinoWidth * 0.2, dinoY + dinoHeight * 0.3, dinoWidth * 0.3, dinoHeight * 0.2)
        
        // Legs (animated when running)
        if (!jumping && Math.floor(animationFrame / 10) % 2) {
          ctx.fillRect(dinoX + dinoWidth * 0.2, dinoY + dinoHeight * 0.8, dinoWidth * 0.15, dinoHeight * 0.2)
          ctx.fillRect(dinoX + dinoWidth * 0.5, dinoY + dinoHeight * 0.7, dinoWidth * 0.15, dinoHeight * 0.3)
        } else if (!jumping) {
          ctx.fillRect(dinoX + dinoWidth * 0.2, dinoY + dinoHeight * 0.7, dinoWidth * 0.15, dinoHeight * 0.3)
          ctx.fillRect(dinoX + dinoWidth * 0.5, dinoY + dinoHeight * 0.8, dinoWidth * 0.15, dinoHeight * 0.2)
        }
      }
      
      // Eyes
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
      if (!ducking) {
        ctx.fillRect(dinoX + dinoWidth * 0.7, dinoY + dinoHeight * 0.1, 6, 6)
      } else {
        ctx.fillRect(dinoX + dinoWidth * 0.9, dinoY + dinoHeight * 0.55, 6, 6)
      }
    }
    
    const drawObstacle = (obstacle) => {
      obstacle.animFrame++
      
      switch (obstacle.type) {
        case 'cactus':
          // Draw cactus with segments
          ctx.fillStyle = theme === 'dark' ? '#22c55e' : '#16a34a'
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
          
          // Cactus arms
          if (obstacle.width > 30) {
            ctx.fillRect(obstacle.x - 10, obstacle.y + obstacle.height * 0.3, 15, obstacle.height * 0.4)
            ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y + obstacle.height * 0.5, 15, obstacle.height * 0.3)
          }
          
          // Spikes
          ctx.fillStyle = theme === 'dark' ? '#16a34a' : '#15803d'
          for (let i = 0; i < obstacle.height; i += 10) {
            ctx.fillRect(obstacle.x - 2, obstacle.y + i, 4, 6)
            ctx.fillRect(obstacle.x + obstacle.width - 2, obstacle.y + i, 4, 6)
          }
          break
          
        case 'bird':
          // Animated bird
          ctx.fillStyle = theme === 'dark' ? '#60a5fa' : '#3b82f6'
          
          // Body
          ctx.beginPath()
          ctx.ellipse(
            obstacle.x + obstacle.width / 2,
            obstacle.y + obstacle.height / 2,
            obstacle.width / 2,
            obstacle.height / 2,
            0, 0, Math.PI * 2
          )
          ctx.fill()
          
          // Wings (flapping animation)
          const wingOffset = Math.sin(obstacle.animFrame / 5) * 8
          ctx.beginPath()
          ctx.ellipse(
            obstacle.x + obstacle.width / 2,
            obstacle.y + wingOffset,
            obstacle.width / 3,
            obstacle.height / 4,
            0, 0, Math.PI * 2
          )
          ctx.fill()
          
          // Beak
          ctx.fillStyle = '#f59e0b'
          ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y + obstacle.height / 2 - 2, 8, 4)
          break
          
        case 'rock':
          // Draw rock
          ctx.fillStyle = theme === 'dark' ? '#6b7280' : '#4b5563'
          ctx.beginPath()
          ctx.ellipse(
            obstacle.x + obstacle.width / 2,
            obstacle.y + obstacle.height / 2,
            obstacle.width / 2,
            obstacle.height / 2,
            0, 0, Math.PI * 2
          )
          ctx.fill()
          
          // Rock texture
          ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280'
          ctx.fillRect(obstacle.x + 5, obstacle.y + 5, 8, 8)
          ctx.fillRect(obstacle.x + obstacle.width - 10, obstacle.y + 10, 6, 6)
          break
      }
    }
    
    const drawCloud = (cloud) => {
      ctx.fillStyle = theme === 'dark' ? '#64748b' : '#e2e8f0'
      
      // Draw fluffy cloud
      const centerX = cloud.x + cloud.width / 2
      const centerY = cloud.y + cloud.height / 2
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, cloud.height / 1.5, 0, Math.PI * 2)
      ctx.arc(centerX - cloud.width / 3, centerY, cloud.height / 2, 0, Math.PI * 2)
      ctx.arc(centerX + cloud.width / 3, centerY, cloud.height / 2, 0, Math.PI * 2)
      ctx.arc(centerX - cloud.width / 5, centerY - cloud.height / 3, cloud.height / 2.5, 0, Math.PI * 2)
      ctx.arc(centerX + cloud.width / 5, centerY - cloud.height / 3, cloud.height / 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
    
    const drawGround = () => {
      // Ground
      ctx.fillStyle = theme === 'dark' ? '#374151' : '#d1d5db'
      ctx.fillRect(0, groundY, width, height - groundY)
      
      // Ground line
      ctx.strokeStyle = theme === 'dark' ? '#4b5563' : '#9ca3af'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, groundY)
      ctx.lineTo(width, groundY)
      ctx.stroke()
      
      // Ground details (moving)
      ctx.fillStyle = theme === 'dark' ? '#4b5563' : '#9ca3af'
      const groundOffset = (Date.now() * gameSpeed / 100) % 40
      for (let i = -groundOffset; i < width; i += 40) {
        ctx.fillRect(i, groundY + 10, 20, 3)
        ctx.fillRect(i + 25, groundY + 20, 10, 2)
      }
    }
    
    const drawUI = () => {
      ctx.font = 'bold 24px Arial'
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
      ctx.textAlign = 'right'
      ctx.fillText(`Score: ${score}`, width - 20, 40)
      
      ctx.textAlign = 'left'
      ctx.fillText(`High: ${highScore}`, 20, 40)
    }
    
    // Game loop
    const gameLoop = setInterval(() => {
      if (gameOver) return
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
      bgGradient.addColorStop(0, theme === 'dark' ? '#0f172a' : '#f0f9ff')
      bgGradient.addColorStop(1, theme === 'dark' ? '#1e293b' : '#e0f2fe')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)
      
      // Update and draw clouds
      clouds.forEach(cloud => {
        cloud.x -= cloud.speed
        if (cloud.x + cloud.width < 0) {
          cloud.x = width
          cloud.y = Math.random() * (height / 3)
        }
        drawCloud(cloud)
      })
      
      // Draw ground
      drawGround()
      
      // Update dino
      if (jumping) {
        dinoVelocityY += gravity
        dinoY += dinoVelocityY
        
        if (dinoY >= groundY - dinoHeight) {
          dinoY = groundY - dinoHeight
          jumping = false
          dinoVelocityY = 0
        }
      }
      
      drawDino()
      
      // Spawn and update obstacles
      spawnTimer++
      if (spawnTimer >= obstacleInterval) {
        spawnTimer = 0
        spawnObstacle()
      }
      
      for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= gameSpeed
        
        drawObstacle(obstacles[i])
        
        // Check collision
        if (checkCollision(obstacles[i])) {
          setGameOver(true)
          return
        }
        
        // Remove obstacles that go off screen
        if (obstacles[i].x + obstacles[i].width < 0) {
          obstacles.splice(i, 1)
          i--
        }
      }
      
      // Increase score and speed
      setScore(prevScore => {
        const newScore = prevScore + 1
        
        // Increase game speed every 500 points
        if (newScore % 500 === 0) {
          gameSpeed += 1
        }
        
        return newScore
      })
      
      drawUI()
      
    }, 1000 / 60) // 60 FPS
    
    return () => {
      clearInterval(gameLoop)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameStarted, gameOver, theme, highScore])

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setGameOver(false)
    setShowResultModal(false)
  }

  const resetGame = () => {
    startGame()
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
            <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              Dino Run
            </span>
          </h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-6 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            {!gameStarted ? (
              <div className="text-center">
                <div className="mb-6">
                  <p className="text-lg mb-4">
                    Help the dino jump over obstacles and survive as long as possible!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Press Space or Up Arrow to jump. Down Arrow to duck. Tap to jump on mobile.
                  </p>
                  <p className="text-lg font-semibold">High Score: {highScore}</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="py-3 px-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold font-orbitron rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                >
                  Start Running
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
                    width={900} 
                    height={400} 
                    className="block max-w-full h-auto"
                  />
                </div>
                
                {/* Mobile Controls */}
                <div className="mt-6 flex gap-4 justify-center md:hidden">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      // Trigger jump
                      const event = new KeyboardEvent('keydown', { code: 'Space' })
                      window.dispatchEvent(event)
                    }}
                    className="py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg"
                  >
                    Jump
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      const event = new KeyboardEvent('keydown', { code: 'ArrowDown' })
                      window.dispatchEvent(event)
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      const event = new KeyboardEvent('keyup', { code: 'ArrowDown' })
                      window.dispatchEvent(event)
                    }}
                    className="py-3 px-6 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-lg"
                  >
                    Duck
                  </motion.button>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Press Space or Up Arrow to jump. Down Arrow to duck. Game speed increases over time!
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
        message={`Game Over! You survived ${score} points.`}
        onRestart={resetGame}
      />
    </div>
  )
}

export default DinoRunPage