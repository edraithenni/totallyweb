import { render, screen, fireEvent } from '@testing-library/react';
import Header from './header';
import '@testing-library/jest-dom';

// Мок для next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
  }),
}));

// Мок для next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      // Простые переводы для тестов
      const translations = {
        'header.title': 'Cineparea',
        'header.nav.genres': 'Genres',
        'header.nav.findUsers': 'Find users',
        'header.nav.signIn': 'Sign in',
        'header.nav.signUp': 'Sign up',
        'header.nav.profile': 'Profile',
        'header.nav.logOut': 'Log out',
        'common:welcome': 'Welcome',
      };
      
      return translations[key] || key.split('.').pop();
    },
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
  Trans: ({ children, i18nKey }) => i18nKey || children,
}));

// Мок для SignInModal
jest.mock('./SignInModal', () => {
  const MockSignInModal = ({ isOpen }) => {
    return (
      <div data-testid="signin-modal">
        {isOpen ? 'OPEN' : 'CLOSED'}
      </div>
    );
  };
  MockSignInModal.displayName = 'MockSignInModal';
  return MockSignInModal;
});

describe('Header component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders header with title and navigation', () => {
    render(<Header />);
    
    // Проверяем заголовок
    expect(screen.getByText('Cineparea')).toBeInTheDocument();
    
    // Проверяем навигационные кнопки
    expect(screen.getByText('Genres')).toBeInTheDocument();
    expect(screen.getByText('Find users')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  test('opens sign in modal when Sign in button is clicked', () => {
    render(<Header />);
    
    // Сначала модальное окно закрыто
    expect(screen.getByTestId('signin-modal')).toHaveTextContent('CLOSED');
    
    // Нажимаем кнопку Sign in
    const signInButton = screen.getByText('Sign in');
    fireEvent.click(signInButton);
    
    // Модальное окно должно открыться
    expect(screen.getByTestId('signin-modal')).toHaveTextContent('OPEN');
  });

  test('renders language switcher', () => {
    render(<Header />);
    
    // Проверяем наличие кнопок переключения языка
    // Они могут показывать EN и BY или полные названия
    const languageButtons = screen.getAllByRole('button');
    const hasLanguageSwitcher = languageButtons.some(button => 
      button.textContent === 'EN' || button.textContent === 'BY'
    );
    
    expect(hasLanguageSwitcher).toBe(true);
  });

  test('has correct button classes', () => {
    render(<Header />);
    
    // Проверяем, что кнопки имеют правильные классы
    const signInButton = screen.getByText('Sign in');
    expect(signInButton).toHaveClass('primary');
    
    const signUpButton = screen.getByText('Sign up');
    expect(signUpButton).toHaveClass('secondary');
  });
});