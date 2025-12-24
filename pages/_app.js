import "@/styles/globals.css";
import { appWithTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { initLogger } from '@/lib/console-logger';

function App({ Component, pageProps }) {
  useEffect(() => {
    initLogger();
  }, []);
  return <Component {...pageProps} />;
}

export default appWithTranslation(App);