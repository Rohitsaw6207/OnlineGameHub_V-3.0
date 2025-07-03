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
    const towerRadius = 120
    const ballRadius = 15
    const platformHeight = 20
    const platformGap = 80
    const numberOfPlatforms = 15
    let gameSpeed = 1 + (level * 0.1)
    
    // Game objects
    const ball = {
      x: width / 2,
      y: 100,
      radius: ballRadius,
      falling: true,
      velocity: 0,
      bounceHeight: 0
    }
    
    // Tower rotation
    let towerRotation = 0
    let mouseX = width / 2
    let targetRotation = 0
    
    // Create platforms with gaps and colors
    const createPlatforms = () => {
      const platforms = []
      const colors = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', 
        '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'
      ]
      
      for (let i = 0; i < numberOfPlatforms; i++) {
        const y = height - (i * platformGap) - platformHeight
        const gapWidth = Math.PI * (0.3 + Math.random() * 0.2)
        const gapPosition = Math.random() * Math.PI * 2
        const dangerous = Math.random() < 0.15 + (level * 0.03)
        
        platforms.push({
          y,
          gapPosition,
          gapWidth,
          dangerous,
          color: colors[i % colors.length],
          passed: false,
          rotation: Math.random() * Math.PI * 2
        })
      }
      return platforms
    }
    
    let platforms = createPlatforms()
    
    // Input handlers
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      targetRotation = ((mouseX - width / 2) / width) * Math.PI * 2
    }
    
    const handleTouchMove = (e) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      mouseX = e.touches[0].clientX - rect.left
      targetRotation = ((mouseX - width / 2) / width) * Math.PI * 2
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
      
      return normalizedBallAngle >= normalizedGapStart && normalizedBallAngle <= normalizedGapEnd
    }
    
    // Draw platform with enhanced graphics
    const drawPlatform = (platform, yOffset) => {
      ctx.save()
      ctx.translate(width / 2, height / 2 + yOffset)
      ctx.rotate(towerRotation + platform.rotation * 0.1)
      
      // Draw platform segments with 3D effect
      const segments = 48
      const angleStep = (Math.PI * 2) / segments
      
      for (let i = 0; i < segments; i++) {
        const angle = i * angleStep
        const nextAngle = (i + 1) * angleStep
        
        // Check if this segment is in the gap
        const inGap = angle >= platform.gapPosition && angle <= platform.gapPosition + platform.gapWidth
        
        if (!inGap) {
          // Create 3D gradient effect
          const gradient = ctx.createRadialGradient(0, 0, towerRadius - platformHeight, 0, 0, towerRadius)
          
          if (platform.dangerous) {
            gradient.addColorStop(0, '#dc2626')
            gradient.addColorStop(0.5, '#ef4444')
            gradient.addColorStop(1, '#fca5a5')
          } else {
            gradient.addColorStop(0, platform.color)
            gradient.addColorStop(0.5, platform.color + 'CC')
            gradient.addColorStop(1, platform.color + '80')
          }
          
          ctx.beginPath()
          ctx.arc(0, 0, towerRadius, angle, nextAngle)
          ctx.arc(0, 0, towerRadius - platformHeight, nextAngle, angle, true)
          ctx.closePath()
          
          ctx.fillStyle = gradient
          ctx.fill()
          
          // Add border and highlights
          ctx.strokeStyle = theme === 'dark' ? '#1f2937' : '#ffffff'
          ctx.lineWidth = 1
          ctx.stroke()
          
          // Add inner highlight
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.arc(0, 0, towerRadius - 2, angle, nextAngle)
          ctx.stroke()
        }
      }
      
      ctx.restore()
    }
    
    // Draw ball with enhanced graphics
    const drawBall = () => {
      // Ball shadow
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.arc(ball.x + 3, ball.y + 3, ball.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      
      // Ball gradient
      const ballGradient = ctx.createRadialGradient(
        ball.x - 5, ball.y - 5, 0,
        ball.x, ball.y, ball.radius
      )
      ballGradient.addColorStop(0, '#ffffff')
      ballGradient.addColorStop(0.3, '#f59e0b')
      ballGradient.addColorStop(1, '#d97706')
      
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fillStyle = ballGradient
      ctx.fill()
      
      // Ball outline
      ctx.strokeStyle = '#92400e'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Add glow effect
      ctx.shadowColor = '#f59e0b'
      ctx.shadowBlur = 20
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      
      // Ball highlight
      ctx.beginPath()
      ctx.arc(ball.x - 4, ball.y - 4, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fill()
    }
    
    // Draw tower structure
    const drawTower = () => {
      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate(towerRotation)
      
      // Draw vertical support lines
      ctx.strokeStyle = theme === 'dark' ? '#374151' : '#9ca3af'
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.3
      
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
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
      
      // Draw beautiful gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
      bgGradient.addColorStop(0, theme === 'dark' ? '#0f172a' : '#f0f9ff')
      bgGradient.addColorStop(0.5, theme === 'dark' ? '#1e293b' : '#e0f2fe')
      bgGradient.addColorStop(1, theme === 'dark' ? '#334155' : '#bae6fd')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)
      
      // Smooth tower rotation
      const rotationDiff = targetRotation - towerRotation
      towerRotation += rotationDiff * 0.1 * gameSpeed
      
      // Draw tower structure
      drawTower()
      
      // Draw platforms
      platforms.forEach(platform => {
        const yOffset = platform.y - height / 2
        drawPlatform(platform, yOffset)
      })
      
      // Update ball physics
      if (ball.falling) {
        ball.velocity += 0.6
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
              ball.bounceHeight = platform.y
              
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
        const currentPlatform = platforms.find(p => 
          Math.abs(ball.y + ball.radius - p.y) < 5
        )
        
        if (currentPlatform && isInGap(currentPlatform)) {
          ball.falling = true
          ball.velocity = 0
          setScore(prevScore => prevScore + 20)
        }
      }
      
      // Move platforms up if ball reaches top area
      if (ball.y < height / 3) {
        const diff = height / 3 - ball.y
        ball.y += diff * 0.3
        
        platforms.forEach(platform => {
          platform.y += diff * 0.3
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
            gapWidth: Math.PI * (0.3 + Math.random() * 0.2),
            dangerous: Math.random() < 0.15 + (level * 0.03),
            color: colors[Math.floor(Math.random() * colors.length)],
            passed: false,
            rotation: Math.random() * Math.PI * 2
          })
          
          // Increase level every 15 platforms
          if (platforms.length % 15 === 0) {
            setLevel(prevLevel => {
              const newLevel = prevLevel + 1
              gameSpeed = 1 + (newLevel * 0.1)
              return newLevel
            })
          }
        }
      }
      
      // Draw ball
      drawBall()
      
      // Draw UI with enhanced styling
      ctx.font = 'bold 24px Arial'
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
      ctx.strokeStyle = theme === 'dark' ? '#000000' : '#ffffff'
      ctx.lineWidth = 3
      
      ctx.textAlign = 'left'
      ctx.strokeText(`Score: ${score}`, 20, 40)
      ctx.fillText(`Score: ${score}`, 20, 40)
      
      ctx.textAlign = 'right'
      ctx.strokeText(`Level: ${level}`, width - 20, 40)
      ctx.fillText(`Level: ${level}`, width - 20, 40)
      
      ctx.textAlign = 'center'
      ctx.strokeText(`High: ${highScore}`, width / 2, 40)
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
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <span className="text-sm opacity-75">High Score</span>
                      <div className="text-2xl font-bold font-orbitron text-blue-500">{highScore}</div>
                    </div>
                  </div>
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
                <div className="mb-4 grid grid-cols-3 gap-4">
                  <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                    <div className="text-sm opacity-75">Score</div>
                    <div className="text-xl font-bold font-orbitron">{score}</div>
                  </div>
                  <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                    <div className="text-sm opacity-75">Level</div>
                    <div className="text-xl font-bold">{level}</div>
                  </div>
                  <div className={`text-center p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                    <div className="text-sm opacity-75">High</div>
                    <div className="text-xl font-bold text-blue-500">{highScore}</div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-xl border-2 border-gray-300 dark:border-gray-600 mx-auto" style={{ width: 'fit-content' }}>
                  <canvas 
                    ref={canvasRef} 
                    width={500} 
                    height={700} 
                    className="block max-w-full h-auto"
                    style={{ maxHeight: '70vh' }}
                  />
                </div>
                
                <div className="mt-4 flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="py-2 px-6 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-lg transition-all duration-300"
                  >
                    Restart
                  </motion.button>
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