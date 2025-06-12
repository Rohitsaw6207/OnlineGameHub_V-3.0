import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaPhone, FaMars, FaVenus } from 'react-icons/fa'

const SignupPage = () => {
  const { signup, currentUser } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'male',
    password: '',
    confirmPassword: ''
  })
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    document.title = 'Sign Up - Online Game Hub'
    
    // Redirect if already logged in
    if (currentUser) {
      navigate('/home')
    }
  }, [currentUser, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setError('')
      setLoading(true)
      
      const { confirmPassword, ...userData } = formData
      // Set profile picture based on gender
      userData.profilePicture = formData.gender === 'male' ? '/male-avatar.png' : '/female-avatar.png'
      
      await signup(userData)
      navigate('/home')
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
                Join the Adventure
              </span>
            </motion.h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Create your account and start gaming
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
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-md rounded-2xl shadow-2xl p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600 focus:border-purple-500' : 'bg-white/50 border-gray-300 focus:border-purple-500'} focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300`}
                      placeholder="First name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600 focus:border-purple-500' : 'bg-white/50 border-gray-300 focus:border-purple-500'} focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300`}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600 focus:border-purple-500' : 'bg-white/50 border-gray-300 focus:border-purple-500'} focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600 focus:border-purple-500' : 'bg-white/50 border-gray-300 focus:border-purple-500'} focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300`}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    formData.gender === 'male' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : `border-gray-300 ${theme === 'dark' ? 'hover:border-gray-500' : 'hover:border-gray-400'}`
                  }`}>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <FaMars className={`text-2xl mr-2 ${formData.gender === 'male' ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={`font-medium ${formData.gender === 'male' ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                      Male
                    </span>
                  </label>

                  <label className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    formData.gender === 'female' 
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' 
                      : `border-gray-300 ${theme === 'dark' ? 'hover:border-gray-500' : 'hover:border-gray-400'}`
                  }`}>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <FaVenus className={`text-2xl mr-2 ${formData.gender === 'female' ? 'text-pink-500' : 'text-gray-400'}`} />
                    <span className={`font-medium ${formData.gender === 'female' ? 'text-pink-600 dark:text-pink-400' : ''}`}>
                      Female
                    </span>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600 focus:border-purple-500' : 'bg-white/50 border-gray-300 focus:border-purple-500'} focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300`}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700/50 border-gray-600 focus:border-purple-500' : 'bg-white/50 border-gray-300 focus:border-purple-500'} focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
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
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>
            
            <div className="mt-8 text-center">
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Already have an account?{' '}
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

export default SignupPage