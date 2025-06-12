import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { FaEnvelope } from 'react-icons/fa'

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth()
  const { theme } = useTheme()
  
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Reset Password - Online Game Hub'
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setError('')
      setMessage('')
      setLoading(true)
      
      await resetPassword(email)
      setMessage('Check your email for password reset instructions')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden flex items-center justify-center py-12`}>
      {/* Animated Background */}
      <div className="animated-bg"></div>

      <div className="relative z-10 container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Reset Password
              </span>
            </motion.h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Enter your email to reset your password
            </p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded-xl"
            >
              {error}
            </motion.div>
          )}
          
          {message && (
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 mb-6 bg-green-100 border border-green-400 text-green-700 rounded-xl"
            >
              {message}
            </motion.div>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-md rounded-2xl shadow-2xl p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <p className="mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600 focus:border-purple-500' : 'bg-white/50 border-gray-300 focus:border-purple-500'} focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </motion.button>
            </form>
            
            <div className="mt-8 text-center">
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Remember your password?{' '}
                <Link 
                  to="/login" 
                  className="text-purple-500 hover:text-purple-600 font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage