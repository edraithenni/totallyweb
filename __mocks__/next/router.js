
const useRouter = jest.fn();

useRouter.mockImplementation(() => ({
  locale: 'en',
  locales: ['en', 'be-Latn'],
  defaultLocale: 'en',
  pathname: '/',
  asPath: '/',
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isReady: true,
  isFallback: false,
  isPreview: false,
  isLocaleDomain: false,
}));

module.exports = {
  useRouter,
  Router: {
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  },
};