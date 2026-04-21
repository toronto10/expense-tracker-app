"use client"

import { createContext, useContext, useEffect, useState } from "react"

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

// Dictionnaire de traductions
const translations = {
  fr: {
    // Navigation
    "nav.brand": "ExpenseTracker Pro",
    "nav.logout": "Déconnexion",
    "nav.login": "Connexion",
    "nav.signup": "Inscription",

    // Dashboard
    "dashboard.title": "Tableau de Bord Financier",
    "dashboard.subtitle": "Gestion professionnelle de vos budgets et dépenses",
    "dashboard.loading": "Chargement...",

    // Stats
    "stats.totalBudget": "Budget Total",
    "stats.totalSpent": "Total Dépensé",
    "stats.remaining": "Solde Restant",
    "stats.thisMonth": "Ce Mois-ci",

    // Budgets
    "budgets.title": "Gestion des Budgets",
    "budgets.new": "Nouveau Budget",
    "budgets.cancel": "Annuler",
    "budgets.name": "Nom du budget",
    "budgets.namePlaceholder": "Ex: Marketing, Opérations, R&D...",
    "budgets.amount": "Montant alloué",
    "budgets.create": "Créer le Budget",
    "budgets.creating": "Création...",
    "budgets.edit": "Modifier",
    "budgets.delete": "Supprimer",
    "budgets.save": "Sauvegarder",
    "budgets.spent": "Dépensé",
    "budgets.remaining": "Restant",
    "budgets.exceeded": "Dépassement",
    "budgets.used": "utilisé",
    "budgets.available": "disponible",
    "budgets.empty.title": "Aucun budget configuré",
    "budgets.empty.description": "Créez votre premier budget pour commencer à suivre vos dépenses",

    // Expenses
    "expenses.title": "Nouvelle Dépense",
    "expenses.history": "Historique des Dépenses",
    "expenses.amount": "Montant",
    "expenses.description": "Description",
    "expenses.descriptionPlaceholder": "Description de la dépense",
    "expenses.budget": "Budget",
    "expenses.budgetPlaceholder": "Sélectionner un budget",
    "expenses.category": "Catégorie",
    "expenses.categoryPlaceholder": "Sélectionner une catégorie",
    "expenses.newCategory": "➕ Nouvelle catégorie",
    "expenses.newCategoryPlaceholder": "Nom de la catégorie",
    "expenses.save": "Enregistrer la Dépense",
    "expenses.saving": "Ajout en cours...",
    "expenses.edit": "Modifier",
    "expenses.delete": "Supprimer",
    "expenses.empty.title": "Aucune dépense enregistrée",
    "expenses.empty.description": "Vos dépenses apparaîtront ici une fois que vous en aurez ajouté",

    // Categories
    "category.alimentation": "Alimentation",
    "category.transport": "Transport",
    "category.logement": "Logement",
    "category.santé": "Santé",
    "category.loisirs": "Loisirs",
    "category.shopping": "Shopping",
    "category.éducation": "Éducation",
    "category.factures": "Factures",
    "category.épargne": "Épargne",
    "category.autres": "Autres",

    // Auth
    "auth.login.title": "Se connecter",
    "auth.signup.title": "Créer un compte",
    "auth.email": "Votre adresse email",
    "auth.password": "Votre mot de passe",
    "auth.login.button": "Se connecter",
    "auth.signup.button": "S'inscrire",
    "auth.google": "Continuer avec Google",
    "auth.login.link": "Vous avez déjà un compte ?",
    "auth.signup.link": "Pas encore de compte ?",
    "auth.password.note": "Le mot de passe doit contenir au moins 6 caractères",
    "auth.connecting": "Connexion en cours...",
    "auth.creating": "Inscription en cours...",

    // Welcome
    "welcome.title": "Bienvenue ! 🎉",
    "welcome.success": "Votre compte a été créé avec succès !",
    "welcome.emailSent": "Un email de bienvenue a été envoyé à",
    "welcome.emailPending": "Email de bienvenue en cours d'envoi à",
    "welcome.continue": "Continuer vers le tableau de bord",

    // Notifications
    "notification.budget.created": "Budget créé",
    "notification.budget.updated": "Budget modifié",
    "notification.budget.deleted": "Budget supprimé",
    "notification.expense.added": "Dépense ajoutée",
    "notification.expense.updated": "Dépense modifiée",
    "notification.expense.deleted": "Dépense supprimée",
    "notification.budget.exceeded": "Budget dépassé",
    "notification.error": "Erreur",
    "notification.warning": "Attention",
    "notification.success": "Succès",

    // Messages
    "message.fillAllFields": "Veuillez remplir tous les champs",
    "message.invalidAmount": "Veuillez entrer un montant valide",
    "message.selectCategory": "Veuillez sélectionner une catégorie",
    "message.createBudgetFirst": "Créez d'abord un budget pour pouvoir ajouter des dépenses",
    "message.confirmDelete": "Êtes-vous sûr de vouloir supprimer",
    "message.confirmDeleteBudget":
      "Ce budget contient {count} dépense(s). Supprimer ce budget supprimera également toutes les dépenses associées. Voulez-vous continuer ?",

    // Settings
    "settings.theme": "Thème",
    "settings.theme.light": "Clair",
    "settings.theme.dark": "Sombre",
    "settings.language": "Langue",
    "settings.language.fr": "Français",
    "settings.language.en": "English",
  },
  en: {
    // Navigation
    "nav.brand": "ExpenseTracker Pro",
    "nav.logout": "Logout",
    "nav.login": "Login",
    "nav.signup": "Sign Up",

    // Dashboard
    "dashboard.title": "Financial Dashboard",
    "dashboard.subtitle": "Professional management of your budgets and expenses",
    "dashboard.loading": "Loading...",

    // Stats
    "stats.totalBudget": "Total Budget",
    "stats.totalSpent": "Total Spent",
    "stats.remaining": "Remaining Balance",
    "stats.thisMonth": "This Month",

    // Budgets
    "budgets.title": "Budget Management",
    "budgets.new": "New Budget",
    "budgets.cancel": "Cancel",
    "budgets.name": "Budget name",
    "budgets.namePlaceholder": "Ex: Marketing, Operations, R&D...",
    "budgets.amount": "Allocated amount",
    "budgets.create": "Create Budget",
    "budgets.creating": "Creating...",
    "budgets.edit": "Edit",
    "budgets.delete": "Delete",
    "budgets.save": "Save",
    "budgets.spent": "Spent",
    "budgets.remaining": "Remaining",
    "budgets.exceeded": "Exceeded",
    "budgets.used": "used",
    "budgets.available": "available",
    "budgets.empty.title": "No budgets configured",
    "budgets.empty.description": "Create your first budget to start tracking your expenses",

    // Expenses
    "expenses.title": "New Expense",
    "expenses.history": "Expense History",
    "expenses.amount": "Amount",
    "expenses.description": "Description",
    "expenses.descriptionPlaceholder": "Expense description",
    "expenses.budget": "Budget",
    "expenses.budgetPlaceholder": "Select a budget",
    "expenses.category": "Category",
    "expenses.categoryPlaceholder": "Select a category",
    "expenses.newCategory": "➕ New category",
    "expenses.newCategoryPlaceholder": "Category name",
    "expenses.save": "Save Expense",
    "expenses.saving": "Adding...",
    "expenses.edit": "Edit",
    "expenses.delete": "Delete",
    "expenses.empty.title": "No expenses recorded",
    "expenses.empty.description": "Your expenses will appear here once you add some",

    // Categories
    "category.alimentation": "Food",
    "category.transport": "Transport",
    "category.logement": "Housing",
    "category.santé": "Health",
    "category.loisirs": "Entertainment",
    "category.shopping": "Shopping",
    "category.éducation": "Education",
    "category.factures": "Bills",
    "category.épargne": "Savings",
    "category.autres": "Others",

    // Auth
    "auth.login.title": "Sign In",
    "auth.signup.title": "Create Account",
    "auth.email": "Your email address",
    "auth.password": "Your password",
    "auth.login.button": "Sign In",
    "auth.signup.button": "Sign Up",
    "auth.google": "Continue with Google",
    "auth.login.link": "Already have an account?",
    "auth.signup.link": "Don't have an account?",
    "auth.password.note": "Password must contain at least 6 characters",
    "auth.connecting": "Signing in...",
    "auth.creating": "Creating account...",

    // Welcome
    "welcome.title": "Welcome! 🎉",
    "welcome.success": "Your account has been created successfully!",
    "welcome.emailSent": "A welcome email has been sent to",
    "welcome.emailPending": "Welcome email being sent to",
    "welcome.continue": "Continue to dashboard",

    // Notifications
    "notification.budget.created": "Budget created",
    "notification.budget.updated": "Budget updated",
    "notification.budget.deleted": "Budget deleted",
    "notification.expense.added": "Expense added",
    "notification.expense.updated": "Expense updated",
    "notification.expense.deleted": "Expense deleted",
    "notification.budget.exceeded": "Budget exceeded",
    "notification.error": "Error",
    "notification.warning": "Warning",
    "notification.success": "Success",

    // Messages
    "message.fillAllFields": "Please fill in all fields",
    "message.invalidAmount": "Please enter a valid amount",
    "message.selectCategory": "Please select a category",
    "message.createBudgetFirst": "Create a budget first to add expenses",
    "message.confirmDelete": "Are you sure you want to delete",
    "message.confirmDeleteBudget":
      "This budget contains {count} expense(s). Deleting this budget will also delete all associated expenses. Do you want to continue?",

    // Settings
    "settings.theme": "Theme",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
    "settings.language": "Language",
    "settings.language.fr": "Français",
    "settings.language.en": "English",
  },
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("fr")

  useEffect(() => {
    // Charger la langue depuis localStorage ou détecter la langue du navigateur
    const savedLanguage = localStorage.getItem("expense-tracker-language")
    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      // Détecter la langue du navigateur
      const browserLanguage = navigator.language.split("-")[0]
      setLanguage(browserLanguage === "en" ? "en" : "fr")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("expense-tracker-language", language)
  }, [language])

  const t = (key, params = {}) => {
    let translation = translations[language][key] || key

    // Remplacer les paramètres dans la traduction
    Object.keys(params).forEach((param) => {
      translation = translation.replace(`{${param}}`, params[param])
    })

    return translation
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}
