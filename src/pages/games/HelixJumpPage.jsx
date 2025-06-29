import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'
import GameResultModal from '../../components/common/GameResultModal'

const HelixJumpPage = () => {
  const { theme } = useTheme()
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [level, setLevel] = useState(1)
  const [showResultModal, setShowResultModal] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('helixJumpHighScore')
    return saved ? parseInt(saved, 10) : 0
  })

  useEffect(() => {
    document.title = 'Helix Jump - Online Game Hub'
  }, [])

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('helixJumpHighScore', score.toString())
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
    const towerRadius = 140
    const ballRadius = 18
    const platformHeight = 25
    const platformGap = 100
    const numberOfPlatforms = 12
    let rotationSpeed = 0.03
    let ballFallSpeed = 6
    let gameSpeed = 1 + (level * 0.15)
    
    // Game objects
    const ball = {
      x: width / 2,
      y: 80,
      radius: ballRadius,
      falling: true,
      platformIndex: -1,
      velocity: 0
    }
    
    // Tower rotation
    let towerRotation = 0
    let mouseX = width / 2
    let mouseY = height / 2
    
    // Create platforms with gaps and colors
    const createPlatforms = () => {
      const platforms = []
      const colors = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', 
        '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'
      ]
      
      for (let i = 0; i < numberOfPlatforms; i++) {
        const y = height - (i * platformGap) - platformHeight
        const gapWidth = Math.PI * (0.25 + Math.random() * 0.2)
        const gapPosition = Math.random() * Math.PI * 2
        const dangerous = Math.random() < 0.2 + (level * 0.05)
        
        platforms.push({
          y,
          gapPosition,
          gapWidth,
          dangerous,
          color: colors[i % colors.length],
          passed: false
        })
      }
      return platforms
    }
    
    let platforms = createPlatforms()
    
    // Input handlers
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }
    
    const handleTouchMove = (e) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      mouseX = e.touches[0].clientX - rect.left
      mouseY = e.touches[0].clientY - rect.top
    }
    
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    
    // Check if ball is in a platform gap
    const isInGap = (platform) => {
      const ballAngle = Math.atan2(ball.y - height / 2, ball.x - width / 2) + Math.PI
      const normalizedBallAngle = (ballAngle + towerRotation + Math.PI * 4) % (Math.PI * 2)
      const normalizedGapStart = (platform.gapPosition + Math.PI * 4) % (Math.PI * 2)
      let normalizedGapEnd = (platform.gapPosition + platform.gapWidth + Math.PI * 4) % (Math.PI * 2)
      
      if (normalizedGapEnd < normalizedGapStart) {
        normalizedGapEnd += Math.PI * 2
      }
      
      if (platform.dangerous) {
        return normalizedBallAngle >= normalizedGapStart && normalizedBallAngle <= normalizedGapEnd
      } else {
        return normalizedBallAngle >= normalizedGapStart && normalizedBallAngle <= normalizedGapEnd
      }
    }
    
    // Draw platform
    const drawPlatform = (platform, yOffset) => {
      ctx.save()
      ctx.translate(width / 2, height / 2 + yOffset)
      ctx.rotate(towerRotation)
      
      // Draw platform segments
      const segments = 32
      const angleStep = (Math.PI * 2) / segments
      
      for (let i = 0; i < segments; i++) {
        const angle = i * angleStep
        const nextAngle = (i + 1) * angleStep
        
        // Check if this segment is in the gap
        const inGap = angle >= platform.gapPosition && angle <= platform.gapPosition + platform.gapWidth
        
        if (!inGap) {
          ctx.beginPath()
          ctx.arc(0, 0, towerRadius, angle, nextAngle)
          ctx.arc(0, 0, towerRadius - platformHeight, nextAngle, angle, true)
          ctx.closePath()
          
          // Platform color with gradient
          const gradient = ctx.createRadialGradient(0, 0, towerRadius - platformHeight, 0, 0, towerRadius)
          if (platform.dangerous) {
            gradient.addColorStop(0, '#dc2626')
            gradient.addColorStop(1, '#ef4444')
          } else {
            gradient.addColorStop(0, platform.color)
            gradient.addColorStop(1, platform.color + '80')
          }
          
          ctx.fillStyle = gradient
          ctx.fill()
          
          // Add border
          ctx.strokeStyle = theme === 'dark' ? '#1f2937' : '#ffffff'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }
      
      ctx.restore()
    }
    
    // Draw ball
    const drawBall = () => {
      const ballGradient = ctx.createRadialGradient(
        ball.x - 5, ball.y - 5, 0,
        ball.x, ball.y, ball.radius
      )
      ballGradient.addColorStop(0, '#ffffff')
      ballGradient.addColorStop(1, '#f59e0b')
      
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fillStyle = ballGradient
      ctx.fill()
      
      // Add glow effect
      ctx.shadowColor = '#f59e0b'
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      
      // Add highlight
      ctx.beginPath()
      ctx.arc(ball.x - 5, ball.y - 5, 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fill()
    }
    
    // Draw tower structure
    const drawTower = () => {
      // Draw vertical lines
      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate(towerRotation)
      
      ctx.strokeStyle = theme === 'dark' ? '#374151' : '#9ca3af'
      ctx.lineWidth = 1
      
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(towerRadius * Math.cos(angle), -height)
        ctx.lineTo(towerRadius * Math.cos(angle), height)
        ctx.stroke()
      }
      
      ctx.restore()
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
      
      // Update tower rotation based on mouse position
      const targetRotation = Math.atan2(mouseY - height / 2, mouseX - width / 2)
      const rotationDiff = targetRotation - towerRotation
      
      // Normalize rotation difference
      let normalizedDiff = rotationDiff
      if (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2
      if (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2
      
      towerRotation += normalizedDiff * 0.1 * gameSpeed
      
      // Draw tower structure
      drawTower()
      
      // Draw platforms
      platforms.forEach(platform => {
        const yOffset = platform.y - height / 2
        drawPlatform(platform, yOffset)
      })
      
      // Update ball
      if (ball.falling) {
        ball.velocity += 0.5
        ball.y += ball.velocity * gameSpeed
        
        // Check collision with platforms
        platforms.forEach((platform, index) => {
          const ballDistance = Math.sqrt(
            Math.pow(ball.x - width / 2, 2) + Math.pow(ball.y - height / 2, 2)
          )
          
          if (
            ball.y + ball.radius >= platform.y && 
            ball.y - ball.radius <= platform.y + platformHeight &&
            ballDistance >= towerRadius - platformHeight - ball.radius &&
            ballDistance <= towerRadius + ball.radius
          ) {
            if (!isInGap(platform)) {
              if (platform.dangerous) {
                setGameOver(true)
                return
              }
              
              ball.falling = false
              ball.y = platform.y - ball.radius
              ball.velocity = 0
              ball.platformIndex = index
              
              if (!platform.passed) {
                platform.passed = true
                setScore(prevScore => prevScore + 10)
              }
            }
          }
        })
        
        // Ball fell through the bottom
        if (ball.y - ball.radius > height) {
          setGameOver(true)
          return
        }
      } else {
        // Ball is on platform, check if it can fall through gap
        const currentPlatform = platforms[ball.platformIndex]
        
        if (currentPlatform && isInGap(currentPlatform)) {
          ball.falling = true
          ball.velocity = 0
          setScore(prevScore => prevScore + 20)
        }
      }
      
      // Move platforms up if ball reaches top area
      if (ball.y < height / 4) {
        const diff = height / 4 - ball.y
        ball.y += diff * 0.2
        
        platforms.forEach(platform => {
          platform.y += diff * 0.2
        })
        
        // Remove platforms that go below screen and add new ones at top
        if (platforms[0].y > height + platformHeight) {
          platforms.shift()
          
          const topPlatform = platforms[platforms.length - 1]
          const newY = topPlatform.y - platformGap
          const colors = [
            '#ef4444', '#f97316', '#eab308', '#22c55e', 
            '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'
          ]
          
          platforms.push({
            y: newY,
            gapPosition: Math.random() * Math.PI * 2,
            gapWidth: Math.PI * (0.25 + Math.random() * 0.2),
            dangerous: Math.random() < 0.2 + (level * 0.05),
            color: colors[Math.floor(Math.random() * colors.length)],
            passed: false
          })
          
          // Increase level every 10 platforms
          if (platforms.length % 10 === 0) {
            setLevel(prevLevel => {
              const newLevel = prevLevel + 1
              gameSpeed = 1 + (newLevel * 0.15)
              return newLevel
            })
          }
        }
      }
      
      // Draw ball
      drawBall()
      
      // Draw UI
      ctx.font = 'bold 24px Arial'
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
      ctx.textAlign = 'left'
      ctx.fillText(`Score: ${score}`, 20, 40)
      
      ctx.textAlign = 'right'
      ctx.fillText(`Level: ${level}`, width - 20, 40)
      
      ctx.textAlign = 'center'
      ctx.fillText(`High: ${highScore}`, width / 2, 40)
      
    }, 1000 / 60) // 60 FPS
    
    return () => {
      clearInterval(gameLoop)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
    }
  }, [gameStarted, gameOver, level, theme, highScore])

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setLevel(1)
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
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="text-4xl font-bold font-orbitron mb-8"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
              }}>
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Helix Jump
            </span>
          </h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-6 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            {!gameStarted ? (
              <div className="text-center">
                <div className="mb-6">
                  <p className="text-lg mb-4">
                    Guide the ball down the spiral tower through the gaps!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Move your mouse or finger to rotate the tower. Avoid red platforms!
                  </p>
                  <p className="text-lg font-semibold">High Score: {highScore}</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="py-3 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold font-orbitron rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  Start Jumping
                </motion.button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center flex-wrap gap-4">
                  <div className="text-xl font-bold font-orbitron">Score: {score}</div>
                  <div className="text-lg">Level: {level}</div>
                  <div className="text-lg">High: {highScore}</div>
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
                    height={700} 
                    className="block max-w-full h-auto"
                  />
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Move your mouse or finger to rotate the tower. Avoid red platforms!
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
        message={`Game Over! You reached level ${level}.`}
        onRestart={resetGame}
      />
    </div>
  )
}

export default HelixJumpPage