import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            ...userDoc.data()
          })
        } else {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            firstName: '',
            lastName: '',
            phone: '',
            gender: 'male',
            profilePicture: '/male-avatar.png'
          })
        }
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signup = async (userData) => {
    try {
      const { email, password, firstName, lastName, phone, gender } = userData
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      })

      // Save additional user data to Firestore
      const userDocData = {
        firstName,
        lastName,
        phone: phone || '',
        gender,
        profilePicture: gender === 'male' ? '/male-avatar.png' : '/female-avatar.png',
        createdAt: new Date().toISOString(),
        gamesPlayed: 0,
        totalScore: 0
      }

      await setDoc(doc(db, 'users', user.uid), userDocData)

      setCurrentUser({
        uid: user.uid,
        email: user.email,
        ...userDocData
      })

      return user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setCurrentUser(null)
      navigate('/')
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const updateUserProfile = async (updates) => {
    if (!currentUser) return

    try {
      // Update in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), updates)
      
      // Update local state
      setCurrentUser(prev => ({ ...prev, ...updates }))
      
      return true
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const value = {
    currentUser,
    signup,
    login,
    logout,
    updateProfile: updateUserProfile,
    resetPassword,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}