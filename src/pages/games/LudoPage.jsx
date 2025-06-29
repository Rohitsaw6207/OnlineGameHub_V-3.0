import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'
import GameResultModal from '../../components/common/GameResultModal'

const LudoPage = () => {
  const { theme } = useTheme()
  const [gameMode, setGameMode] = useState(null) // '1v1-computer', '1v1-local', '4-player-local'
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState(0) // 0: Red, 1: Green, 2: Yellow, 3: Blue
  const [diceValue, setDiceValue] = useState(null)
  const [isRolling, setIsRolling] = useState(false)
  const [players, setPlayers] = useState([])
  const [gameBoard, setGameBoard] = useState([])
  const [playerPieces, setPlayerPieces] = useState({})
  const [winner, setWinner] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [selectedPiece, setSelectedPiece] = useState(null)

  useEffect(() => {
    document.title = 'Ludo - Online Game Hub'
  }, [])

  useEffect(() => {
    if (winner) {
      setShowResultModal(true)
    }
  }, [winner])

  const playerColors = ['red', 'green', 'yellow', 'blue']
  const playerNames = ['Red', 'Green', 'Yellow', 'Blue']

  // Initialize game board and pieces
  const initializeGame = (mode) => {
    setGameMode(mode)
    let playerSetup = []
    
    switch (mode) {
      case '1v1-computer':
        playerSetup = ['human', 'computer']
        break
      case '1v1-local':
        playerSetup = ['human', 'human']
        break
      case '4-player-local':
        playerSetup = ['human', 'human', 'human', 'human']
        break
    }
    
    setPlayers(playerSetup)
    setCurrentPlayer(0)
    setDiceValue(null)
    setWinner(null)
    
    // Initialize player pieces
    const pieces = {}
    for (let i = 0; i < playerSetup.length; i++) {
      pieces[i] = [
        { id: 0, position: 'home', homeIndex: 0 },
        { id: 1, position: 'home', homeIndex: 1 },
        { id: 2, position: 'home', homeIndex: 2 },
        { id: 3, position: 'home', homeIndex: 3 }
      ]
    }
    setPlayerPieces(pieces)
    setGameStarted(true)
  }

  const rollDice = () => {
    if (isRolling) return
    
    setIsRolling(true)
    setSelectedPiece(null)
    
    // Simulate dice rolling animation
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1)
    }, 100)
    
    // Stop rolling after 1 second
    setTimeout(() => {
      clearInterval(rollInterval)
      const finalValue = Math.floor(Math.random() * 6) + 1
      setDiceValue(finalValue)
      setIsRolling(false)
      
      // Check if current player can move any piece
      const canMove = canPlayerMove(currentPlayer, finalValue)
      
      if (!canMove) {
        // No valid moves, switch to next player
        setTimeout(() => {
          switchToNextPlayer()
        }, 1500)
      } else if (players[currentPlayer] === 'computer') {
        // Computer makes move
        setTimeout(() => {
          makeComputerMove(finalValue)
        }, 1000)
      }
    }, 1000)
  }

  const canPlayerMove = (playerIndex, diceValue) => {
    const pieces = playerPieces[playerIndex]
    if (!pieces) return false
    
    return pieces.some(piece => {
      if (piece.position === 'home') {
        return diceValue === 6 // Can only move out of home with 6
      } else if (piece.position === 'finished') {
        return false
      } else {
        return true // Can move pieces on board
      }
    })
  }

  const makeComputerMove = (diceValue) => {
    const pieces = playerPieces[currentPlayer]
    const movablePieces = pieces.filter(piece => {
      if (piece.position === 'home') {
        return diceValue === 6
      } else if (piece.position === 'finished') {
        return false
      } else {
        return true
      }
    })
    
    if (movablePieces.length > 0) {
      // Simple AI: prioritize moving pieces out of home, then move furthest piece
      let selectedPiece = movablePieces[0]
      
      // Prefer moving pieces out of home
      const homePieces = movablePieces.filter(p => p.position === 'home')
      if (homePieces.length > 0 && diceValue === 6) {
        selectedPiece = homePieces[0]
      } else {
        // Move the piece that's furthest along
        selectedPiece = movablePieces.reduce((furthest, current) => {
          if (current.position === 'home') return furthest
          return (current.boardPosition || 0) > (furthest.boardPosition || 0) ? current : furthest
        })
      }
      
      movePiece(currentPlayer, selectedPiece.id, diceValue)
    }
    
    setTimeout(() => {
      if (diceValue !== 6) {
        switchToNextPlayer()
      }
    }, 1000)
  }

  const movePiece = (playerIndex, pieceId, steps) => {
    const newPlayerPieces = { ...playerPieces }
    const piece = newPlayerPieces[playerIndex].find(p => p.id === pieceId)
    
    if (!piece) return
    
    if (piece.position === 'home' && steps === 6) {
      // Move piece out of home to starting position
      piece.position = 'board'
      piece.boardPosition = playerIndex * 13 // Starting position for each player
    } else if (piece.position === 'board') {
      // Move piece on board
      const newPosition = (piece.boardPosition + steps) % 52
      piece.boardPosition = newPosition
      
      // Check if piece reached home stretch
      const homeStretchStart = playerIndex * 13 + 51
      if (newPosition >= homeStretchStart - 6 && newPosition <= homeStretchStart) {
        // Check if piece finished
        if (newPosition === homeStretchStart) {
          piece.position = 'finished'
        }
      }
    }
    
    setPlayerPieces(newPlayerPieces)
    
    // Check for winner
    const finishedPieces = newPlayerPieces[playerIndex].filter(p => p.position === 'finished')
    if (finishedPieces.length === 4) {
      setWinner(playerIndex)
    }
  }

  const switchToNextPlayer = () => {
    const nextPlayer = (currentPlayer + 1) % players.length
    setCurrentPlayer(nextPlayer)
    setDiceValue(null)
    
    // If next player is computer, auto-roll after delay
    if (players[nextPlayer] === 'computer') {
      setTimeout(() => {
        rollDice()
      }, 1000)
    }
  }

  const handlePieceClick = (playerIndex, pieceId) => {
    if (playerIndex !== currentPlayer || players[currentPlayer] === 'computer' || !diceValue) return
    
    const piece = playerPieces[playerIndex].find(p => p.id === pieceId)
    if (!piece) return
    
    // Check if piece can move
    if (piece.position === 'home' && diceValue !== 6) return
    if (piece.position === 'finished') return
    
    movePiece(playerIndex, pieceId, diceValue)
    
    // Switch player if didn't roll 6
    if (diceValue !== 6) {
      setTimeout(() => {
        switchToNextPlayer()
      }, 500)
    } else {
      setDiceValue(null) // Allow another roll
    }
  }

  const renderDice = () => {
    if (!diceValue) {
      return (
        <div className={`w-16 h-16 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} flex items-center justify-center border-2 border-gray-400 shadow-lg`}>
          <span className="text-2xl">?</span>
        </div>
      )
    }
    
    const dotPositions = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    }
    
    const positions = dotPositions[diceValue]
    
    return (
      <div className={`w-16 h-16 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} relative ${isRolling ? 'animate-bounce' : ''} border-2 border-gray-400 shadow-lg`}>
        {positions.map((position, index) => {
          let positionClass = ''
          
          switch (position) {
            case 'top-left':
              positionClass = 'top-2 left-2'
              break
            case 'top-right':
              positionClass = 'top-2 right-2'
              break
            case 'middle-left':
              positionClass = 'top-1/2 left-2 transform -translate-y-1/2'
              break
            case 'middle-right':
              positionClass = 'top-1/2 right-2 transform -translate-y-1/2'
              break
            case 'bottom-left':
              positionClass = 'bottom-2 left-2'
              break
            case 'bottom-right':
              positionClass = 'bottom-2 right-2'
              break
            case 'center':
              positionClass = 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
              break
          }
          
          return (
            <div 
              key={index} 
              className={`absolute ${positionClass} w-3 h-3 rounded-full bg-black`}
            />
          )
        })}
      </div>
    )
  }

  const renderGameBoard = () => {
    return (
      <div className="relative w-full max-w-2xl mx-auto aspect-square">
        {/* Main board container */}
        <div className="grid grid-cols-15 gap-0 w-full h-full border-4 border-gray-800 rounded-lg overflow-hidden">
          {/* Top section */}
          <div className="col-span-6 row-span-6 grid grid-cols-3 grid-rows-3 gap-1 p-2 bg-green-600">
            {/* Green home area */}
            {[0, 1, 2, 3].map(index => (
              <div 
                key={`green-${index}`}
                className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => handlePieceClick(1, index)}
              >
                {playerPieces[1] && playerPieces[1][index] && playerPieces[1][index].position === 'home' && (
                  <div className="w-6 h-6 bg-green-800 rounded-full border-2 border-white"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Top path */}
          <div className="col-span-3 row-span-6 grid grid-rows-6 gap-0">
            {[...Array(6)].map((_, index) => (
              <div key={`top-path-${index}`} className="bg-white border border-gray-300 flex items-center justify-center">
                {/* Path squares */}
              </div>
            ))}
          </div>
          
          <div className="col-span-6 row-span-6 grid grid-cols-3 grid-rows-3 gap-1 p-2 bg-yellow-500">
            {/* Yellow home area */}
            {[0, 1, 2, 3].map(index => (
              <div 
                key={`yellow-${index}`}
                className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => handlePieceClick(2, index)}
              >
                {playerPieces[2] && playerPieces[2][index] && playerPieces[2][index].position === 'home' && (
                  <div className="w-6 h-6 bg-yellow-700 rounded-full border-2 border-white"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Middle section */}
          <div className="col-span-6 row-span-3 grid grid-cols-6 gap-0">
            {[...Array(6)].map((_, index) => (
              <div key={`left-path-${index}`} className="bg-white border border-gray-300 flex items-center justify-center">
                {/* Left path squares */}
              </div>
            ))}
          </div>
          
          {/* Center triangle */}
          <div className="col-span-3 row-span-3 bg-gradient-to-br from-red-500 via-green-500 via-yellow-500 to-blue-500 flex items-center justify-center">
            <div className="text-white font-bold text-lg">🏠</div>
          </div>
          
          <div className="col-span-6 row-span-3 grid grid-cols-6 gap-0">
            {[...Array(6)].map((_, index) => (
              <div key={`right-path-${index}`} className="bg-white border border-gray-300 flex items-center justify-center">
                {/* Right path squares */}
              </div>
            ))}
          </div>
          
          {/* Bottom section */}
          <div className="col-span-6 row-span-6 grid grid-cols-3 grid-rows-3 gap-1 p-2 bg-red-600">
            {/* Red home area */}
            {[0, 1, 2, 3].map(index => (
              <div 
                key={`red-${index}`}
                className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => handlePieceClick(0, index)}
              >
                {playerPieces[0] && playerPieces[0][index] && playerPieces[0][index].position === 'home' && (
                  <div className="w-6 h-6 bg-red-800 rounded-full border-2 border-white"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Bottom path */}
          <div className="col-span-3 row-span-6 grid grid-rows-6 gap-0">
            {[...Array(6)].map((_, index) => (
              <div key={`bottom-path-${index}`} className="bg-white border border-gray-300 flex items-center justify-center">
                {/* Path squares */}
              </div>
            ))}
          </div>
          
          <div className="col-span-6 row-span-6 grid grid-cols-3 grid-rows-3 gap-1 p-2 bg-blue-600">
            {/* Blue home area */}
            {gameMode === '4-player-local' && [0, 1, 2, 3].map(index => (
              <div 
                key={`blue-${index}`}
                className="bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => handlePieceClick(3, index)}
              >
                {playerPieces[3] && playerPieces[3][index] && playerPieces[3][index].position === 'home' && (
                  <div className="w-6 h-6 bg-blue-800 rounded-full border-2 border-white"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const resetGame = () => {
    setGameMode(null)
    setGameStarted(false)
    setCurrentPlayer(0)
    setDiceValue(null)
    setIsRolling(false)
    setPlayers([])
    setPlayerPieces({})
    setWinner(null)
    setShowResultModal(false)
    setSelectedPiece(null)
  }

  if (!gameMode) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
        <div className="animated-bg"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md mx-auto text-center"
          >
            <h1 className="text-4xl font-bold font-orbitron mb-8"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
                }}>
              <span className="bg-gradient-to-r from-red-400 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
                Ludo
              </span>
            </h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-6">Select Game Mode</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => initializeGame('1v1-computer')}
                  className="py-4 px-6 bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
                >
                  1 vs 1 (vs Computer)
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => initializeGame('1v1-local')}
                  className="py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  1 vs 1 (Local)
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => initializeGame('4-player-local')}
                  className="py-4 px-6 bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                >
                  4 Player (Local)
                </motion.button>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                Roll a 6 to move pieces out of home. First to get all 4 pieces to the center wins!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
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
            <span className="bg-gradient-to-r from-red-400 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
              Ludo
            </span>
          </h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-6 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Game Status */}
            <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
              <div className="text-xl font-bold font-orbitron">
                Current Player: <span className={`capitalize text-${playerColors[currentPlayer]}-600`}>
                  {playerNames[currentPlayer]} ({players[currentPlayer]})
                </span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="py-2 px-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg transition-all duration-300"
              >
                New Game
              </motion.button>
            </div>
            
            {/* Game Board */}
            <div className="mb-6">
              {renderGameBoard()}
            </div>
            
            {/* Dice and Controls */}
            <div className="flex flex-col items-center justify-center space-y-6">
              {renderDice()}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={rollDice}
                disabled={isRolling || players[currentPlayer] === 'computer' || (diceValue && diceValue === 6)}
                className={`py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold font-orbitron rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 ${
                  isRolling || players[currentPlayer] === 'computer' || (diceValue && diceValue === 6) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isRolling ? 'Rolling...' : 'Roll Dice'}
              </motion.button>
              
              {diceValue && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {diceValue === 6 ? 'You rolled a 6! You get another turn!' : `You rolled ${diceValue}. Click a piece to move it.`}
                </p>
              )}
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Roll a 6 to move pieces out of home. Get all 4 pieces to the center to win!
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <GameResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result="win"
        message={`${playerNames[winner]} wins the game!`}
        onRestart={resetGame}
        showScore={false}
      />
    </div>
  )
}

export default LudoPage