"use client"

import { useState, useEffect } from "react"

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Écouter les événements de notification personnalisés
    const handleNotification = (event) => {
      const { type, title, message, duration = 4000 } = event.detail
      const id = Date.now() + Math.random()

      const notification = {
        id,
        type,
        title,
        message,
        duration,
      }

      setNotifications((prev) => [...prev, notification])

      // Supprimer automatiquement après la durée spécifiée
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, duration)
    }

    window.addEventListener("showNotification", handleNotification)
    return () => window.removeEventListener("showNotification", handleNotification)
  }, [])

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "warning":
        return "⚠️"
      case "info":
        return "ℹ️"
      default:
        return "📢"
    }
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">{getIcon(notification.type)}</span>
            <div className="notification-text">
              <div className="notification-title">{notification.title}</div>
              {notification.message && <div className="notification-message">{notification.message}</div>}
            </div>
            <button className="notification-close" onClick={() => removeNotification(notification.id)}>
              ×
            </button>
          </div>
          <div className="notification-progress">
            <div
              className="notification-progress-bar"
              style={{ animationDuration: `${notification.duration}ms` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Fonction utilitaire pour déclencher des notifications
export const showNotification = (type, title, message, duration) => {
  const event = new CustomEvent("showNotification", {
    detail: { type, title, message, duration },
  })
  window.dispatchEvent(event)
}

export default NotificationSystem
