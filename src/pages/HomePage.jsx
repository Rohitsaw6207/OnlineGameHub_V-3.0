import { useEffect } from 'react'
import { motion } from 'framer-motion'
import GameCard from '../components/games/GameCard'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const games = [
  {
    id: 1,
    title: 'Tic Tac Toe',
    description: 'Classic strategy game. Get three in a row to win!',
    path: '/tic-tac-toe',
    category: 'Strategy',
    players: '2 Players',
    icon: '⚡',
    gradient: 'from-pink-500 to-red-500'
  },
  {
    id: 2,
    title: 'Snake Game',
    description: 'Navigate the snake, eat food, and grow longer!',
    path: '/snake-game',
    category: 'Arcade',
    players: 'Single Player',
    icon: '🐍',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 3,
    title: 'Sudoku',
    description: 'Fill the grid with numbers. Use logic to solve!',
    path: '/sudoku',
    category: 'Puzzle',
    players: 'Single Player',
    icon: '🧩',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 4,
    title: 'Chess',
    description: 'The ultimate strategy game. Checkmate your opponent!',
    path: '/chess',
    category: 'Strategy',
    players: '2 Players',
    icon: '♛',
    gradient: 'from-purple-500 to-indigo-500'
  },
  {
    id: 5,
    title: 'Pong',
    description: 'Classic arcade tennis. Control the paddle and ball!',
    path: '/pong',
    category: 'Arcade',
    players: 'vs AI',
    icon: '🏓',
    gradient: 'from-orange-500 to-yellow-500'
  },
  {
    id: 6,
    title: 'Flappy Bird',
    description: 'Tap to flap and avoid the pipes. How far can you go?',
    path: '/flappy-bird',
    category: 'Endless',
    players: 'Single Player',
    icon: '🐦',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    id: 7,
    title: 'Ludo',
    description: 'Roll the dice and race your tokens to home!',
    path: '/ludo',
    category: 'Board Game',
    players: '2-4 Players',
    icon: '🎲',
    gradient: 'from-pink-500 to-purple-500'
  },
  {
    id: 8,
    title: 'Breakout',
    description: 'Break all the blocks with your paddle and ball!',
    path: '/breakout',
    category: 'Arcade',
    players: 'Single Player',
    icon: '🧱',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 9,
    title: 'Dino Run',
    description: 'Jump over obstacles in this endless runner!',
    path: '/dino-run',
    category: 'Runner',
    players: 'Single Player',
    icon: '🦕',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    id: 10,
    title: 'Helix Jump',
    description: 'Guide the ball down the spiral tower!',
    path: '/helix-jump',
    category: '3D',
    players: 'Single Player',
    icon: '🌀',
    gradient: 'from-blue-500 to-purple-500'
  }
]

const HomePage = () => {
  const { theme } = useTheme()
  const { currentUser } = useAuth()

  useEffect(() => {
    document.title = 'Featured Games - Online Game Hub'
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="animated-bg"></div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-orbitron mb-6"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
              }}>
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Featured Games
            </span>
          </h1>
          <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Discover our collection of engaging games, from timeless classics to modern favorites
          </p>
          {currentUser ? (
            <motion.p 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`text-lg mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Welcome back, <span className="font-semibold font-orbitron bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">{currentUser.firstName}</span>!
            </motion.p>
          ) : (
            <motion.p 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`text-lg mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Playing as <span className="font-semibold font-orbitron bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Guest</span> - Sign up to save your progress!
            </motion.p>
          )}
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {games.map((game, index) => (
            <motion.div key={game.id} variants={itemVariants}>
              <GameCard game={game} index={index} />
            </motion.div>
          ))}
        </motion.div>

        {/* Why Choose Game Hub Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-orbitron text-center mb-16">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Why Choose Game Hub?
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: '⚡',
                title: "Instant Play",
                description: "No downloads required. Jump straight into the action with our web-based games.",
                gradient: "from-purple-500 to-blue-500"
              },
              {
                icon: '👥',
                title: "Multiplayer Fun",
                description: "Challenge friends or play against AI in our competitive multiplayer games.",
                gradient: "from-green-500 to-teal-500"
              },
              {
                icon: '🏆',
                title: "Track Progress",
                description: currentUser 
                  ? "Save your progress, track high scores, and unlock achievements as you play."
                  : "Sign up to save your progress, track high scores, and unlock achievements!",
                gradient: "from-yellow-500 to-orange-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.2 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                className={`relative group p-8 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold font-orbitron mb-4">{feature.title}</h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                  {feature.description}
                </p>

                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default HomePage