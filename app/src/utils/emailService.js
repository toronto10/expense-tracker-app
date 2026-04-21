import emailjs from "@emailjs/browser";

// Configuration EmailJS - Déplacée ici
const EMAIL_CONFIG = {
  SERVICE_ID: "service_t8n7vmk",
  TEMPLATE_ID: "template_od2vuaj",
  PUBLIC_KEY: "WteCtc5MkYIAxX3nY",
  FROM_EMAIL: "torontojunior31@gmail.com",
  FROM_NAME: "Tontojunior",
};

// Initialiser EmailJS
emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);

export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    // Paramètres pour le template d'email
    const templateParams = {
      to_email: userEmail,
      to_name: userName || userEmail.split("@")[0],
      from_email: EMAIL_CONFIG.FROM_EMAIL,
      from_name: EMAIL_CONFIG.FROM_NAME,
      subject: "🎉 Bienvenue sur ExpenseTracker !",
      user_name: userName || userEmail.split("@")[0],
      message: `Bonjour ${userName || userEmail.split("@")[0]},

🎉 Félicitations ! Votre compte ExpenseTracker a été créé avec succès.

Vous pouvez maintenant :
✅ Suivre vos dépenses en temps réel
📊 Analyser vos habitudes de consommation  
🎯 Gérer votre budget efficacement
📱 Accéder à votre tableau de bord partout

Commencez dès maintenant à prendre le contrôle de vos finances !

Cordialement,
L'équipe ExpenseTracker

---
Cet email a été envoyé automatiquement depuis ExpenseTracker.`,
    };

    // Envoi de l'email via EmailJS
    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log("✅ Email envoyé avec succès !", response);
    return { success: true, response };
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
    return { success: false, error };
  }
};