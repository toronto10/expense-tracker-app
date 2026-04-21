"use client"

import { useLanguage } from "../contexts/LanguageContext"

const WelcomeModal = ({ email, emailSent, onClose }) => {
  const { t } = useLanguage()

  return (
    <div className="welcome-modal">
      <div className="welcome-content">
        <div className="welcome-icon">✅</div>
        <h2 className="welcome-title">{t("welcome.title")}</h2>
        <p className="welcome-message">
          {t("welcome.success")}
          <br />
          <br />
          {emailSent ? (
            <span style={{ color: "var(--success-color)" }}>
              ✅ {t("welcome.emailSent")} <strong>{email}</strong>
            </span>
          ) : (
            <span style={{ color: "var(--warning-color)" }}>
              📧 {t("welcome.emailPending")} <strong>{email}</strong>...
            </span>
          )}
          <br />
          <br />
          {t("welcome.continue")}
        </p>
        <button className="form-button" onClick={onClose}>
          {t("welcome.continue")}
        </button>
      </div>
    </div>
  )
}

export default WelcomeModal
