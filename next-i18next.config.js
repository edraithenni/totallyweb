module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'be-Latn'],
  },
  ns: ['common', 'about', 'search','components','auth','genres','playlist','profile','details','modal'], 
  defaultNS: 'common',
  localePath: typeof window === 'undefined' 
    ? require('path').resolve('./public/locales') 
    : '/public/locales',
};
