import { useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const PrivacyPolicyPage = () => {
  const { theme } = useTheme()

  useEffect(() => {
    document.title = 'Privacy Policy - Online Game Hub'
  }, [])

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden py-12`}>
      {/* Animated Background */}
      <div className="animated-bg"></div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold font-orbitron mb-8 text-center"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
              }}>
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl shadow-2xl p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} space-y-6`}>
            <section>
              <h2 className="text-xl font-semibold mb-4">Introduction</h2>
              <p>
                We respect your privacy. This Privacy Policy explains how Online Game Hub collects, uses, and protects your personal information when you use our service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
              <p className="mb-4">
                We collect the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal information you provide when creating an account (name, email, phone number)</li>
                <li>Profile customization choices (avatar selection)</li>
                <li>Game preferences and usage statistics</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="mb-4">
                Your data is only used for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account management and authentication</li>
                <li>Profile customization</li>
                <li>Improving our services and game experiences</li>
                <li>Communication about service updates or changes</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">Data Protection</h2>
              <p>
                We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We do not share or sell your personal information to third parties for marketing purposes.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
              <p className="mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and update your personal information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">Changes to This Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@onlinegamehub.com.
              </p>
            </section>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              Last updated: January 1, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage