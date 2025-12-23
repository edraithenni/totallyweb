// __mocks__/next-i18next.js
module.exports = {
  useTranslation: (namespaces) => {
    return {
      t: (key, options) => {
        // Словарь переводов для тестов
        const translations = {
          // LanguageSwitcher
          'components:languageSwitcher.english': 'English',
          'components:languageSwitcher.belarusianLatin': 'Belarusian (Latin)',
          
          // Header
          'components:header.nav.signIn': 'Sign in',
          'components:header.nav.signUp': 'Sign up', 
          'components:header.nav.profile': 'Profile',
          'components:header.nav.logOut': 'Log out',
          'components:header.nav.genres': 'Genres',
          'components:header.nav.findUsers': 'Find Users',
          'common:welcome': 'Welcome',
          
          // По умолчанию - возвращаем последнюю часть ключа
          'components:': '',
          'common:': '',
        };
        
        // Если ключ есть в словаре - возвращаем перевод
        if (translations[key]) return translations[key];
        
        // Иначе возвращаем читаемую строку
        return key.replace(/^(components|common):/, '').replace(/\./g, ' ');
      },
      i18n: {
        language: 'en',
        changeLanguage: jest.fn(),
        t: function(key) { return this.t(key); }
      },
    };
  },
  Trans: ({ children, i18nKey }) => i18nKey || children,
  Translation: ({ children }) => children((t) => t('')),
  I18nextProvider: ({ children }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: () => {}
  }
};