import { motion, AnimatePresence } from 'framer-motion'
import { FaTrophy, FaSkull, FaStar, FaRedo, FaHome } from 'react-icons/fa'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'

const GameResultModal = ({ 
  isOpen, 
  onClose, 
  result, // 'win', 'lose', 'draw'
  score, 
  message, 
  onRestart,
  showScore = true,
  showRestart = true 
}) => {
  const { theme } = useTheme()

  const getResultConfig = () => {
    switch (result) {
      case 'win':
        return {
          icon: FaTrophy,
          title: 'Victory!',
          gradient: 'from-yellow-400 to-orange-500',
          bgGradient: 'from-green-400/20 to-yellow-400/20',
          iconColor: 'text-yellow-400'
        }
      case 'lose':
        return {
          icon: FaSkull,
          title: 'Game Over',
          gradient: 'from-red-500 to-pink-500',
          bgGradient: 'from-red-400/20 to-pink-400/20',
          iconColor: 'text-red-400'
        }
      case 'draw':
        return {
          icon: FaStar,
          title: 'Draw!',
          gradient: 'from-blue-500 to-purple-500',
          bgGradient: 'from-blue-400/20 to-purple-400/20',
          iconColor: 'text-blue-400'
        }
      default:
        return {
          icon: FaStar,
          title: 'Game Complete',
          gradient: 'from-purple-500 to-cyan-500',
          bgGradient: 'from-purple-400/20 to-cyan-400/20',
          iconColor: 'text-purple-400'
        }
    }
  }

  const config = getResultConfig()
  const IconComponent = config.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`relative max-w-md w-full ${theme === 'dark' ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-md rounded-2xl p-8 text-center border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} rounded-2xl`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center shadow-lg`}
              >
                <IconComponent className="text-3xl text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold font-orbitron mb-4"
              >
                <span className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                  {config.title}
                </span>
              </motion.h2>

              {/* Message */}
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`text-lg mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  {message}
                </motion.p>
              )}

              {/* Score */}
              {showScore && score !== undefined && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-2xl font-bold font-orbitron mb-6 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'} backdrop-blur-sm`}
                >
                  <span className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                    Score: {score}
                  </span>
                </motion.div>
              )}

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4"
              >
                {showRestart && onRestart && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRestart}
                    className={`flex-1 py-3 px-4 bg-gradient-to-r ${config.gradient} text-white font-bold font-orbitron rounded-xl transition-all duration-300 hover:shadow-lg`}
                  >
                    <FaRedo className="inline mr-2" />
                    Play Again
                  </motion.button>
                )}
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Link
                    to="/home"
                    className={`block w-full py-3 px-4 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-current font-bold font-orbitron rounded-xl transition-all duration-300`}
                  >
                    <FaHome className="inline mr-2" />
                    Home
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Floating particles */}
            {result === 'win' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: `${20 + (i % 4) * 20}%`,
                      top: `${20 + Math.floor(i / 4) * 20}%`,
                    }}
                    animate={{
                      y: [-10, -30, -10],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GameResultModal