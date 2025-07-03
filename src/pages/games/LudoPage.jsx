import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'
import GameResultModal from '../../components/common/GameResultModal'

const LudoPage = () => {
  const { theme } = useTheme()
  const [gameMode, setGameMode] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [diceValue, setDiceValue] = useState(null)
  const [isRolling, setIsRolling] = useState(false)
  const [players, setPlayers] = useState([])
  const [playerPieces, setPlayerPieces] = useState({})
  const [winner, setWinner] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [boardPositions, setBoardPositions] = useState([])

  useEffect(() => {
    document.title = 'Ludo - Online Game Hub'
  }, [])

  useEffect(() => {
    if (winner !== null) {
      setShowResultModal(true)
    }
  }, [winner])

  const playerColors = ['#ef4444', '#22c55e', '#eab308', '#3b82f6']
  const playerNames = ['Red', 'Green', 'Yellow', 'Blue']

  // Create board path positions
  useEffect(() => {
    const positions = []
    // Create the 52 positions around the board
    for (let i = 0; i < 52; i++) {
      positions.push({ id: i, safe: [0, 8, 13, 21, 26, 34, 39, 47].includes(i) })
    }
    setBoardPositions(positions)
  }, [])

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
    setSelectedPiece(null)
    
    // Initialize player pieces
    const pieces = {}
    for (let i = 0; i < playerSetup.length; i++) {
      pieces[i] = [
        { id: 0, position: 'home', boardPosition: -1, homeIndex: 0 },
        { id: 1, position: 'home', boardPosition: -1, homeIndex: 1 },
        { id: 2, position: 'home', boardPosition: -1, homeIndex: 2 },
        { id: 3, position: 'home', boardPosition: -1, homeIndex: 3 }
      ]
    }
    setPlayerPieces(pieces)
    setGameStarted(true)
  }

  const rollDice = () => {
    if (isRolling) return
    
    setIsRolling(true)
    setSelectedPiece(null)
    
    let rollCount = 0
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1)
      rollCount++
      
      if (rollCount >= 10) {
        clearInterval(rollInterval)
        const finalValue = Math.floor(Math.random() * 6) + 1
        setDiceValue(finalValue)
        setIsRolling(false)
        
        const canMove = canPlayerMove(currentPlayer, finalValue)
        
        if (!canMove) {
          setTimeout(() => {
            switchToNextPlayer()
          }, 1500)
        } else if (players[currentPlayer] === 'computer') {
          setTimeout(() => {
            makeComputerMove(finalValue)
          }, 1000)
        }
      }
    }, 100)
  }

  const canPlayerMove = (playerIndex, diceValue) => {
    const pieces = playerPieces[playerIndex]
    if (!pieces) return false
    
    return pieces.some(piece => {
      if (piece.position === 'home') {
        return diceValue === 6
      } else if (piece.position === 'finished') {
        return false
      } else {
        const newPos = (piece.boardPosition + diceValue) % 52
        return newPos !== piece.boardPosition
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
      let selectedPiece = movablePieces[0]
      
      // AI Strategy: prioritize moving pieces out of home
      const homePieces = movablePieces.filter(p => p.position === 'home')
      if (homePieces.length > 0 && diceValue === 6) {
        selectedPiece = homePieces[0]
      } else {
        // Move the piece closest to finishing
        selectedPiece = movablePieces.reduce((best, current) => {
          const bestDistance = best.position === 'home' ? -1 : (51 - best.boardPosition)
          const currentDistance = current.position === 'home' ? -1 : (51 - current.boardPosition)
          return currentDistance < bestDistance ? current : best
        })
      }
      
      movePiece(currentPlayer, selectedPiece.id, diceValue)
    }
    
    setTimeout(() => {
      if (diceValue !== 6) {
        switchToNextPlayer()
      } else {
        setDiceValue(null)
      }
    }, 1000)
  }

  const movePiece = (playerIndex, pieceId, steps) => {
    const newPlayerPieces = { ...playerPieces }
    const piece = newPlayerPieces[playerIndex].find(p => p.id === pieceId)
    
    if (!piece) return
    
    if (piece.position === 'home' && steps === 6) {
      piece.position = 'board'
      piece.boardPosition = playerIndex * 13
    } else if (piece.position === 'board') {
      const newPosition = piece.boardPosition + steps
      
      if (newPosition >= 52) {
        const homeStretchPosition = newPosition - 52
        if (homeStretchPosition <= 5) {
          piece.boardPosition = 52 + homeStretchPosition
          if (homeStretchPosition === 5) {
            piece.position = 'finished'
          }
        }
      } else {
        piece.boardPosition = newPosition
        
        // Check for capturing other pieces
        Object.keys(newPlayerPieces).forEach(otherPlayerIndex => {
          if (parseInt(otherPlayerIndex) !== playerIndex) {
            newPlayerPieces[otherPlayerIndex].forEach(otherPiece => {
              if (otherPiece.position === 'board' && 
                  otherPiece.boardPosition === newPosition &&
                  !boardPositions[newPosition]?.safe) {
                otherPiece.position = 'home'
                otherPiece.boardPosition = -1
              }
            })
          }
        })
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
    setSelectedPiece(null)
    
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
    
    if (piece.position === 'home' && diceValue !== 6) return
    if (piece.position === 'finished') return
    
    movePiece(playerIndex, pieceId, diceValue)
    
    if (diceValue !== 6) {
      setTimeout(() => {
        switchToNextPlayer()
      }, 500)
    } else {
      setDiceValue(null)
    }
  }

  const renderDice = () => {
    const dotPositions = {
      1: [[1, 1]],
      2: [[0, 0], [2, 2]],
      3: [[0, 0], [1, 1], [2, 2]],
      4: [[0, 0], [0, 2], [2, 0], [2, 2]],
      5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
      6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]]
    }
    
    return (
      <motion.div
        animate={isRolling ? { rotate: [0, 360] } : {}}
        transition={{ duration: 0.5, repeat: isRolling ? Infinity : 0 }}
        className={`w-20 h-20 rounded-xl ${theme === 'dark' ? 'bg-white' : 'bg-white'} border-4 border-gray-800 shadow-2xl flex items-center justify-center relative`}
      >
        {diceValue && (
          <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2">
            {dotPositions[diceValue]?.map(([row, col], index) => (
              <div
                key={index}
                className="w-full h-full flex items-center justify-center"
                style={{ gridRow: row + 1, gridColumn: col + 1 }}
              >
                <div className="w-3 h-3 bg-black rounded-full"></div>
              </div>
            ))}
          </div>
        )}
        {!diceValue && (
          <span className="text-2xl font-bold text-gray-400">?</span>
        )}
      </motion.div>
    )
  }

  const renderGameBoard = () => {
    return (
      <div className="relative w-full max-w-2xl mx-auto aspect-square">
        <div className="w-full h-full border-4 border-gray-800 rounded-2xl overflow-hidden bg-white relative">
          {/* Home areas */}
          {/* Red home (bottom-left) */}
          <div className="absolute bottom-0 left-0 w-2/5 h-2/5 bg-red-500 p-4">
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
              {[0, 1, 2, 3].map(index => (
                <motion.div
                  key={`red-${index}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePieceClick(0, index)}
                  className="bg-white rounded-full flex items-center justify-center cursor-pointer border-2 border-red-700 hover:border-red-900 transition-all"
                >
                  {playerPieces[0] && playerPieces[0][index] && playerPieces[0][index].position === 'home' && (
                    <div className="w-8 h-8 bg-red-700 rounded-full border-2 border-white shadow-lg"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Green home (top-left) */}
          <div className="absolute top-0 left-0 w-2/5 h-2/5 bg-green-500 p-4">
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
              {[0, 1, 2, 3].map(index => (
                <motion.div
                  key={`green-${index}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePieceClick(1, index)}
                  className="bg-white rounded-full flex items-center justify-center cursor-pointer border-2 border-green-700 hover:border-green-900 transition-all"
                >
                  {playerPieces[1] && playerPieces[1][index] && playerPieces[1][index].position === 'home' && (
                    <div className="w-8 h-8 bg-green-700 rounded-full border-2 border-white shadow-lg"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Yellow home (top-right) */}
          <div className="absolute top-0 right-0 w-2/5 h-2/5 bg-yellow-500 p-4">
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
              {[0, 1, 2, 3].map(index => (
                <motion.div
                  key={`yellow-${index}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePieceClick(2, index)}
                  className="bg-white rounded-full flex items-center justify-center cursor-pointer border-2 border-yellow-700 hover:border-yellow-900 transition-all"
                >
                  {playerPieces[2] && playerPieces[2][index] && playerPieces[2][index].position === 'home' && (
                    <div className="w-8 h-8 bg-yellow-700 rounded-full border-2 border-white shadow-lg"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Blue home (bottom-right) */}
          {gameMode === '4-player-local' && (
            <div className="absolute bottom-0 right-0 w-2/5 h-2/5 bg-blue-500 p-4">
              <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
                {[0, 1, 2, 3].map(index => (
                  <motion.div
                    key={`blue-${index}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePieceClick(3, index)}
                    className="bg-white rounded-full flex items-center justify-center cursor-pointer border-2 border-blue-700 hover:border-blue-900 transition-all"
                  >
                    {playerPieces[3] && playerPieces[3][index] && playerPieces[3][index].position === 'home' && (
                      <div className="w-8 h-8 bg-blue-700 rounded-full border-2 border-white shadow-lg"></div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Center finish area */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/5 h-1/5 bg-gradient-to-br from-red-500 via-green-500 via-yellow-500 to-blue-500 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
            <div className="text-white font-bold text-2xl">🏠</div>
          </div>
          
          {/* Path squares around the board */}
          <div className="absolute inset-0">
            {/* This would contain the 52 path squares in a proper Ludo layout */}
            {/* For brevity, showing simplified version */}
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
                Current Player: <span style={{ color: playerColors[currentPlayer] }}>
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
                disabled={isRolling || players[currentPlayer] === 'computer' || (diceValue && diceValue !== 6)}
                className={`py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold font-orbitron rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 ${
                  isRolling || players[currentPlayer] === 'computer' || (diceValue && diceValue !== 6) ? 'opacity-50 cursor-not-allowed' : ''
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