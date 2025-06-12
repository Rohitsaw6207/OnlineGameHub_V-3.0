import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { FaPlay } from 'react-icons/fa'

const GameCard = ({ game, index }) => {
  const { theme } = useTheme()

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05, 
        y: -10,
        rotateY: 5,
        rotateX: 5
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
      className={`group relative overflow-hidden rounded-2xl ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-white/30'} backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'} transition-all duration-500 hover:shadow-2xl hover:border-purple-500/50`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-20 transition-all duration-500`}></div>
      
      {/* Glowing border effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${game.gradient} opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-sm`}></div>
      <div className={`absolute inset-[1px] rounded-2xl ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm`}></div>
      
      {/* Content */}
      <div className="relative p-6 h-full flex flex-col">
        {/* Game Icon */}
        <div className="flex justify-center mb-4">
          <motion.div 
            whileHover={{ 
              scale: 1.2, 
              rotate: 10,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-2xl text-white shadow-lg group-hover:shadow-2xl transition-all duration-300`}
          >
            <span className="text-center">{game.icon}</span>
          </motion.div>
        </div>
        
        {/* Game Title */}
        <div className="text-center mb-3">
          <h3 className="text-xl font-bold font-orbitron group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
            {game.title}
          </h3>
        </div>
        
        {/* Game Description */}
        <div className="text-center mb-4 flex-grow">
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm leading-relaxed`}>
            {game.description}
          </p>
        </div>
        
        {/* Game Info */}
        <div className="flex justify-between items-center mb-4 text-xs">
          <span className={`px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'} backdrop-blur-sm`}>
            {game.category}
          </span>
          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {game.players}
          </span>
        </div>
        
        {/* Play Button */}
        <Link 
          to={game.path} 
          className="group/btn relative w-full"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r ${game.gradient} text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 overflow-hidden`}
          >
            {/* Button background animation */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 group-hover/btn:animate-pulse transition-opacity duration-300"></div>
            
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <FaPlay className="text-sm" />
            </motion.div>
            <span className="relative z-10 font-orbitron">Play Now</span>
          </motion.div>
        </Link>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default GameCard