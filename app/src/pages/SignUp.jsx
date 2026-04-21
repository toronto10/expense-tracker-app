// ... autres imports
import { sendWelcomeEmail } from "../utils/emailService";

const SignUp = (props) => {
  // ... états existants

  const signUpWithEmailAndPassword = async () => {
    // ... validation

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userName = user.email.split("@")[0];

      // Envoyer l'email AVANT d'afficher la modal
      const emailResult = await sendWelcomeEmail(user.email, userName);
      
      props.setIsAuth(true);
      setShowWelcome(true);
      setEmailSent(emailResult.success); // Mettre à jour l'état avec le résultat réel
      
    } catch (error) {
      // ... gestion des erreurs
    }
    setLoading(false);
  };

  const signUpWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userName = user.displayName || user.email.split("@")[0];
      const isNewUser = result._tokenResponse?.isNewUser;

      if (isNewUser) {
        // Envoyer l'email AVANT d'afficher la modal
        const emailResult = await sendWelcomeEmail(user.email, userName);
        setEmailSent(emailResult.success);
      }

      props.setIsAuth(true);
      setShowWelcome(isNewUser);
      
      if (!isNewUser) {
        navigate("/");
      }
    } catch (error) {
      // ... gestion des erreurs
    }
    setLoading(false);
  };

  // ... reste du code inchangé
};

export default SignUp