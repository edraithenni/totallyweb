import Head from "next/head";
import { useEffect, useState } from "react";
import SignInModal from "./SignInModal";
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from 'next-i18next'


export default function Header() {
  const { t } = useTranslation(['components', 'common']);
  const [loggedIn, setLoggedIn] = useState(false);
  const [signOpen, setSignOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        setLoggedIn(res.ok);
      } catch {
        setLoggedIn(false);
      }
    })();
  }, []);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setLoggedIn(false);
    } catch (err) {
      alert(err.message || t('components:header.messages.logoutError'));
    }
  }

  return (
    <>
      <Head>
        <link href="https://fonts.cdnfonts.com/css/so-bad" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <header>
        <h1 onClick={() => (window.location.href = "/search")}>
          {t('header.title')}
        </h1>
        <nav>
          <button
            className="secondary"
            onClick={() => (window.location.href = "/genres")}
          >
            {t('components:header.nav.genres')}
          </button>
          <button
            className="secondary"
            onClick={() => (window.location.href = "/SearchUsers")}
          >
            {t('components:header.nav.findUsers')}
          </button>

          {!loggedIn ? (
            <>
              <button className="primary" onClick={() => setSignOpen(true)}>
                {t('components:header.nav.signIn')}
              </button>
              <button
                className="secondary"
                onClick={() => (window.location.href = "/auth")}
              >
                {t('components:header.nav.signUp')}
              </button>
            </>
          ) : (
            <>
              <button
                className="secondary"
                onClick={() => (window.location.href = "/profile")}
              >
                {t('components:header.nav.profile')}
              </button>
              <button className="secondary" onClick={logout}>
                {t('components:header.nav.logOut')}
              </button>
            </>
          )}
        </nav>
        <LanguageSwitcher />
      </header>

      <SignInModal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        onSuccess={() => setLoggedIn(true)}
        t={t}
      />

      <style jsx>{`
        @font-face {
          font-family: 'Basiic';
          src: url('/src/basiic.ttf') format('truetype');
        }

        header {
          background: url('/src/hat.png') repeat center top;
          height: 120px;
          background-size: auto;
          display: flex;
          align-items: center;
          padding: 0 12px;
        }
        header h1 {
          font-family: "So Bad", sans-serif;
          font-size: 3.5rem;
          letter-spacing: 0.5px;
          margin: 0;
          color: #584fdb;
          text-shadow:
            -1px -1px 0 #ffc659,
            1px -1px 0 #ffc659,
            -1px  1px 0 #ffc659,
            1px  1px 0 #ffc659,
            -2px -2px 0 #fb5255,
            2px -2px 0 #fb5255,
            -2px  2px 0 #fb5255,
            2px  2px 0 #fb5255;
          cursor: pointer;
        }
        header nav {
          margin-left: auto;
          display: flex;
          gap: 0.5rem;
        }
        nav button {
          margin-left: 0.5rem;
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: "So Bad", sans-serif;
          white-space: nowrap;
        }
        nav button.primary {
          background: #584fdb;
          color: #8dd9ff;
          border-radius: 0;
          border: 2px solid #ffc659;
          outline: 2px solid #fb5255;
          outline-offset: 0;
        }
        nav button.secondary {
          background: #584fdb;
          color: #8dd9ff;
          border-radius: 0;
          border: 2px solid #ffc659;
          outline: 2px solid #fb5255;
          outline-offset: 0;
        }
        
        :global(.language-switcher) {
          margin-left: 1rem;
        }

        @media (max-width: 768px) {
          header {
            height: 100px;
            padding: 0 8px;
            flex-wrap: wrap;
            justify-content: space-between;
            position: relative;
          }
          
          header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            width: auto;
            order: 1;
          }
          
          header nav {
            margin-left: 0;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.3rem;
            order: 3;
            width: 100%;
            margin-top: 0.5rem;
          }
          
          nav button {
            margin-left: 0;
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
            min-height: 38px;
            min-width: auto;
          }
          
          :global(.language-switcher) {
            position: absolute;
            top: 10px;
            right: 10px;
            margin-left: 0;
            order: 2;
          }
          
          :global(.language-switcher .language-link) {
            padding: 0.3rem 0.6rem;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          header {
            height: auto;
            min-height: 90px;
            padding: 0.5rem;
          }
          
          header h1 {
            font-size: 2rem;
            margin-bottom: 0.3rem;
          }
          
          header nav {
            gap: 0.25rem;
          }
          
          nav button {
            padding: 0.35rem 0.7rem;
            font-size: 0.85rem;
            min-height: 36px;
          }
        }

        @media (max-width: 360px) {
          header h1 {
            font-size: 1.8rem;
          }
          
          nav button {
            padding: 0.3rem 0.6rem;
            font-size: 0.8rem;
            min-height: 34px;
          }
        }
      `}</style>
    </>
  );
}