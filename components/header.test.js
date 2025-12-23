
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from './header';
import '@testing-library/jest-dom';


jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: jest.fn(),
  }),
}));


jest.mock('./SignInModal', () => {
  const MockSignInModal = ({ isOpen, onClose, onSuccess }) => {
    return (
      <div data-testid="signin-modal">
        {isOpen ? 'OPEN' : 'CLOSED'}
        {isOpen && <button onClick={() => onSuccess({ user: 'test' })}>Mock Login</button>}
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

  test('shows Sign in + Sign up when user is NOT logged in', () => {
  render(<Header />);
  
  expect(screen.getByText('Sign in')).toBeInTheDocument();
  expect(screen.getByText('Sign up')).toBeInTheDocument();
  

  const genresButtons = screen.getAllByText('Genres');
  expect(genresButtons.length).toBeGreaterThanOrEqual(1);
  
  expect(screen.getByText('Find Users')).toBeInTheDocument();
});


});