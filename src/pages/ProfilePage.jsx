import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FaUser, FaEnvelope, FaPhone, FaMars, FaVenus, FaKey } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const ProfilePage = () => {
  const { currentUser } = useAuth()
  const { theme } = useTheme()

  useEffect(() => {
    document.title = 'Your Profile - Online Game Hub'
  }, [])

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center relative overflow-hidden`}>
        <div className="animated-bg"></div>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 relative z-10"></div>
      </div>
    )
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
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-orbitron mb-4"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
                }}>
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Your Profile
              </span>
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              View your account details
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
          >
            {/* Profile Header */}
            <div className="text-center mb-8">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative inline-block"
              >
                <img 
                  src={currentUser.profilePicture || '/male-avatar.png'} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-purple-500 shadow-lg mx-auto"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = '/male-avatar.png'
                  }}
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  {currentUser.gender === 'female' ? (
                    <FaVenus className="text-white text-sm" />
                  ) : (
                    <FaMars className="text-white text-sm" />
                  )}
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold font-orbitron mt-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {`${currentUser.firstName} ${currentUser.lastName}`}
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                User ID: {currentUser.uid?.slice(0, 8)}...
              </p>
            </div>

            {/* User Details (Read Only) */}
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium font-orbitron mb-2">
                    <FaUser className="inline mr-2 text-purple-500" />
                    First Name
                  </label>
                  <input
                    type="text"
                    value={currentUser.firstName}
                    disabled
                    className={`w-full px-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white/50 border-gray-300'} opacity-60 cursor-not-allowed`}
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium font-orbitron mb-2">
                    <FaUser className="inline mr-2 text-purple-500" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={currentUser.lastName}
                    disabled
                    className={`w-full px-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white/50 border-gray-300'} opacity-60 cursor-not-allowed`}
                  />
                </div>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium font-orbitron mb-2">
                  <FaEnvelope className="inline mr-2 text-purple-500" />
                  Email
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className={`w-full px-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white/50 border-gray-300'} opacity-60 cursor-not-allowed`}
                />
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium font-orbitron mb-2">
                  <FaPhone className="inline mr-2 text-purple-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={currentUser.phone || 'Not provided'}
                  disabled
                  className={`w-full px-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white/50 border-gray-300'} opacity-60 cursor-not-allowed`}
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium font-orbitron mb-2">
                  Gender
                </label>
                <div className={`w-full px-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white/50 border-gray-300'} opacity-60 cursor-not-allowed flex items-center`}>
                  {currentUser.gender === 'female' ? (
                    <>
                      <FaVenus className="text-pink-500 mr-2" />
                      <span>Female</span>
                    </>
                  ) : (
                    <>
                      <FaMars className="text-blue-500 mr-2" />
                      <span>Male</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Forgot Password Button */}
            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/forgot-password"
                  className="py-3 px-6 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold font-orbitron rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 inline-flex items-center"
                >
                  <FaKey className="mr-2" />
                  Reset Password
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage