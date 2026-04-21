"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { db, auth } from "../firebase"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  updateDoc,
} from "firebase/firestore"
import { showNotification } from "../components/NotificationSystem"
import { useLanguage } from "../contexts/LanguageContext"

const Dashboard = (props) => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  // États pour les dépenses
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [selectedBudget, setSelectedBudget] = useState("")
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)

  // États pour les budgets
  const [budgets, setBudgets] = useState([])
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [budgetName, setBudgetName] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [budgetLoading, setBudgetLoading] = useState(false)

  // États pour la modification de budget
  const [editingBudget, setEditingBudget] = useState(null)
  const [editBudgetName, setEditBudgetName] = useState("")
  const [editBudgetAmount, setEditBudgetAmount] = useState("")

  // États pour les catégories
  const [customCategory, setCustomCategory] = useState("")
  const [isCustomCategory, setIsCustomCategory] = useState(false)

  // États pour la modification de dépense
  const [editingExpense, setEditingExpense] = useState(null)
  const [editAmount, setEditAmount] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editCustomCategory, setEditCustomCategory] = useState("")
  const [editIsCustomCategory, setEditIsCustomCategory] = useState(false)
  const [editSelectedBudget, setEditSelectedBudget] = useState("")

  // État pour l'utilisateur
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)

  // Catégories prédéfinies avec traductions
  const predefinedCategories = [
    "alimentation",
    "transport",
    "logement",
    "santé",
    "loisirs",
    "shopping",
    "éducation",
    "factures",
    "épargne",
    "autres",
  ]

  const expensesRef = collection(db, "expenses")
  const budgetsRef = collection(db, "budgets")

  // Fonction pour formater les montants en FCFA
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("XOF", "FCFA")
  }

  // Fonction pour formater les montants avec ajustement automatique
  const formatCurrencyWithSize = (amount) => {
    const formatted = formatCurrency(amount)
    const length = formatted.length

    // Déterminer la classe CSS en fonction de la longueur
    let sizeClass = ""
    if (length > 20) {
      sizeClass = "text-xs"
    } else if (length > 15) {
      sizeClass = "text-sm"
    } else if (length > 12) {
      sizeClass = "text-base"
    } else if (length > 8) {
      sizeClass = "text-lg"
    } else {
      sizeClass = "text-xl"
    }

    return { formatted, sizeClass }
  }

  // Hook pour ajuster automatiquement la taille de police
  const useAutoFontSize = () => {
    const adjustFontSize = (element) => {
      if (!element) return

      const container = element.parentElement
      if (!container) return

      let fontSize = 32 // Taille de départ en px
      element.style.fontSize = `${fontSize}px`

      // Réduire la taille jusqu'à ce que le texte rentre
      while (element.scrollWidth > container.clientWidth && fontSize > 12) {
        fontSize -= 2
        element.style.fontSize = `${fontSize}px`
      }
    }

    return adjustFontSize
  }

  const adjustFontSize = useAutoFontSize()

  // Composant pour afficher les montants avec ajustement automatique
  const AutoSizeAmount = ({ amount, className = "" }) => {
    const elementRef = useRef(null)

    useEffect(() => {
      if (elementRef.current) {
        adjustFontSize(elementRef.current)
      }
    }, [amount, adjustFontSize])

    const { formatted, sizeClass } = formatCurrencyWithSize(amount)

    return (
      <div ref={elementRef} className={`stat-value auto-size ${sizeClass} ${className}`} title={formatted}>
        {formatted}
      </div>
    )
  }

  // Ajouter un budget
  const addBudget = async () => {
    if (!budgetName || !budgetAmount) {
      showNotification("warning", t("notification.warning"), t("message.fillAllFields"))
      return
    }

    if (isNaN(budgetAmount) || Number.parseFloat(budgetAmount) <= 0) {
      showNotification("error", t("notification.error"), t("message.invalidAmount"))
      return
    }

    if (!user) {
      showNotification("error", t("notification.error"), "Utilisateur non connecté")
      return
    }

    setBudgetLoading(true)
    try {
      console.log("🎯 Création du budget:", { budgetName, budgetAmount, userId: user.uid })

      const budgetData = {
        name: budgetName,
        amount: Number.parseFloat(budgetAmount),
        spent: 0,
        createdAt: serverTimestamp(),
        userId: user.uid,
      }

      console.log("📝 Données du budget:", budgetData)

      const docRef = await addDoc(budgetsRef, budgetData)
      console.log("✅ Budget créé avec ID:", docRef.id)

      setBudgetName("")
      setBudgetAmount("")
      setShowBudgetForm(false)

      showNotification("success", t("notification.budget.created"), `${t("budgets.title")}: "${budgetName}"`)
    } catch (error) {
      console.error("❌ Erreur lors de la création du budget:", error)
      showNotification("error", t("notification.error"), "Impossible de créer le budget: " + error.message)
    }
    setBudgetLoading(false)
  }

  // Commencer la modification d'un budget
  const startEditBudget = (budget) => {
    setEditingBudget(budget.id)
    setEditBudgetName(budget.name)
    setEditBudgetAmount(budget.amount.toString())
  }

  // Annuler la modification d'un budget
  const cancelEditBudget = () => {
    setEditingBudget(null)
    setEditBudgetName("")
    setEditBudgetAmount("")
  }

  // Sauvegarder la modification d'un budget
  const saveEditBudget = async (budget) => {
    if (!editBudgetName || !editBudgetAmount) {
      showNotification("warning", t("notification.warning"), t("message.fillAllFields"))
      return
    }

    if (isNaN(editBudgetAmount) || Number.parseFloat(editBudgetAmount) <= 0) {
      showNotification("error", t("notification.error"), t("message.invalidAmount"))
      return
    }

    try {
      const budgetRef = doc(db, "budgets", budget.id)
      await updateDoc(budgetRef, {
        name: editBudgetName,
        amount: Number.parseFloat(editBudgetAmount),
      })

      cancelEditBudget()
      showNotification("success", t("notification.budget.updated"), `"${editBudgetName}"`)
    } catch (error) {
      console.error("Erreur lors de la modification du budget:", error)
      showNotification("error", t("notification.error"), "Impossible de modifier le budget")
    }
  }

  // Supprimer un budget
  const deleteBudget = async (budget) => {
    const associatedExpenses = expenses.filter((expense) => expense.budgetId === budget.id)

    if (associatedExpenses.length > 0) {
      const confirm = window.confirm(t("message.confirmDeleteBudget", { count: associatedExpenses.length }))
      if (!confirm) return
    } else {
      const confirm = window.confirm(`${t("message.confirmDelete")} "${budget.name}" ?`)
      if (!confirm) return
    }

    try {
      // Supprimer toutes les dépenses associées
      for (const expense of associatedExpenses) {
        const expenseRef = doc(db, "expenses", expense.id)
        await deleteDoc(expenseRef)
      }

      // Supprimer le budget
      const budgetRef = doc(db, "budgets", budget.id)
      await deleteDoc(budgetRef)

      showNotification("success", t("notification.budget.deleted"), `"${budget.name}"`)
    } catch (error) {
      console.error("Erreur lors de la suppression du budget:", error)
      showNotification("error", t("notification.error"), "Impossible de supprimer le budget")
    }
  }

  // Ajouter une dépense
  const addExpense = async () => {
    if (!amount || !description || !selectedBudget) {
      showNotification("warning", t("notification.warning"), t("message.fillAllFields"))
      return
    }

    if (isNaN(amount) || Number.parseFloat(amount) <= 0) {
      showNotification("error", t("notification.error"), t("message.invalidAmount"))
      return
    }

    const finalCategory = isCustomCategory ? customCategory : category
    if (!finalCategory) {
      showNotification("warning", t("notification.warning"), t("message.selectCategory"))
      return
    }

    setLoading(true)
    try {
      const expenseAmount = Number.parseFloat(amount)
      const budget = budgets.find((b) => b.id === selectedBudget)

      if (!budget) {
        showNotification("error", t("notification.error"), "Budget introuvable")
        setLoading(false)
        return
      }

      const newSpent = budget.spent + expenseAmount

      // Vérifier si la dépense dépasse le budget
      if (newSpent > budget.amount) {
        showNotification("warning", t("notification.budget.exceeded"), `${formatCurrency(newSpent - budget.amount)}`)
      }

      // Ajouter la dépense
      await addDoc(expensesRef, {
        amount: expenseAmount,
        description,
        category: finalCategory,
        budgetId: selectedBudget,
        budgetName: budget.name,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email,
      })

      // Mettre à jour le budget
      const budgetRef = doc(db, "budgets", selectedBudget)
      await updateDoc(budgetRef, {
        spent: newSpent,
      })

      // Réinitialiser le formulaire
      setAmount("")
      setDescription("")
      setCategory("")
      setCustomCategory("")
      setIsCustomCategory(false)
      setSelectedBudget("")

      showNotification("success", t("notification.expense.added"), `${formatCurrency(expenseAmount)}`)
    } catch (error) {
      console.error("Erreur lors de l'ajout de la dépense:", error)
      showNotification("error", t("notification.error"), "Impossible d'ajouter la dépense")
    }
    setLoading(false)
  }

  // Supprimer une dépense
  const deleteExpense = async (expense) => {
    if (!window.confirm(`${t("message.confirmDelete")} cette dépense ?`)) {
      return
    }

    try {
      const deleteRef = doc(db, "expenses", expense.id)
      await deleteDoc(deleteRef)

      if (expense.budgetId) {
        const budget = budgets.find((b) => b.id === expense.budgetId)
        if (budget) {
          const budgetRef = doc(db, "budgets", expense.budgetId)
          await updateDoc(budgetRef, {
            spent: Math.max(0, budget.spent - expense.amount),
          })
        }
      }

      showNotification("success", t("notification.expense.deleted"), "")
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      showNotification("error", t("notification.error"), "Impossible de supprimer la dépense")
    }
  }

  // Commencer la modification d'une dépense
  const startEditExpense = (expense) => {
    setEditingExpense(expense.id)
    setEditAmount(expense.amount.toString())
    setEditDescription(expense.description)
    setEditSelectedBudget(expense.budgetId)

    if (predefinedCategories.includes(expense.category)) {
      setEditCategory(expense.category)
      setEditIsCustomCategory(false)
      setEditCustomCategory("")
    } else {
      setEditCategory("")
      setEditIsCustomCategory(true)
      setEditCustomCategory(expense.category)
    }
  }

  // Annuler la modification d'une dépense
  const cancelEditExpense = () => {
    setEditingExpense(null)
    setEditAmount("")
    setEditDescription("")
    setEditCategory("")
    setEditCustomCategory("")
    setEditIsCustomCategory(false)
    setEditSelectedBudget("")
  }

  // Sauvegarder la modification d'une dépense
  const saveEditExpense = async (expense) => {
    if (!editAmount || !editDescription || !editSelectedBudget) {
      showNotification("warning", t("notification.warning"), t("message.fillAllFields"))
      return
    }

    if (isNaN(editAmount) || Number.parseFloat(editAmount) <= 0) {
      showNotification("error", t("notification.error"), t("message.invalidAmount"))
      return
    }

    const finalEditCategory = editIsCustomCategory ? editCustomCategory : editCategory
    if (!finalEditCategory) {
      showNotification("warning", t("notification.warning"), t("message.selectCategory"))
      return
    }

    try {
      const newAmount = Number.parseFloat(editAmount)
      const oldAmount = expense.amount

      const oldBudget = budgets.find((b) => b.id === expense.budgetId)
      const newBudget = budgets.find((b) => b.id === editSelectedBudget)

      if (!newBudget) {
        showNotification("error", t("notification.error"), "Budget introuvable")
        return
      }

      // Calculer les nouveaux montants
      const newOldBudgetSpent = oldBudget ? Math.max(0, oldBudget.spent - oldAmount) : 0
      let newNewBudgetSpent = newBudget.spent + newAmount

      if (expense.budgetId === editSelectedBudget) {
        newNewBudgetSpent = newBudget.spent - oldAmount + newAmount
      }

      // Mettre à jour la dépense
      const expenseRef = doc(db, "expenses", expense.id)
      await updateDoc(expenseRef, {
        amount: newAmount,
        description: editDescription,
        category: finalEditCategory,
        budgetId: editSelectedBudget,
        budgetName: newBudget.name,
      })

      // Mettre à jour les budgets
      if (oldBudget && expense.budgetId !== editSelectedBudget) {
        const oldBudgetRef = doc(db, "budgets", expense.budgetId)
        await updateDoc(oldBudgetRef, {
          spent: newOldBudgetSpent,
        })
      }

      const newBudgetRef = doc(db, "budgets", editSelectedBudget)
      await updateDoc(newBudgetRef, {
        spent: newNewBudgetSpent,
      })

      cancelEditExpense()
      showNotification("success", t("notification.expense.updated"), "")
    } catch (error) {
      console.error("Erreur lors de la modification:", error)
      showNotification("error", t("notification.error"), "Impossible de modifier la dépense")
    }
  }

  // Gérer le changement de catégorie
  const handleCategoryChange = (value) => {
    if (value === "custom") {
      setIsCustomCategory(true)
      setCategory("")
    } else {
      setIsCustomCategory(false)
      setCategory(value)
      setCustomCategory("")
    }
  }

  const handleEditCategoryChange = (value) => {
    if (value === "custom") {
      setEditIsCustomCategory(true)
      setEditCategory("")
    } else {
      setEditIsCustomCategory(false)
      setEditCategory(value)
      setEditCustomCategory("")
    }
  }

  // useEffect pour gérer l'authentification
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      console.log("👤 État de l'authentification:", currentUser ? currentUser.email : "Non connecté")
      setUser(currentUser)
      setUserLoading(false)
    })

    return () => unsubscribeAuth()
  }, [])

  // useEffect pour charger les données Firestore
  useEffect(() => {
    if (!user) {
      console.log("❌ Aucun utilisateur connecté, pas de chargement des données")
      return
    }

    console.log("📊 Chargement des données pour:", user.email)

    // Charger les budgets (sans orderBy temporairement)
    const budgetsQuery = query(budgetsRef, where("userId", "==", user.uid))
    const unsubscribeBudgets = onSnapshot(
      budgetsQuery,
      (snapshot) => {
        const budgetsData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        // Trier côté client temporairement
        budgetsData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0
          return b.createdAt.toDate() - a.createdAt.toDate()
        })
        console.log("🎯 Budgets chargés:", budgetsData.length, budgetsData)
        setBudgets(budgetsData)
      },
      (error) => {
        console.error("❌ Erreur lors du chargement des budgets:", error)
        showNotification("error", "Erreur", "Impossible de charger les budgets: " + error.message)
      },
    )

    // Charger les dépenses (sans orderBy temporairement)
    const expensesQuery = query(expensesRef, where("userId", "==", user.uid))
    const unsubscribeExpenses = onSnapshot(
      expensesQuery,
      (snapshot) => {
        const expensesData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        // Trier côté client temporairement
        expensesData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0
          return b.createdAt.toDate() - a.createdAt.toDate()
        })
        console.log("💳 Dépenses chargées:", expensesData.length)
        setExpenses(expensesData)
      },
      (error) => {
        console.error("❌ Erreur lors du chargement des dépenses:", error)
        showNotification("error", "Erreur", "Impossible de charger les dépenses: " + error.message)
      },
    )

    // Nettoyer les listeners
    return () => {
      console.log("🧹 Nettoyage des listeners Firestore")
      unsubscribeBudgets()
      unsubscribeExpenses()
    }
  }, [user])

  // Calculer les statistiques
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const monthlyExpenses = expenses
    .filter((expense) => {
      const expenseDate = expense.createdAt?.toDate()
      const now = new Date()
      return expenseDate && expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  const totalBudgets = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)

  // Affichage de chargement
  if (userLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t("dashboard.loading")}</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">📊</span>
            {t("dashboard.title")}
          </h1>
          <p className="dashboard-subtitle">{t("dashboard.subtitle")}</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div className="stat-content">
            <AutoSizeAmount amount={totalBudgets} />
            <div className="stat-label">{t("stats.totalBudget")}</div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
            </svg>
          </div>
          <div className="stat-content">
            <AutoSizeAmount amount={totalSpent} />
            <div className="stat-label">{t("stats.totalSpent")}</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z" />
            </svg>
          </div>
          <div className="stat-content">
            <AutoSizeAmount amount={totalBudgets - totalSpent} />
            <div className="stat-label">{t("stats.remaining")}</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3v2h18V4zM3 8v12h18V8H3z" />
            </svg>
          </div>
          <div className="stat-content">
            <AutoSizeAmount amount={monthlyExpenses} />
            <div className="stat-label">{t("stats.thisMonth")}</div>
          </div>
        </div>
      </div>

      {/* Gestion des budgets */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">
            <span className="section-icon">🎯</span>
            {t("budgets.title")}
            <span className="badge">{budgets.length}</span>
          </h3>
          <button className="btn btn-primary" onClick={() => setShowBudgetForm(!showBudgetForm)}>
            <span>+</span>
            {showBudgetForm ? t("budgets.cancel") : t("budgets.new")}
          </button>
        </div>

        {showBudgetForm && (
          <div className="form-card">
            <div className="form-row">
              <div className="input-group">
                <label>{t("budgets.name")}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t("budgets.namePlaceholder")}
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>{t("budgets.amount")}</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  step="1000"
                  min="0"
                />
              </div>
            </div>
            <button className="btn btn-success" onClick={addBudget} disabled={budgetLoading}>
              {budgetLoading ? t("budgets.creating") : t("budgets.create")}
            </button>
          </div>
        )}

        <div className="budgets-grid">
          {budgets.map((budget) => {
            const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
            const isOverBudget = budget.spent > budget.amount
            const remaining = budget.amount - (budget.spent || 0)

            return (
              <div key={budget.id} className={`budget-card ${isOverBudget ? "over-budget" : ""}`}>
                {editingBudget === budget.id ? (
                  <div className="budget-edit-form">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-input"
                        value={editBudgetName}
                        onChange={(e) => setEditBudgetName(e.target.value)}
                        placeholder={t("budgets.name")}
                      />
                    </div>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-input"
                        value={editBudgetAmount}
                        onChange={(e) => setEditBudgetAmount(e.target.value)}
                        placeholder={t("budgets.amount")}
                        step="1000"
                        min="0"
                      />
                    </div>
                    <div className="budget-actions">
                      <button className="btn btn-success btn-sm" onClick={() => saveEditBudget(budget)}>
                        ✓ {t("budgets.save")}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={cancelEditBudget}>
                        ✕ {t("budgets.cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="budget-header">
                      <h4 className="budget-name">{budget.name}</h4>
                      <div className="budget-menu">
                        <button className="btn-icon" onClick={() => startEditBudget(budget)} title={t("budgets.edit")}>
                          ✏️
                        </button>
                        <button
                          className="btn-icon danger"
                          onClick={() => deleteBudget(budget)}
                          title={t("budgets.delete")}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="budget-amounts">
                      <AutoSizeAmount amount={budget.amount} className="budget-total-amount" />
                      <div className="budget-details">
                        <div className={`budget-spent ${isOverBudget ? "over" : ""}`}>
                          {t("budgets.spent")}: {formatCurrency(budget.spent || 0)}
                        </div>
                        <div className={`budget-remaining ${remaining < 0 ? "negative" : ""}`}>
                          {remaining >= 0 ? t("budgets.remaining") : t("budgets.exceeded")}:{" "}
                          {formatCurrency(Math.abs(remaining))}
                        </div>
                      </div>
                    </div>

                    <div className="budget-progress">
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${isOverBudget ? "over" : ""}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        {percentage.toFixed(1)}% {t("budgets.used")}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {budgets.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>{t("budgets.empty.title")}</h3>
            <p>{t("budgets.empty.description")}</p>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout de dépense */}
      <div className="section-card">
        <h3 className="section-title">
          <span className="section-icon">💳</span>
          {t("expenses.title")}
        </h3>

        <div className="form-card">
          <div className="form-row">
            <div className="input-group">
              <label>{t("expenses.amount")}</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="100"
                min="0"
              />
            </div>

            <div className="input-group">
              <label>{t("expenses.description")}</label>
              <input
                type="text"
                className="form-input"
                placeholder={t("expenses.descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>{t("expenses.budget")}</label>
              <select className="form-input" value={selectedBudget} onChange={(e) => setSelectedBudget(e.target.value)}>
                <option value="">{t("expenses.budgetPlaceholder")}</option>
                {budgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name} - {formatCurrency(budget.amount - (budget.spent || 0))} {t("budgets.available")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>{t("expenses.category")}</label>
              <select
                className="form-input"
                value={isCustomCategory ? "custom" : category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">{t("expenses.categoryPlaceholder")}</option>
                {predefinedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`category.${cat}`)}
                  </option>
                ))}
                <option value="custom">{t("expenses.newCategory")}</option>
              </select>
            </div>

            {isCustomCategory && (
              <div className="input-group">
                <label>{t("expenses.newCategory")}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t("expenses.newCategoryPlaceholder")}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-large" onClick={addExpense} disabled={loading || budgets.length === 0}>
            {loading ? t("expenses.saving") : t("expenses.save")}
          </button>

          {budgets.length === 0 && <div className="alert alert-warning">⚠️ {t("message.createBudgetFirst")}</div>}
        </div>
      </div>

      {/* Liste des dépenses */}
      <div className="section-card">
        <h3 className="section-title">
          <span className="section-icon">📋</span>
          {t("expenses.history")}
          <span className="badge">{expenses.length}</span>
        </h3>

        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3>{t("expenses.empty.title")}</h3>
            <p>{t("expenses.empty.description")}</p>
          </div>
        ) : (
          <div className="expenses-list">
            {expenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                {editingExpense === expense.id ? (
                  <div className="expense-edit-form">
                    <div className="edit-form-row">
                      <input
                        type="number"
                        className="form-input"
                        placeholder={t("expenses.amount")}
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        step="100"
                        min="0"
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t("expenses.description")}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div className="edit-form-row">
                      <select
                        className="form-input"
                        value={editSelectedBudget}
                        onChange={(e) => setEditSelectedBudget(e.target.value)}
                      >
                        <option value="">{t("expenses.budgetPlaceholder")}</option>
                        {budgets.map((budget) => (
                          <option key={budget.id} value={budget.id}>
                            {budget.name}
                          </option>
                        ))}
                      </select>
                      <select
                        className="form-input"
                        value={editIsCustomCategory ? "custom" : editCategory}
                        onChange={(e) => handleEditCategoryChange(e.target.value)}
                      >
                        <option value="">{t("expenses.categoryPlaceholder")}</option>
                        {predefinedCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {t(`category.${cat}`)}
                          </option>
                        ))}
                        <option value="custom">{t("expenses.newCategory")}</option>
                      </select>
                      {editIsCustomCategory && (
                        <input
                          type="text"
                          className="form-input"
                          placeholder={t("expenses.newCategoryPlaceholder")}
                          value={editCustomCategory}
                          onChange={(e) => setEditCustomCategory(e.target.value)}
                        />
                      )}
                    </div>
                    <div className="edit-actions">
                      <button className="btn btn-success btn-sm" onClick={() => saveEditExpense(expense)}>
                        ✓ {t("budgets.save")}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={cancelEditExpense}>
                        ✕ {t("budgets.cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="expense-content">
                      <div className="expense-main">
                        <h4 className="expense-description">{expense.description}</h4>
                        <div className="expense-meta">
                          <span className="expense-category">
                            {predefinedCategories.includes(expense.category)
                              ? t(`category.${expense.category}`)
                              : expense.category}
                          </span>
                          <span className="expense-budget">{expense.budgetName}</span>
                          {expense.createdAt && (
                            <span className="expense-date">
                              {expense.createdAt.toDate().toLocaleDateString("fr-FR")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="expense-actions">
                        <div className="expense-amount auto-size-expense">-{formatCurrency(expense.amount)}</div>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => startEditExpense(expense)}
                            title={t("expenses.edit")}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => deleteExpense(expense)}
                            title={t("expenses.delete")}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
