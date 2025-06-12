import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'

const LudoPage = () => {
  const { theme } = useTheme()
  const [gameMode, setGameMode] = useState(null) // 'oneVsThree', 'twoVsTwo', 'threeVsOne', 'fourPlayer'
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState(0) // 0: Red, 1: Green, 2: Yellow, 3: Blue
  const [diceValue, setDiceValue] = useState(null)
  const [isRolling, setIsRolling] = useState(false)
  const [players, setPlayers] = useState([]) // Will contain player types (human/computer)

  useEffect(() => {
    document.title = 'Ludo - Online Game Hub'
  }, [])

  const setupGame = (mode) => {
    setGameMode(mode)
    let playerSetup = []
    
    switch (mode) {
      case 'oneVsThree':
        playerSetup = ['human', 'computer', 'computer', 'computer']
        break
      case 'twoVsTwo':
        playerSetup = ['human', 'computer', 'human', 'computer']
        break
      case 'threeVsOne':
        playerSetup = ['human', 'human', 'human', 'computer']
        break
      case 'fourPlayer':
        playerSetup = ['human', 'human', 'human', 'human']
        break
      default:
        playerSetup = ['human', 'computer', 'computer', 'computer']
    }
    
    setPlayers(playerSetup)
    setCurrentPlayer(0)
    setDiceValue(null)
    setGameStarted(true)
  }

  const rollDice = () => {
    if (isRolling) return
    
    setIsRolling(true)
    
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
      
      // Move to next player after a delay
      setTimeout(() => {
        setCurrentPlayer((currentPlayer + 1) % 4)
        
        // If the next player is a computer, simulate their turn
        if (players[(currentPlayer + 1) % 4] === 'computer') {
          rollDice()
        }
      }, 1500)
    }, 1000)
  }

  const getPlayerColor = (playerIndex) => {
    const colors = ['red', 'green', 'yellow', 'blue']
    return colors[playerIndex]
  }

  const renderDice = () => {
    if (!diceValue) {
      return (
        <div 
          className={`w-16 h-16 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} flex items-center justify-center border-2 border-gray-400`}
        >
          <span className="text-2xl">?</span>
        </div>
      )
    }
    
    // Array of dot positions for each dice value
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
      <div 
        className={`w-16 h-16 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} relative ${isRolling ? 'animate-bounce' : ''} border-2 border-gray-400`}
      >
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
            default:
              positionClass = ''
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

  if (!gameMode) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-8">Ludo</h1>
            
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h2 className="text-xl font-semibold mb-6">Select Game Mode</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setupGame('oneVsThree')}
                  className="py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  1P vs 3 CPU
                </button>
                
                <button
                  onClick={() => setupGame('twoVsTwo')}
                  className="py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  2P vs 2 CPU
                </button>
                
                <button
                  onClick={() => setupGame('threeVsOne')}
                  className="py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  3P vs 1 CPU
                </button>
                
                <button
                  onClick={() => setupGame('fourPlayer')}
                  className="py-3 px-4 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-lg transition-colors"
                >
                  4 Player (Local)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-12 theme-transition`}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Ludo</h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="mb-6 text-xl font-semibold">
              Current Player: <span className={`capitalize font-bold text-${getPlayerColor(currentPlayer)}-600`}>
                {getPlayerColor(currentPlayer)} ({players[currentPlayer]})
              </span>
            </div>
            
            {/* Simple Ludo board visualization */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              <div className={`bg-red-600 aspect-square rounded-lg p-2`}>
                <div className={`h-full w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded flex items-center justify-center`}>
                  <span className="text-lg font-semibold">Red Home</span>
                </div>
              </div>
              
              <div className={`flex flex-col aspect-square`}>
                <div className="flex-1 flex items-center justify-center border-2 border-gray-300">
                  <span className="text-sm">Path</span>
                </div>
              </div>
              
              <div className={`bg-green-600 aspect-square rounded-lg p-2`}>
                <div className={`h-full w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded flex items-center justify-center`}>
                  <span className="text-lg font-semibold">Green Home</span>
                </div>
              </div>
              
              <div className={`flex flex-col aspect-square`}>
                <div className="flex-1 flex items-center justify-center border-2 border-gray-300">
                  <span className="text-sm">Path</span>
                </div>
              </div>
              
              <div className={`flex flex-col aspect-square`}>
                <div className="flex-1 flex items-center justify-center border-2 border-gray-300 bg-gray-200 dark:bg-gray-700">
                  <span className="text-sm">Finish</span>
                </div>
              </div>
              
              <div className={`flex flex-col aspect-square`}>
                <div className="flex-1 flex items-center justify-center border-2 border-gray-300">
                  <span className="text-sm">Path</span>
                </div>
              </div>
              
              <div className={`bg-yellow-500 aspect-square rounded-lg p-2`}>
                <div className={`h-full w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded flex items-center justify-center`}>
                  <span className="text-lg font-semibold">Yellow Home</span>
                </div>
              </div>
              
              <div className={`flex flex-col aspect-square`}>
                <div className="flex-1 flex items-center justify-center border-2 border-gray-300">
                  <span className="text-sm">Path</span>
                </div>
              </div>
              
              <div className={`bg-blue-600 aspect-square rounded-lg p-2`}>
                <div className={`h-full w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded flex items-center justify-center`}>
                  <span className="text-lg font-semibold">Blue Home</span>
                </div>
              </div>
            </div>
            
            {/* Dice and roll button */}
            <div className="flex flex-col items-center justify-center space-y-6">
              {renderDice()}
              
              <button
                onClick={rollDice}
                disabled={isRolling || players[currentPlayer] === 'computer'}
                className={`py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors ${
                  isRolling || players[currentPlayer] === 'computer' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isRolling ? 'Rolling...' : 'Roll Dice'}
              </button>
            </div>
            
            <div className="mt-8">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Note: This is a simplified version of Ludo. In a full implementation, 
                you would be able to move tokens based on dice rolls.
              </p>
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => setGameMode(null)}
                className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                Change Game Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LudoPage