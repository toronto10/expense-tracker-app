"use client"

import { useState, useEffect } from "react"
import "./App.css"
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import Dashboard from "./pages/Dashboard"
import NotificationSystem from "./components/NotificationSystem"
import ThemeToggle from "./components/ThemeToggle"
import LanguageSelector from "./components/LanguageSelector"
import { ThemeProvider } from "./contexts/ThemeContext"
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext"
import { auth } from "./firebase"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { useNavigate } from "react-router-dom"

function AppContent() {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()
  const navigate = useNavigate()

  useEffect(() => {
    console.log("🔐 Vérification de l'authentification initiale...")
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("👤 État de l'authentification:", user ? user.email : "Non connecté")
      setIsAuth(!!user)
      setLoading(false)
    })

    return () => {
      console.log("🧹 Nettoyage du listener d'authentification")
      unsubscribe()
    }
  }, [])

  const logOutHandler = async () => {
    try {
      await signOut(auth)
      setIsAuth(false)
      navigate("/login")
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t("dashboard.loading")}</p>
      </div>
    )
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          <div className="brand-icon">💼</div>
          <h1>{t("nav.brand")}</h1>
        </Link>

        <div className="nav-links">
          <div className="nav-controls">
            <LanguageSelector />
            <ThemeToggle />
          </div>

          {isAuth && (
            <>
              <div className="user-info">
                <div className="user-avatar">👤</div>
                <span>{auth.currentUser?.email?.split("@")[0]}</span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={logOutHandler}>
                <span>🚪</span>
                {t("nav.logout")}
              </button>
            </>
          )}
          {!isAuth && (
            <>
              <Link to="/login" className="nav-link">
                {t("nav.login")}
              </Link>
              <Link to="/signup" className="nav-link btn btn-primary">
                {t("nav.signup")}
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={
              isAuth ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" replace state={{ from: "/" }} />
              )
            } 
          />
          <Route 
            path="/signup" 
            element={
              !isAuth ? (
                <SignUp setIsAuth={setIsAuth} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/login" 
            element={
              !isAuth ? (
                <Login setIsAuth={setIsAuth} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </main>

      <NotificationSystem />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App