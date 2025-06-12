import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

const HelixJumpPage = () => {
  const { theme } = useTheme()
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [level, setLevel] = useState(1)
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
    const numberOfPlatforms = 8
    let rotationSpeed = 0.02
    let ballFallSpeed = 5
    let gameSpeed = 1 + (level * 0.2)
    
    // Game objects
    const ball = {
      x: width / 2,
      y: 50,
      radius: ballRadius,
      falling: true,
      platformIndex: -1
    }
    
    // Tower rotation
    let towerRotation = 0
    
    // Create platforms with some gaps
    const createPlatforms = () => {
      const platforms = []
      for (let i = 0; i < numberOfPlatforms; i++) {
        const y = height - (i * platformGap) - platformHeight
        
        // Each platform has a random gap width
        const gapWidth = Math.PI * (0.2 + Math.random() * 0.3)
        
        // Random gap position
        const gapPosition = Math.random() * Math.PI * 2
        
        platforms.push({
          y,
          gapPosition,
          gapWidth,
          dangerous: i % 3 === 1 // Every third platform has dangerous zones
        })
      }
      return platforms
    }
    
    let platforms = createPlatforms()
    
    // Input handlers
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left - width / 2
      const mouseY = e.clientY - rect.top - height / 2
      
      // Calculate angle from center to mouse
      const angle = Math.atan2(mouseY, mouseX)
      
      // Determine rotation direction based on mouse position
      const targetRotation = angle
      
      // Determine shortest direction to rotate
      const diff = targetRotation - towerRotation
      if (Math.abs(diff) > 0.1) {
        if (diff > 0 && diff < Math.PI || diff < -Math.PI) {
          towerRotation += rotationSpeed * gameSpeed
        } else {
          towerRotation -= rotationSpeed * gameSpeed
        }
        
        // Keep rotation within 0-2π
        if (towerRotation > Math.PI * 2) towerRotation -= Math.PI * 2
        if (towerRotation < 0) towerRotation += Math.PI * 2
      }
    }
    
    // Touch handlers for mobile
    const handleTouchMove = (e) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const touchX = e.touches[0].clientX - rect.left - width / 2
      const touchY = e.touches[0].clientY - rect.top - height / 2
      
      // Calculate angle from center to touch
      const angle = Math.atan2(touchY, touchX)
      
      // Determine rotation direction based on touch position
      const targetRotation = angle
      
      // Determine shortest direction to rotate
      const diff = targetRotation - towerRotation
      if (Math.abs(diff) > 0.1) {
        if (diff > 0 && diff < Math.PI || diff < -Math.PI) {
          towerRotation += rotationSpeed * gameSpeed
        } else {
          towerRotation -= rotationSpeed * gameSpeed
        }
        
        // Keep rotation within 0-2π
        if (towerRotation > Math.PI * 2) towerRotation -= Math.PI * 2
        if (towerRotation < 0) towerRotation += Math.PI * 2
      }
    }
    
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    
    // Check if ball is in a platform gap
    const isInGap = (platform) => {
      // Calculate ball angle relative to tower center
      const ballAngle = towerRotation
      
      // Check if ball angle is within the gap
      const gapStart = platform.gapPosition
      const gapEnd = platform.gapPosition + platform.gapWidth
      
      // Normalize angles for comparison
      const normalizedBallAngle = (ballAngle + Math.PI * 4) % (Math.PI * 2)
      const normalizedGapStart = (gapStart + Math.PI * 4) % (Math.PI * 2)
      let normalizedGapEnd = (gapEnd + Math.PI * 4) % (Math.PI * 2)
      
      // Handle case where gap crosses 0/2π boundary
      if (normalizedGapEnd < normalizedGapStart) {
        normalizedGapEnd += Math.PI * 2
      }
      
      // Check if ball is in gap or if it's in a dangerous zone on a dangerous platform
      if (platform.dangerous) {
        // For dangerous platforms, the gap is safe, and the rest is dangerous
        return normalizedBallAngle >= normalizedGapStart && normalizedBallAngle <= normalizedGapEnd
      } else {
        // For normal platforms, the gap is the hole to fall through
        return normalizedBallAngle >= normalizedGapStart && normalizedBallAngle <= normalizedGapEnd
      }
    }
    
    // Draw platform
    const drawPlatform = (platform) => {
      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate(towerRotation)
      
      // Draw platform circle with a gap
      ctx.beginPath()
      ctx.arc(0, 0, towerRadius, 0, Math.PI * 2)
      ctx.arc(0, 0, towerRadius - 20, Math.PI * 2, 0, true) // Inner circle (hollow)
      
      // Cut out the gap
      ctx.moveTo(towerRadius * Math.cos(platform.gapPosition), towerRadius * Math.sin(platform.gapPosition))
      ctx.arc(0, 0, towerRadius, platform.gapPosition, platform.gapPosition + platform.gapWidth)
      ctx.arc(0, 0, towerRadius - 20, platform.gapPosition + platform.gapWidth, platform.gapPosition, true)
      
      // Set platform color based on type
      if (platform.dangerous) {
        ctx.fillStyle = theme === 'dark' ? '#EF4444' : '#DC2626' // Red for dangerous
      } else {
        ctx.fillStyle = theme === 'dark' ? '#3B82F6' : '#2563EB' // Blue for normal
      }
      
      ctx.fill()
      ctx.restore()
    }
    
    // Draw ball
    const drawBall = () => {
      ctx.beginPath()
      ctx.arc(width / 2, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fillStyle = theme === 'dark' ? '#F59E0B' : '#D97706' // Orange ball
      ctx.fill()
      
      // Add shading
      const gradient = ctx.createRadialGradient(
        width / 2 - 5, ball.y - 5, 1,
        width / 2, ball.y, ball.radius
      )
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      
      ctx.beginPath()
      ctx.arc(width / 2, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    }
    
    // Draw tower
    const drawTower = () => {
      // Draw tower body (vertical lines)
      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate(towerRotation)
      
      ctx.strokeStyle = theme === 'dark' ? '#94A3B8' : '#64748B'
      ctx.lineWidth = 2
      
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(towerRadius * Math.cos(angle), -height / 2)
        ctx.lineTo(towerRadius * Math.cos(angle), height / 2)
        ctx.stroke()
      }
      
      ctx.restore()
      
      // Draw platforms
      platforms.forEach(platform => {
        ctx.save()
        ctx.translate(0, platform.y - height / 2)
        drawPlatform(platform)
        ctx.restore()
      })
    }
    
    // Game loop
    const gameLoop = setInterval(() => {
      if (gameOver) return
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw background
      ctx.fillStyle = theme === 'dark' ? '#0F172A' : '#F0F9FF'
      ctx.fillRect(0, 0, width, height)
      
      // Draw tower
      drawTower()
      
      // Update ball
      if (ball.falling) {
        ball.y += ballFallSpeed * gameSpeed
        
        // Check collision with platforms
        platforms.forEach((platform, index) => {
          if (
            ball.y + ball.radius >= platform.y && 
            ball.y - ball.radius <= platform.y + platformHeight &&
            ball.y + ball.radius <= platform.y + platformHeight + ballFallSpeed * gameSpeed
          ) {
            if (!isInGap(platform)) {
              // Ball landed on platform
              ball.falling = false
              ball.y = platform.y - ball.radius
              ball.platformIndex = index
              
              // Game over if landed on dangerous part of dangerous platform
              if (platform.dangerous && !isInGap(platform)) {
                setGameOver(true)
                return
              }
              
              // Add score for successful landing
              setScore(prevScore => prevScore + 10)
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
        
        if (isInGap(currentPlatform)) {
          ball.falling = true
          setScore(prevScore => prevScore + 50) // Bonus for falling through gap
        }
      }
      
      // Move platforms up if ball reaches top half of screen
      if (ball.y < height / 3) {
        const diff = height / 3 - ball.y
        ball.y += diff * 0.1
        
        platforms.forEach(platform => {
          platform.y += diff * 0.1
        })
        
        // Remove platforms that go below screen and add new ones at top
        if (platforms[0].y > height + platformHeight) {
          platforms.shift()
          
          // Add new platform at top
          const topPlatform = platforms[platforms.length - 1]
          const newY = topPlatform.y - platformGap
          
          // Increase difficulty by adding more dangerous platforms
          const isDangerous = Math.random() < 0.3 + (level * 0.05)
          
          platforms.push({
            y: newY,
            gapPosition: Math.random() * Math.PI * 2,
            gapWidth: Math.PI * (0.2 + Math.random() * 0.3),
            dangerous: isDangerous
          })
          
          // Increase level every 8 platforms
          if (platforms.length % 8 === 0) {
            setLevel(prevLevel => {
              const newLevel = prevLevel + 1
              gameSpeed = 1 + (newLevel * 0.2)
              return newLevel
            })
          }
        }
      }
      
      // Draw ball
      drawBall()
      
      // Draw score
      ctx.font = 'bold 20px Arial'
      ctx.fillStyle = theme === 'dark' ? '#FFFFFF' : '#000000'
      ctx.textAlign = 'left'
      ctx.fillText(`Score: ${score}`, 20, 30)
      
      // Draw level
      ctx.textAlign = 'right'
      ctx.fillText(`Level: ${level}`, width - 20, 30)
      
    }, 1000 / 60) // 60 FPS
    
    return () => {
      clearInterval(gameLoop)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
    }
  }, [gameStarted, gameOver, level, theme])

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setLevel(1)
    setGameOver(false)
  }

  if (gameOver) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-8">Helix Jump</h1>
            
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

  if (!gameStarted) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-8">Helix Jump</h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className="text-xl font-semibold mb-4">How to Play</h2>
              <p className="mb-6">
                Move your mouse or finger to rotate the tower. Guide the ball through the gaps in the platforms.
                Avoid red platforms and try to reach the highest score!
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
          <h1 className="text-3xl font-bold mb-8">Helix Jump</h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={600} 
              className={`border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} mx-auto`}
            />
            
            <div className="mt-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Move your mouse or finger to rotate the tower. Guide the ball through the gaps in the platforms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelixJumpPage