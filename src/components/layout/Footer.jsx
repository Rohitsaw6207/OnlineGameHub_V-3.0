import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLinkedin, FaGithub, FaHeart } from 'react-icons/fa'
import { useTheme } from '../../context/ThemeContext'

const Footer = () => {
  const { theme } = useTheme()
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`relative ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} transition-all duration-300`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Developer Name */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center md:text-left"
          >
            <p className="text-sm flex items-center gap-2">
              Developed by{' '}
              <span className="font-bold font-orbitron bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Rohit Kumar
              </span>
            </p>
          </motion.div>
          
          {/* Copyright */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <p className="text-sm flex items-center gap-2 flex-wrap justify-center">
              © {currentYear} Online Game Hub. All rights reserved. |{' '}
              <Link 
                to="/privacy-policy" 
                className="text-purple-500 hover:text-purple-400 transition-colors duration-300 font-medium no-underline hover:no-underline"
              >
                Privacy Policy
              </Link>
            </p>
          </motion.div>
          
          {/* Social Icons */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex gap-4"
          >
            {[
              { 
                icon: FaEnvelope, 
                href: "mailto:rohitku6207@gmail.com", 
                label: "Email", 
                color: "hover:text-red-500",
                gradient: "from-red-500 to-pink-500"
              },
              { 
                icon: FaLinkedin, 
                href: "https://www.linkedin.com/in/rohit-kumar-saw6207/", 
                label: "LinkedIn", 
                color: "hover:text-blue-500",
                gradient: "from-blue-500 to-cyan-500"
              },
              { 
                icon: FaGithub, 
                href: "https://github.com/Rohitsaw6207", 
                label: "GitHub", 
                color: "hover:text-gray-600",
                gradient: "from-gray-600 to-gray-800"
              }
            ].map((social, index) => (
              <motion.a
                key={index}
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-gray-100/50 hover:bg-gray-200/50'} transition-all duration-300 ${social.color} group no-underline hover:no-underline`}
                title={social.label}
              >
                <social.icon className="text-xl relative z-10" />
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${social.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
              </motion.a>
            ))}
          </motion.div>
        </div>

        {/* Bottom decorative line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-6 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"
        ></motion.div>
      </div>
    </motion.footer>
  )
}

export default Footer