import { useState, useEffect } from "react";
import { translate, getCurrentLanguage, LanguageCode } from "@/lib/translations";

/**
 * useTranslation Hook
 * Usage:
 *   const { t, lang, setLang } = useTranslation();
 *   t("common.save") // Returns translated string
 *   setLang("ENG") // Switch language
 */
export function useTranslation() {
  const [lang, setLangState] = useState<LanguageCode>("VN");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get current language from localStorage on mount
    const currentLang = getCurrentLanguage();
    setLangState(currentLang);
    setMounted(true);

    // Listen for language changes from LanguageSelector
    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<LanguageCode>;
      if (customEvent.detail) {
        setLangState(customEvent.detail);
      }
    };

    window.addEventListener("tbs_lang_changed", handleLanguageChange);
    return () => {
      window.removeEventListener("tbs_lang_changed", handleLanguageChange);
    };
  }, []);

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tbs_lang", newLang);
        window.dispatchEvent(new CustomEvent("tbs_lang_changed", { detail: newLang }));
      } catch (e) {
        console.error("Failed to save language preference:", e);
      }
    }
  };

  /**
   * Translate a key to current language
   * @param keyPath Dot-separated path like "common.save" or "business_trip.title"
   * @param fallback Optional fallback value if translation not found
   */
  const t = (keyPath: string, fallback?: string): string => {
    const result = translate(keyPath, lang);
    return result === keyPath && fallback ? fallback : result;
  };

  return { t, lang, setLang, mounted };
}

export default useTranslation;
