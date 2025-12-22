// components/LanguageSwitcher.js
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

export default function LanguageSwitcher() {
  const router = useRouter()
  const { t } = useTranslation(['components'])

  const changeLanguage = async (lng) => {
    await router.push(
      router.pathname,
      router.asPath,
      { locale: lng }
    )
  }

  const languages = [
    {
      code: 'en',
      short: 'EN',
      name: t('components:languageSwitcher.english'),
    },
    {
      code: 'be-Latn',
      short: 'BY',
      name: t('components:languageSwitcher.belarusianLatin'),
    },
  ]

  return (
    <div className="language-switcher">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`language-link ${
            router.locale === lang.code ? 'active' : ''
          }`}
          title={lang.name}
        >
          <span className="flag">{lang.flag}</span>
          <span className="name">{lang.short}</span>
        </button>
      ))}

      <style jsx>{`
        .language-switcher {
          display: flex;
          gap: 0.5rem;
        }
        .language-link {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.4rem 0.8rem;
          background: #584fdb;
          color: #8dd9ff;
          border: 2px solid #ffc659;
          outline: 2px solid #fb5255;
          font-family: "So Bad", sans-serif;
          cursor: pointer;
        }
        .language-link.active {
          background: #ffc659;
          color: #584fdb;
        }
      `}</style>
    </div>
  )
}
