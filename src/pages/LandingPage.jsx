import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { FaPlay, FaUsers, FaTrophy, FaGamepad } from 'react-icons/fa'

const LandingPage = () => {
  const { theme } = useTheme()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Online Game Hub - Epic Gaming Adventure Awaits'
  }, [])

  const handleStartPlaying = () => {
    // Always redirect to home page - no login required
    navigate('/home')
  }

  const features = [
    {
      icon: <FaPlay className="text-3xl" />,
      title: "Instant Play",
      description: "No downloads required. Jump straight into the action with our web-based games.",
      gradient: "from-purple-500 to-blue-500"
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: "Multiplayer Fun",
      description: "Challenge friends or play against AI in our competitive multiplayer games.",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: <FaTrophy className="text-3xl" />,
      title: "Track Progress",
      description: "Save your progress, track high scores, and unlock achievements as you play.",
      gradient: "from-yellow-500 to-orange-500"
    }
  ]

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold font-orbitron mb-6 leading-tight"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            style={{
              filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
            }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Epic Gaming
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Adventure Awaits
            </span>
          </motion.h1>

          <motion.p 
            className={`text-xl md:text-2xl mb-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto leading-relaxed`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Dive into a world of classic and modern games. From strategic chess battles to 
            fast-paced arcade action, find your next gaming obsession right here.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartPlaying}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold font-orbitron rounded-full text-lg transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 -z-10"></div>
              <FaPlay className="inline mr-2" />
              Start Playing
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold font-orbitron rounded-full text-lg transition-all duration-300 overflow-hidden inline-block"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 -z-10"></div>
                <FaUsers className="inline mr-2" />
                Sign Up Free
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/login"
                className={`px-8 py-4 border-2 ${theme === 'dark' ? 'border-purple-400 text-purple-400 hover:bg-purple-400' : 'border-purple-600 text-purple-600 hover:bg-purple-600'} hover:text-white font-bold font-orbitron rounded-full text-lg transition-all duration-300 inline-block`}
              >
                <FaGamepad className="inline mr-2" />
                Log In
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-orbitron text-center mb-16">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Why Choose Game Hub?
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                className={`relative group p-8 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold font-orbitron mb-4">{feature.title}</h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                  {feature.description}
                </p>

                {/* Hover effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Game Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-10 text-6xl opacity-20"
        >
          ♟️
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/3 right-10 text-6xl opacity-20"
        >
          🎮
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 3, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 left-1/4 text-6xl opacity-20"
        >
          🏆
        </motion.div>
      </div>
    </div>
  )
}

export default LandingPage