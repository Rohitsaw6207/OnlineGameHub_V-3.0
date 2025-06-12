import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { FaSun, FaMoon, FaUser, FaHome, FaGamepad, FaSignInAlt, FaCog, FaSignOutAlt } from 'react-icons/fa'

const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const { currentUser, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const location = useLocation()

  const toggleDropdown = () => setShowDropdown(!showDropdown)

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
  }

  const isLandingPage = location.pathname === '/' && !currentUser

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 ${theme === 'dark' ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-md border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} transition-all duration-300`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo & Title */}
        <Link to={currentUser ? "/home" : "/"} className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
          >
            <FaGamepad />
          </motion.div>
          <motion.h1 
            className="text-xl md:text-2xl font-bold font-orbitron bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:via-purple-500 group-hover:to-pink-400 transition-all duration-300"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))',
            }}
          >
            Online Game Hub
          </motion.h1>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          
          {/* Home Button */}
          {!isLandingPage && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800 hover:shadow-lg hover:shadow-cyan-500/20' : 'hover:bg-gray-100 hover:shadow-lg hover:shadow-cyan-500/20'} transition-all duration-300 relative overflow-hidden group`}
              title="Home"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
              <Link to="/home" className="relative z-10">
                <FaHome className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-700'} group-hover:text-cyan-400 transition-colors`} />
              </Link>
            </motion.button>
          )}

          {/* Theme Toggle */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`p-3 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800 hover:shadow-lg hover:shadow-yellow-500/20' : 'hover:bg-gray-100 hover:shadow-lg hover:shadow-yellow-500/20'} transition-all duration-300 relative overflow-hidden group`}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
            <AnimatePresence mode="wait">
              {theme === 'dark' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <FaSun className="text-xl text-yellow-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <FaMoon className="text-xl text-gray-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* User Profile */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDropdown}
              className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500 bg-gradient-to-br from-purple-500 to-cyan-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
              title="User menu"
            >
              {currentUser ? (
                <img 
                  src={currentUser.profilePicture || '/male-avatar.png'} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = '/male-avatar.png'
                  }}
                />
              ) : (
                <FaUser className="text-xl text-white" />
              )}
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl py-2 ${theme === 'dark' ? 'bg-gray-800/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-md`}
                >
                  {currentUser ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                          <img 
                            src={currentUser.profilePicture || '/male-avatar.png'} 
                            alt="Profile" 
                            className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = '/male-avatar.png'
                            }}
                          />
                          <div>
                            <p className="text-sm font-semibold">{`${currentUser.firstName} ${currentUser.lastName}`}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">User ID: {currentUser.uid?.slice(0, 8)}...</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.phone || 'No phone number'}</p>
                      </div>

                      <Link 
                        to="/profile" 
                        className={`flex items-center gap-3 px-4 py-3 text-sm ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                        onClick={() => setShowDropdown(false)}
                      >
                        <FaCog className="text-purple-500" />
                        View Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <FaSignOutAlt />
                        Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        className={`flex items-center gap-3 px-4 py-3 text-sm ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                        onClick={() => setShowDropdown(false)}
                      >
                        <FaSignInAlt className="text-purple-500" />
                        Sign In
                      </Link>
                      <Link 
                        to="/signup" 
                        className={`flex items-center gap-3 px-4 py-3 text-sm ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                        onClick={() => setShowDropdown(false)}
                      >
                        <FaUser className="text-green-500" />
                        Create Account
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
