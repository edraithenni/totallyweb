// __mocks__/next-i18next.js
module.exports = {
  useTranslation: (namespace) => {
    const mockT = (key, options) => {
      // Если options.defaultValue существует, используем его
      if (options?.defaultValue) {
        return options.defaultValue;
      }
      
      // Создаем понятный текст из ключа
      // Примеры:
      // "reviewForm.buttons.submit" -> "reviewForm buttons submit"
      // "reviewForm:buttons.submit" -> "reviewForm buttons submit"
      // "playlist.modal.title" -> "playlist modal title"
      
      const cleanedKey = key.replace(/[:.]/g, ' ');
      
      // Если ключ уже в правильном формате, возвращаем как есть
      if (key.includes('reviewForm') || key.includes('playlist')) {
        return cleanedKey;
      }
      
      // Иначе преобразуем camelCase в слова
      return cleanedKey
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .replace(/^\w/, c => c.toUpperCase());
    };

    return {
      t: mockT,
      i18n: {
        language: 'en',
        changeLanguage: jest.fn(),
        t: mockT,
      },
    };
  },
  
  Trans: ({ children, i18nKey, values }) => {
    if (i18nKey) {
      return i18nKey.replace(/[:.]/g, ' ');
    }
    return children;
  },
  
  Translation: ({ children }) => children((t, options) => t('', options)),
  I18nextProvider: ({ children }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: () => {}
  }
};