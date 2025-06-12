import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

const DinoRunPage = () => {
  const { theme } = useTheme()
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
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
    const canvas = canvasRef.current
    if (!canvas || !gameStarted) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // Game settings
    const groundY = height - 50
    let gameSpeed = 6
    const gravity = 0.9
    let spawnTimer = 0
    const obstacleInterval = 100
    
    // Dino properties
    const dinoWidth = 50
    const dinoHeight = 60
    let dinoX = 50
    let dinoY = groundY - dinoHeight
    let dinoVelocityY = 0
    let jumping = false
    let ducking = false
    
    // Obstacles
    const obstacles = []
    const birdY = groundY - 80 // Flying birds are higher than cacti
    
    // Clouds and background
    const clouds = []
    
    // Jump handler
    const handleJump = () => {
      if (!jumping && !gameOver) {
        jumping = true
        dinoVelocityY = -20
      }
    }
    
    // Duck handler
    const handleDuckStart = () => {
      if (!jumping && !gameOver) {
        ducking = true
      }
    }
    
    const handleDuckEnd = () => {
      ducking = false
    }
    
    // Input handlers
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !jumping) {
        handleJump()
      } else if (e.code === 'ArrowDown') {
        handleDuckStart()
      }
    }
    
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowDown') {
        handleDuckEnd()
      }
    }
    
    // Touch and click handlers
    const handleTouchStart = (e) => {
      e.preventDefault()
      handleJump()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    canvas.addEventListener('click', handleJump)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    
    // Create a cloud
    const createCloud = () => {
      clouds.push({
        x: width,
        y: Math.random() * (height / 2),
        width: 60 + Math.random() * 40,
        height: 30,
        speed: 1 + Math.random() * 2
      })
    }
    
    // Initial clouds
    for (let i = 0; i < 3; i++) {
      createCloud()
      clouds[i].x = Math.random() * width
    }
    
    // Spawn obstacles
    const spawnObstacle = () => {
      const type = Math.random() > 0.7 ? 'bird' : 'cactus'
      const obstacleHeight = type === 'bird' ? 30 : 50 + Math.random() * 30
      const obstacleWidth = 30
      
      obstacles.push({
        x: width,
        y: type === 'bird' ? birdY : groundY - obstacleHeight,
        width: obstacleWidth,
        height: obstacleHeight,
        type
      })
    }
    
    // Check collision
    const checkCollision = (obstacle) => {
      // Get current dino dimensions (smaller when ducking)
      const currentDinoHeight = ducking ? dinoHeight / 2 : dinoHeight
      const currentDinoY = ducking ? dinoY + dinoHeight / 2 : dinoY
      
      return (
        dinoX < obstacle.x + obstacle.width &&
        dinoX + dinoWidth > obstacle.x &&
        currentDinoY < obstacle.y + obstacle.height &&
        currentDinoY + currentDinoHeight > obstacle.y
      )
    }
    
    // Draw the dino
    const drawDino = () => {
      ctx.fillStyle = theme === 'dark' ? '#4ADE80' : '#166534'
      
      if (ducking) {
        // Draw a ducking dino (smaller height, longer width)
        ctx.fillRect(dinoX, dinoY + dinoHeight / 2, dinoWidth * 1.2, dinoHeight / 2)
      } else {
        // Draw a standing dino
        ctx.fillRect(dinoX, dinoY, dinoWidth, dinoHeight)
        
        // Draw eyes
        ctx.fillStyle = theme === 'dark' ? '#FFFFFF' : '#000000'
        ctx.fillRect(dinoX + 35, dinoY + 10, 8, 8)
      }
    }
    
    // Draw obstacle
    const drawObstacle = (obstacle) => {
      if (obstacle.type === 'cactus') {
        ctx.fillStyle = theme === 'dark' ? '#4ADE80' : '#166534'
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
      } else if (obstacle.type === 'bird') {
        ctx.fillStyle = theme === 'dark' ? '#93C5FD' : '#1E40AF'
        
        // Bird body
        ctx.beginPath()
        ctx.ellipse(
          obstacle.x + obstacle.width / 2,
          obstacle.y + obstacle.height / 2,
          obstacle.width / 2,
          obstacle.height / 2,
          0, 0, Math.PI * 2
        )
        ctx.fill()
        
        // Wings (flapping)
        const wingOffset = Math.sin(Date.now() / 100) * 10
        ctx.beginPath()
        ctx.ellipse(
          obstacle.x + obstacle.width / 2,
          obstacle.y - 5 + wingOffset,
          obstacle.width / 3,
          obstacle.height / 4,
          0, 0, Math.PI * 2
        )
        ctx.fill()
      }
    }
    
    // Draw cloud
    const drawCloud = (cloud) => {
      ctx.fillStyle = theme === 'dark' ? '#94A3B8' : '#F1F5F9'
      
      // Draw a fluffy cloud with multiple circles
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
    
    // Draw ground
    const drawGround = () => {
      ctx.fillStyle = theme === 'dark' ? '#475569' : '#D1D5DB'
      ctx.fillRect(0, groundY, width, height - groundY)
      
      // Draw a line at the top of the ground
      ctx.strokeStyle = theme === 'dark' ? '#64748B' : '#9CA3AF'
      ctx.beginPath()
      ctx.moveTo(0, groundY)
      ctx.lineTo(width, groundY)
      ctx.stroke()
    }
    
    // Game loop
    const gameLoop = setInterval(() => {
      if (gameOver) return
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw background
      ctx.fillStyle = theme === 'dark' ? '#0F172A' : '#F0F9FF'
      ctx.fillRect(0, 0, width, height)
      
      // Update and draw clouds
      for (let i = 0; i < clouds.length; i++) {
        clouds[i].x -= clouds[i].speed
        
        // Respawn cloud if it goes off screen
        if (clouds[i].x + clouds[i].width < 0) {
          clouds[i].x = width
          clouds[i].y = Math.random() * (height / 2)
        }
        
        drawCloud(clouds[i])
      }
      
      // Update ground
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
      
      // Increase score
      setScore(prevScore => {
        const newScore = prevScore + 1
        
        // Increase game speed every 500 points
        if (newScore % 500 === 0) {
          gameSpeed += 0.5
        }
        
        return newScore
      })
      
      // Draw score
      ctx.font = 'bold 20px Arial'
      ctx.fillStyle = theme === 'dark' ? '#FFFFFF' : '#000000'
      ctx.textAlign = 'right'
      ctx.fillText(`Score: ${score}`, width - 20, 30)
      
    }, 1000 / 60) // 60 FPS
    
    return () => {
      clearInterval(gameLoop)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('click', handleJump)
      canvas.removeEventListener('touchstart', handleTouchStart)
    }
  }, [gameStarted, gameOver, theme])

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setGameOver(false)
  }

  if (gameOver) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-8">Dino Run</h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
              <p className="text-xl mb-2">Your Score: {score}</p>
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
            <h1 className="text-3xl font-bold mb-8">Dino Run</h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className="text-xl font-semibold mb-4">How to Play</h2>
              <p className="mb-6">
                Press Space or Up Arrow to jump over obstacles. Press Down Arrow to duck under flying birds.
                Try to survive as long as possible!
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
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Dino Run</h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={300} 
              className={`border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} mx-auto`}
            />
            
            <div className="mt-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Press Space or Up Arrow to jump. Press Down Arrow to duck.
                You can also tap/click on the game to jump.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DinoRunPage