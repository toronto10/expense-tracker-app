"use client"

import { useLanguage } from "../contexts/LanguageContext"

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="language-selector">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="language-select"
        title={t("settings.language")}
      >
        <option value="fr">🇫🇷 {t("settings.language.fr")}</option>
        <option value="en">🇺🇸 {t("settings.language.en")}</option>
      </select>
    </div>
  )
}

export default LanguageSelector
