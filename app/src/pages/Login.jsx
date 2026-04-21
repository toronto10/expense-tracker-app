"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { auth, googleProvider } from "../firebase"
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { useLanguage } from "../contexts/LanguageContext"

const Login = (props) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const signInWithEmailAndPasswordHandler = async () => {
    if (!email || !password) {
      alert(t("message.fillAllFields"))
      return
    }

    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/")
      props.setIsAuth(true)
    } catch (error) {
      console.error("Erreur lors de la connexion:", error)
      if (error.code === "auth/user-not-found") {
        alert("Aucun compte trouvé avec cette adresse email")
      } else if (error.code === "auth/wrong-password") {
        alert("Mot de passe incorrect")
      } else if (error.code === "auth/invalid-email") {
        alert("Adresse email invalide")
      } else {
        alert("Erreur lors de la connexion. Veuillez réessayer.")
      }
    }
    setLoading(false)
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      navigate("/")
      props.setIsAuth(true)
    } catch (error) {
      console.error("Erreur lors de la connexion avec Google:", error)
      alert("Erreur lors de la connexion avec Google")
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{t("auth.login.title")}</h2>

        <div className="form-group">
          <input
            type="email"
            className="form-input"
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            className="form-input"
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button className="form-button" onClick={signInWithEmailAndPasswordHandler} disabled={loading}>
          {loading ? t("auth.connecting") : t("auth.login.button")}
        </button>

        <button className="form-button google-button" onClick={signInWithGoogle} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t("auth.google")}
        </button>

        <div className="auth-link">
          {t("auth.signup.link")} <Link to="/signup">{t("nav.signup")}</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
