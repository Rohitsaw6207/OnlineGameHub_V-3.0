import { Routes, Route } from 'react-router-dom'
import { useTheme } from './context/ThemeContext'
import { useAuth } from './context/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import TicTacToePage from './pages/games/TicTacToePage'
import SnakeGamePage from './pages/games/SnakeGamePage'
import SudokuPage from './pages/games/SudokuPage'
import ChessPage from './pages/games/ChessPage'
import PongPage from './pages/games/PongPage'
import FlappyBirdPage from './pages/games/FlappyBirdPage'
import LudoPage from './pages/games/LudoPage'
import BreakoutPage from './pages/games/BreakoutPage'
import DinoRunPage from './pages/games/DinoRunPage'
import HelixJumpPage from './pages/games/HelixJumpPage'
import ProfilePage from './pages/ProfilePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const { theme } = useTheme()
  const { currentUser } = useAuth()

  return (
    <div className={`${theme} theme-transition min-h-screen flex flex-col`}>
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Landing page for non-authenticated users, home for authenticated */}
          <Route path="/" element={currentUser ? <HomePage /> : <LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          
          {/* Game Routes */}
          <Route path="/tic-tac-toe" element={<TicTacToePage />} />
          <Route path="/snake-game" element={<SnakeGamePage />} />
          <Route path="/sudoku" element={<SudokuPage />} />
          <Route path="/chess" element={<ChessPage />} />
          <Route path="/pong" element={<PongPage />} />
          <Route path="/flappy-bird" element={<FlappyBirdPage />} />
          <Route path="/ludo" element={<LudoPage />} />
          <Route path="/breakout" element={<BreakoutPage />} />
          <Route path="/dino-run" element={<DinoRunPage />} />
          <Route path="/helix-jump" element={<HelixJumpPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Other Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App