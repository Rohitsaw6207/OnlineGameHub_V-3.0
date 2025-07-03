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
    const groundY = height - 100
    let gameSpeed = 6
    const gravity = 1.0
    let spawnTimer = 0
    const obstacleInterval = 90
    
    // Dino properties
    const dinoWidth = 60
    const dinoHeight = 70
    let dinoX = 100
    let dinoY = groundY - dinoHeight
    let dinoVelocityY = 0
    let jumping = false
    let ducking = false
    let animationFrame = 0
    
    // Obstacles and environment
    const obstacles = []
    const clouds = []
    const stars = []
    
    // Initialize clouds
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * width,
        y: Math.random() * (height / 3),
        width: 60 + Math.random() * 40,
        height: 30,
        speed: 0.5 + Math.random() * 1
      })
    }
    
    // Initialize stars
    for (let i = 0; i < 8; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height / 2),
        size: 1 + Math.random() * 2,
        speed: 0.2 + Math.random() * 0.5,
        twinkle: Math.random() * Math.PI * 2
      })
    }
    
    // Input handlers
    const handleJump = () => {
      if (!jumping && !gameOver) {
        jumping = true
        dinoVelocityY = -20
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
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    
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
    
    // Enhanced collision detection
    const checkCollision = (obstacle) => {
      const currentDinoHeight = ducking ? dinoHeight / 2 : dinoHeight
      const currentDinoY = ducking ? dinoY + dinoHeight / 2 : dinoY
      const currentDinoWidth = ducking ? dinoWidth * 1.2 : dinoWidth
      
      // More precise collision detection
      const dinoLeft = dinoX + 5
      const dinoRight = dinoX + currentDinoWidth - 5
      const dinoTop = currentDinoY + 5
      const dinoBottom = currentDinoY + currentDinoHeight - 5
      
      const obstacleLeft = obstacle.x + 5
      const obstacleRight = obstacle.x + obstacle.width - 5
      const obstacleTop = obstacle.y + 5
      const obstacleBottom = obstacle.y + obstacle.height - 5
      
      return (
        dinoLeft < obstacleRight &&
        dinoRight > obstacleLeft &&
        dinoTop < obstacleBottom &&
        dinoBottom > obstacleTop
      )
    }
    
    // Draw functions with enhanced graphics
    const drawDino = () => {
      animationFrame++
      
      ctx.fillStyle = theme === 'dark' ? '#4ade80' : '#22c55e'
      
      if (ducking) {
        // Ducking dino with better proportions
        ctx.fillRect(dinoX, dinoY + dinoHeight / 2, dinoWidth * 1.2, dinoHeight / 2)
        
        // Head
        ctx.fillRect(dinoX + dinoWidth * 0.8, dinoY + dinoHeight / 2, dinoWidth * 0.4, dinoHeight * 0.3)
        
        // Tail
        ctx.fillRect(dinoX - dinoWidth * 0.1, dinoY + dinoHeight * 0.7, dinoWidth * 0.2, dinoHeight * 0.15)
      } else {
        // Standing/jumping dino body
        ctx.fillRect(dinoX, dinoY, dinoWidth * 0.8, dinoHeight)
        
        // Head
        ctx.fillRect(dinoX + dinoWidth * 0.6, dinoY, dinoWidth * 0.4, dinoHeight * 0.4)
        
        // Tail
        ctx.fillRect(dinoX - dinoWidth * 0.2, dinoY + dinoHeight * 0.3, dinoWidth * 0.3, dinoHeight * 0.2)
        
        // Animated legs when running
        if (!jumping && Math.floor(animationFrame / 8) % 2) {
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
      
      // Add dino outline for better visibility
      ctx.strokeStyle = theme === 'dark' ? '#16a34a' : '#15803d'
      ctx.lineWidth = 2
      ctx.strokeRect(dinoX, ducking ? dinoY + dinoHeight / 2 : dinoY, 
                    ducking ? dinoWidth * 1.2 : dinoWidth * 0.8, 
                    ducking ? dinoHeight / 2 : dinoHeight)
    }
    
    const drawObstacle = (obstacle) => {
      obstacle.animFrame++
      
      switch (obstacle.type) {
        case 'cactus':
          // Enhanced cactus with segments and spikes
          const cactusGradient = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height)
          cactusGradient.addColorStop(0, theme === 'dark' ? '#22c55e' : '#16a34a')
          cactusGradient.addColorStop(1, theme === 'dark' ? '#16a34a' : '#15803d')
          
          ctx.fillStyle = cactusGradient
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
          
          // Cactus arms for larger cacti
          if (obstacle.width > 30) {
            ctx.fillRect(obstacle.x - 8, obstacle.y + obstacle.height * 0.3, 12, obstacle.height * 0.4)
            ctx.fillRect(obstacle.x + obstacle.width - 4, obstacle.y + obstacle.height * 0.5, 12, obstacle.height * 0.3)
          }
          
          // Spikes
          ctx.fillStyle = theme === 'dark' ? '#16a34a' : '#15803d'
          for (let i = 0; i < obstacle.height; i += 8) {
            ctx.fillRect(obstacle.x - 2, obstacle.y + i, 4, 4)
            ctx.fillRect(obstacle.x + obstacle.width - 2, obstacle.y + i, 4, 4)
          }
          break
          
        case 'bird':
          // Enhanced animated bird
          const birdGradient = ctx.createRadialGradient(
            obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 0,
            obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2
          )
          birdGradient.addColorStop(0, theme === 'dark' ? '#60a5fa' : '#3b82f6')
          birdGradient.addColorStop(1, theme === 'dark' ? '#3b82f6' : '#1d4ed8')
          
          // Body
          ctx.fillStyle = birdGradient
          ctx.beginPath()
          ctx.ellipse(
            obstacle.x + obstacle.width / 2,
            obstacle.y + obstacle.height / 2,
            obstacle.width / 2,
            obstacle.height / 2,
            0, 0, Math.PI * 2
          )
          ctx.fill()
          
          // Wings with flapping animation
          const wingOffset = Math.sin(obstacle.animFrame / 4) * 12
          ctx.fillStyle = theme === 'dark' ? '#3b82f6' : '#1d4ed8'
          ctx.beginPath()
          ctx.ellipse(
            obstacle.x + obstacle.width / 2,
            obstacle.y + wingOffset,
            obstacle.width / 3,
            obstacle.height / 3,
            0, 0, Math.PI * 2
          )
          ctx.fill()
          
          // Beak
          ctx.fillStyle = '#f59e0b'
          ctx.fillRect(obstacle.x + obstacle.width - 3, obstacle.y + obstacle.height / 2 - 2, 8, 4)
          
          // Eye
          ctx.fillStyle = 'white'
          ctx.beginPath()
          ctx.arc(obstacle.x + obstacle.width / 2 + 5, obstacle.y + obstacle.height / 2 - 3, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'black'
          ctx.beginPath()
          ctx.arc(obstacle.x + obstacle.width / 2 + 6, obstacle.y + obstacle.height / 2 - 2, 1, 0, Math.PI * 2)
          ctx.fill()
          break
          
        case 'rock':
          // Enhanced rock with texture
          const rockGradient = ctx.createRadialGradient(
            obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 0,
            obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2
          )
          rockGradient.addColorStop(0, theme === 'dark' ? '#9ca3af' : '#6b7280')
          rockGradient.addColorStop(1, theme === 'dark' ? '#6b7280' : '#4b5563')
          
          ctx.fillStyle = rockGradient
          ctx.beginPath()
          ctx.ellipse(
            obstacle.x + obstacle.width / 2,
            obstacle.y + obstacle.height / 2,
            obstacle.width / 2,
            obstacle.height / 2,
            0, 0, Math.PI * 2
          )
          ctx.fill()
          
          // Rock texture details
          ctx.fillStyle = theme === 'dark' ? '#d1d5db' : '#9ca3af'
          ctx.fillRect(obstacle.x + 5, obstacle.y + 5, 8, 8)
          ctx.fillRect(obstacle.x + obstacle.width - 10, obstacle.y + 10, 6, 6)
          ctx.fillRect(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height - 8, 4, 4)
          break
      }
    }
    
    const drawCloud = (cloud) => {
      ctx.fillStyle = theme === 'dark' ? '#64748b' : '#e2e8f0'
      
      // Draw fluffy cloud with multiple circles
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
    
    const drawStar = (star) => {
      star.twinkle += 0.1
      const alpha = 0.5 + Math.sin(star.twinkle) * 0.3
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    const drawGround = () => {
      // Enhanced ground with gradient
      const groundGradient = ctx.createLinearGradient(0, groundY, 0, height)
      groundGradient.addColorStop(0, theme === 'dark' ? '#374151' : '#d1d5db')
      groundGradient.addColorStop(1, theme === 'dark' ? '#1f2937' : '#9ca3af')
      
      ctx.fillStyle = groundGradient
      ctx.fillRect(0, groundY, width, height - groundY)
      
      // Ground line
      ctx.strokeStyle = theme === 'dark' ? '#4b5563' : '#6b7280'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(0, groundY)
      ctx.lineTo(width, groundY)
      ctx.stroke()
      
      // Moving ground details
      ctx.fillStyle = theme === 'dark' ? '#4b5563' : '#9ca3af'
      const groundOffset = (Date.now() * gameSpeed / 100) % 50
      for (let i = -groundOffset; i < width; i += 50) {
        ctx.fillRect(i, groundY + 15, 25, 4)
        ctx.fillRect(i + 30, groundY + 25, 15, 3)
        ctx.fillRect(i + 10, groundY + 35, 20, 2)
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
      
      ctx.textAlign = 'right'
      ctx.strokeText(`High: ${highScore}`, width - 20, 40)
      ctx.fillText(`High: ${highScore}`, width - 20, 40)
    }
    
    // Game loop
    const gameLoop = setInterval(() => {
      if (gameOver) return
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw beautiful gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
      bgGradient.addColorStop(0, theme === 'dark' ? '#0f172a' : '#f0f9ff')
      bgGradient.addColorStop(0.7, theme === 'dark' ? '#1e293b' : '#e0f2fe')
      bgGradient.addColorStop(1, theme === 'dark' ? '#334155' : '#bae6fd')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)
      
      // Update and draw stars
      stars.forEach(star => {
        star.x -= star.speed
        if (star.x < -10) {
          star.x = width + 10
          star.y = Math.random() * (height / 2)
        }
        drawStar(star)
      })
      
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
        
        // Remove obstacles that go off screen and increase score
        if (obstacles[i].x + obstacles[i].width < 0) {
          obstacles.splice(i, 1)
          i--
          setScore(prevScore => {
            const newScore = prevScore + 1
            
            // Increase game speed every 100 points
            if (newScore % 100 === 0) {
              gameSpeed += 0.5
            }
            
            return newScore
          })
        }
      }
      
      drawUI()
      
    }, 1000 / 60) // 60 FPS
    
    return () => {
      clearInterval(gameLoop)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
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
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <span className="text-sm opacity-75">High Score</span>
                      <div className="text-2xl font-bold font-orbitron text-green-500">{highScore}</div>
                    </div>
                  </div>
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
                    height={500} 
                    className="block max-w-full h-auto"
                    style={{ maxHeight: '60vh' }}
                  />
                </div>
                
                {/* Mobile Controls */}
                <div className="mt-6 flex gap-4 justify-center md:hidden">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onTouchStart={(e) => {
                      e.preventDefault()
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