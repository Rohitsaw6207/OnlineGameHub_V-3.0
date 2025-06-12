import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

const FlappyBirdPage = () => {
  const { theme } = useTheme()
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
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
    const canvas = canvasRef.current
    if (!canvas || !gameStarted) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // Game settings
    const gravity = 0.5
    const flapStrength = -8
    const pipeWidth = 60
    const pipeGap = 150
    const pipeSpacing = 200
    
    // Game objects
    let birdY = height / 2
    let birdVelocity = 0
    let birdRadius = 15
    
    // Create initial pipes
    let pipes = []
    for (let i = 0; i < 3; i++) {
      pipes.push({
        x: width + i * pipeSpacing,
        topHeight: Math.random() * (height - pipeGap - 100) + 50,
        passed: false
      })
    }
    
    // Flap handler
    const handleFlap = () => {
      if (!gameOver) {
        birdVelocity = flapStrength
      }
    }
    
    // Event listeners
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        handleFlap()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    canvas.addEventListener('click', handleFlap)
    canvas.addEventListener('touchstart', handleFlap)
    
    // Game loop
    const gameLoop = setInterval(() => {
      if (gameOver) return
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw background
      ctx.fillStyle = theme === 'dark' ? '#1E293B' : '#87CEEB'
      ctx.fillRect(0, 0, width, height)
      
      // Update bird position
      birdVelocity += gravity
      birdY += birdVelocity
      
      // Draw bird
      ctx.beginPath()
      ctx.arc(width / 3, birdY, birdRadius, 0, Math.PI * 2)
      ctx.fillStyle = '#FFD700' // Yellow bird
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.stroke()
      
      // Draw and move pipes
      pipes.forEach(pipe => {
        pipe.x -= 2
        
        // Draw top pipe
        ctx.fillStyle = theme === 'dark' ? '#4ADE80' : '#2E8B57'
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight)
        
        // Draw bottom pipe
        ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, height - pipe.topHeight - pipeGap)
        
        // Check for score
        if (pipe.x + pipeWidth < width / 3 && !pipe.passed) {
          pipe.passed = true
          setScore(prevScore => prevScore + 1)
        }
        
        // Check for collision
        if (
          width / 3 + birdRadius > pipe.x &&
          width / 3 - birdRadius < pipe.x + pipeWidth &&
          (birdY - birdRadius < pipe.topHeight || birdY + birdRadius > pipe.topHeight + pipeGap)
        ) {
          setGameOver(true)
        }
      })
      
      // Create new pipes when needed
      if (pipes[0].x < -pipeWidth) {
        pipes.shift()
        pipes.push({
          x: pipes[pipes.length - 1].x + pipeSpacing,
          topHeight: Math.random() * (height - pipeGap - 100) + 50,
          passed: false
        })
      }
      
      // Check for collision with top and bottom
      if (birdY - birdRadius < 0 || birdY + birdRadius > height) {
        setGameOver(true)
      }
      
      // Draw score
      ctx.font = 'bold 30px Arial'
      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 2
      ctx.textAlign = 'center'
      ctx.strokeText(score.toString(), width / 2, 50)
      ctx.fillText(score.toString(), width / 2, 50)
      
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
  }

  const restartGame = () => {
    setGameStarted(false)
    setTimeout(startGame, 10)
  }

  if (gameOver) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-8">Flappy Bird</h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
              <p className="text-xl mb-2">Your Score: {score}</p>
              <p className="text-lg mb-6">High Score: {highScore}</p>
              
              <button
                onClick={restartGame}
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
            <h1 className="text-3xl font-bold mb-8">Flappy Bird</h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className="text-xl font-semibold mb-4">How to Play</h2>
              <p className="mb-6">
                Click or tap the screen, or press the spacebar to make the bird flap. 
                Avoid the pipes and try to get the highest score!
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
          <h1 className="text-3xl font-bold mb-8">Flappy Bird</h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={500} 
              className={`border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} mx-auto`}
            />
            
            <div className="mt-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Click or tap the screen, or press the spacebar to make the bird flap.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlappyBirdPage